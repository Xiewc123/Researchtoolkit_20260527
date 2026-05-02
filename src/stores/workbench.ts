import { defineStore } from 'pinia'
import { invoke } from '@tauri-apps/api/core'
import { normalizeState, defaultState } from '../workbench/store'

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
        this.state = normalizeState(data as any)
      } catch (err) {
        console.error('Failed to load state:', err)
        this.error = 'Failed to load workspace state'
        this.state = defaultState()
      } finally {
        this.loading = false
      }
    },

    async saveState() {
      try {
        await invoke('save_workspace_state', { data: JSON.stringify(this.state) })
      } catch (err) {
        console.error('Failed to save state:', err)
        this.error = 'Failed to save workspace state'
      }
    },

    updateState(updater: (state: any) => void) {
      updater(this.state)
      this.saveState()
    }
  }
})