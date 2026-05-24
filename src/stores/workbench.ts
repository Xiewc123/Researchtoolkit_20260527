import { defineStore } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { defaultState, normalizeState, touchState } from '../workbench/store'
import type { WorkbenchState } from '../workbench/types'
import { uid } from '../workbench/utils'

const STORAGE_KEY = 'researchtoolkit.workspace.state'

const readBrowserFallback = () => {
  try {
    return localStorage.getItem(STORAGE_KEY) || '{}'
  } catch {
    return '{}'
  }
}

const writeBrowserFallback = (state: WorkbenchState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage may be unavailable in some embedded contexts.
  }
}

const normalizeDateTime = (value: string) => value.replace('T', ' ').slice(0, 16)

const parseProjectMarkdown = (content: string, projectId: string) => {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const logs: Array<{ id: string; projectId: string; content: string; createdAt: string }> = []
  let currentDate = ''
  let currentTime = ''
  let body: string[] = []

  const flush = () => {
    const text = body.join('\n').trim()
    if (!currentDate || !currentTime || !text) return
    logs.push({
      id: uid('plog'),
      projectId,
      createdAt: `${currentDate} ${currentTime.slice(0, 5)}`,
      content: text,
    })
  }

  for (const line of lines) {
    const dateMatch = line.match(/^##\s+(\d{4}-\d{2}-\d{2})\s*$/)
    const timeMatch = line.match(/^###\s+(\d{1,2}:\d{2})(?::\d{2})?\s*$/)
    if (dateMatch) {
      flush()
      currentDate = dateMatch[1]
      currentTime = ''
      body = []
      continue
    }
    if (timeMatch) {
      flush()
      currentTime = timeMatch[1].padStart(5, '0')
      body = []
      continue
    }
    if (currentDate && currentTime) body.push(line)
  }
  flush()

  return logs
}

const renderProjectMarkdown = (title: string, logs: any[]) => {
  const grouped = new Map<string, Array<{ time: string; content: string }>>()
  const sorted = [...logs].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))

  for (const log of sorted) {
    const stamp = normalizeDateTime(String(log.createdAt || ''))
    const date = stamp.slice(0, 10)
    const time = stamp.slice(11, 16)
    if (!date || !time || !String(log.content || '').trim()) continue
    if (!grouped.has(date)) grouped.set(date, [])
    grouped.get(date)!.push({ time, content: String(log.content).trim() })
  }

  const parts = [`# ${title} - 项目推进日志`]
  for (const [date, entries] of grouped) {
    parts.push(`## ${date}`)
    for (const entry of entries) {
      parts.push(`### ${entry.time}`)
      parts.push(entry.content)
    }
  }
  return `${parts.join('\n')}\n`
}

export const useWorkbenchStore = defineStore('workbench', {
  state: () => ({
    state: defaultState(),
    loading: false,
    error: null as string | null
  }),

  actions: {
    async loadState() {
      this.loading = true
      this.error = null
      try {
        const data = await invoke('load_workspace_state')
        this.state = normalizeState(typeof data === 'string' ? JSON.parse(data) : data)
      } catch (err) {
        console.error('Failed to load state:', err)
        this.state = normalizeState(JSON.parse(readBrowserFallback()))
      } finally {
        this.loading = false
      }
    },

    async saveState() {
      try {
        writeBrowserFallback(this.state)
        await invoke('save_workspace_state', { data: JSON.stringify(this.state) })
      } catch (err) {
        console.error('Failed to save state:', err)
        writeBrowserFallback(this.state)
        this.error = '工作台数据已保存到浏览器本地存储，Tauri 持久化暂不可用。'
      }
    },

    async replaceState(raw: unknown) {
      this.state = normalizeState(raw)
      touchState(this.state)
      await this.saveState()
    },

    async updateState(updater: (state: WorkbenchState) => void) {
      updater(this.state)
      touchState(this.state)
      await this.saveState()
    },

    async importProjectMarkdown(projectId: string) {
      if (!projectId || projectId === 'overview') return false
      const project = this.state.projects.find(p => p.id === projectId)
      if (!project?.mdPath) return false

      try {
        const content = await invoke<string>('read_markdown_file', { path: project.mdPath })
        const externalLogs = parseProjectMarkdown(content || '', projectId)
        if (!externalLogs.length) return false

        const localOtherLogs = this.state.projectLogs.filter(log => log.projectId !== projectId)
        const merged = new Map<string, any>()

        for (const log of this.state.projectLogs.filter(log => log.projectId === projectId)) {
          const key = `${normalizeDateTime(String(log.createdAt || ''))}|${String(log.content || '').trim()}`
          merged.set(key, log)
        }
        for (const log of externalLogs) {
          const key = `${normalizeDateTime(log.createdAt)}|${log.content.trim()}`
          if (!merged.has(key)) merged.set(key, log)
        }

        this.state.projectLogs = [...localOtherLogs, ...merged.values()]
        touchState(this.state)
        await this.saveState()
        return true
      } catch (err) {
        console.error('Failed to import markdown:', err)
        this.error = `读取 Markdown 失败：${project.mdPath}`
        return false
      }
    },

    async syncProjectMarkdown(projectId: string, options: { importBefore?: boolean } = {}) {
      if (!projectId || projectId === 'overview') return
      const project = this.state.projects.find(p => p.id === projectId)
      if (!project?.mdPath) return

      if (options.importBefore) await this.importProjectMarkdown(projectId)

      const logs = this.state.projectLogs.filter(log => log.projectId === projectId)
      const content = renderProjectMarkdown(project.title, logs)
      try {
        await invoke('write_markdown_file', {
          path: project.mdPath,
          content,
        })
      } catch (err) {
        console.error('Failed to sync markdown:', err)
        this.error = `Markdown 同步失败：${project.mdPath}`
      }
    }
  }
})
