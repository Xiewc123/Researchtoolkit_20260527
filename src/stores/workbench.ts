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
        this.state = normalizeState(data)
      } catch (err) {
        console.error('Failed to load state:', err)
        this.state = normalizeState(readBrowserFallback())
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
    }
  }
})
