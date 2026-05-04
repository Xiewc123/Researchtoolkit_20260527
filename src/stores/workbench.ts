import { defineStore } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { defaultState, normalizeState, touchState } from '../workbench/store'
import type { WorkbenchState } from '../workbench/types'

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
        // 假设 normalizeState 接受字符串或对象并返回合法的 WorkbenchState
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
        this.error = '工作台数据已保存到浏览器本地存储，Tauri 持久化暂不可用'
      }
    },

    async updateState(updater: (state: WorkbenchState) => void) {
      updater(this.state)
      touchState(this.state)
      await this.saveState()
    },

    // ================= 新增：同步特定项目的日志到 MD 文件 =================
    async syncProjectMarkdown(projectId: string) {
      if (!projectId || projectId === 'overview') return

      const project = this.state.projects.find(p => p.id === projectId)
      if (!project || !project.mdPath) return // 如果项目不存在或没有设置 mdPath，则不同步

      // 1. 获取该项目的所有日志并按时间倒序排列 (新的在上)
      const logs = this.state.projectLogs
        .filter(log => log.projectId === projectId)
        .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))

      if (logs.length === 0) return

      // 2. 按日期对日志进行分组
      const groupedLogs: Record<string, { time: string, content: string }[]> = {}
      logs.forEach(log => {
        // 解析时间，兼容 YYYY-MM-DD HH:mm:ss 和 带 T 的格式
        const dateStr = log.createdAt?.replace('T', ' ') || ''
        const date = dateStr.slice(0, 10) // 提取 YYYY-MM-DD
        const time = dateStr.slice(11, 19) // 提取 HH:mm:ss

        if (!groupedLogs[date]) groupedLogs[date] = []
        groupedLogs[date].push({ time, content: log.content })
      })

      // 3. 拼接 Markdown 文本
      let mdContent = `# ${project.title} - 项目推进日志\n\n`
      for (const date of Object.keys(groupedLogs)) {
        mdContent += `## ${date}\n\n`
        groupedLogs[date].forEach(entry => {
          mdContent += `### ${entry.time}\n${entry.content}\n\n`
        })
      }

      // 4. 调用 Rust 侧的命令写入任意绝对路径
      try {
        await invoke('write_markdown_file', { 
          path: project.mdPath, 
          content: mdContent 
        })
        console.log(`Markdown 同步成功: ${project.mdPath}`)
      } catch (err) {
        console.error('同步 Markdown 失败, 请检查路径是否正确:', err)
        this.error = `Markdown 同步失败: 路径可能有误 (${project.mdPath})`
      }
    }
  }
})