<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Collection, Delete, Download, Expand, Fold, Headset, Monitor, Upload } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { resolveRouteByMenuIndex, workbenchModules } from './workbench/modules'
import { useWorkbenchStore } from './stores/workbench'

const router = useRouter()
const route = useRoute()
const store = useWorkbenchStore()
const collapsed = ref(false)
const musicUrl = ref('')
const musicName = ref('')
const audioRef = ref<HTMLAudioElement | null>(null)
const musicPlaying = ref(false)
const importInput = ref<HTMLInputElement | null>(null)
const musicInput = ref<HTMLInputElement | null>(null)

const activeMenu = computed(() => {
  const path = route.path.replace(/^\//, '')
  return path === '' ? 'home' : path
})

const asideWidth = computed(() => (collapsed.value ? '72px' : '280px'))

const handleSelect = (key: string) => {
  router.push(resolveRouteByMenuIndex(key))
}

const exportData = async () => {
  try {
    const path = await store.exportStateToFile()
    ElMessage.success(`数据已导出：${path}`)
  } catch {
    const payload = JSON.stringify(store.exportSnapshot(), null, 2)
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `researchtoolkit-data-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }
}

const importData = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  try {
    const text = await file.text()
    const data = JSON.parse(text)
    await ElMessageBox.confirm('导入会替换当前工作台数据，建议先导出备份。确认继续？', '导入数据', { type: 'warning' })
    await store.replaceState(data)
    ElMessage.success('数据已导入')
  } catch (error) {
    if (error !== 'cancel') ElMessage.error('导入失败，请确认文件是有效的 JSON 数据')
  } finally {
    if (importInput.value) importInput.value.value = ''
  }
}

const clearAllData = async () => {
  await ElMessageBox.confirm('这会清空日程、任务、项目、日志等全部工作台数据。建议先导出备份。确认清空？', '清空所有数据', {
    type: 'warning',
    confirmButtonText: '清空',
    cancelButtonText: '取消',
    confirmButtonClass: 'el-button--danger',
  })
  await store.clearAllData()
  ElMessage.success('所有工作台数据已清空')
}

const chooseMusic = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  if (musicUrl.value) URL.revokeObjectURL(musicUrl.value)
  musicUrl.value = URL.createObjectURL(file)
  musicName.value = file.name
  musicPlaying.value = false
  ElMessage.success('已选择背景音乐')
}

const toggleMusic = async () => {
  if (!audioRef.value || !musicUrl.value) {
    musicInput.value?.click()
    return
  }
  if (musicPlaying.value) {
    audioRef.value.pause()
    musicPlaying.value = false
  } else {
    await audioRef.value.play()
    musicPlaying.value = true
  }
}

onMounted(async () => {
  await store.loadState()
})
</script>

<template>
  <el-container class="app-container" :class="{ collapsed }">
    <el-aside :width="asideWidth" class="sidebar">
      <div class="brand-block">
        <div class="brand-mark">
          <el-icon><Collection /></el-icon>
        </div>
        <div class="brand-copy">
          <h1>科研工具箱</h1>
          <p>Research Toolkit</p>
        </div>
      </div>

      <div class="sidebar-status">
        <div>
          <span>工作台模式</span>
          <strong>本地桌面工作流</strong>
        </div>
        <el-icon><Monitor /></el-icon>
      </div>

      <el-menu :default-active="activeMenu" :collapse="collapsed" class="nav-menu" @select="handleSelect">
        <el-menu-item v-for="item in workbenchModules" :key="item.index" :index="item.index" class="nav-item">
          <el-icon><component :is="item.icon" /></el-icon>
          <template #title>
            <div class="nav-copy">
              <span>{{ item.title }}</span>
              <small>{{ item.desc }}</small>
            </div>
          </template>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-tools">
        <div class="tool-row">
          <el-button :icon="Upload" size="small" title="导入数据" @click="importInput?.click()" />
          <el-button :icon="Download" size="small" title="导出数据" @click="exportData" />
          <el-button :icon="Delete" size="small" type="danger" plain title="清空所有数据" @click="clearAllData" />
          <el-button :icon="Headset" size="small" :type="musicPlaying ? 'primary' : 'default'" :title="musicName || '选择背景音乐'" @click="toggleMusic" />
        </div>
        <small v-if="musicName" class="music-name">{{ musicName }}</small>
      </div>

      <button class="collapse-toggle" :title="collapsed ? '展开侧边栏' : '收起侧边栏'" @click="collapsed = !collapsed">
        <el-icon><component :is="collapsed ? Expand : Fold" /></el-icon>
      </button>

      <input ref="importInput" type="file" accept="application/json,.json" hidden @change="importData" />
      <input ref="musicInput" type="file" accept="audio/*" hidden @change="chooseMusic" />
      <audio ref="audioRef" :src="musicUrl" loop />
    </el-aside>

    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<style>
* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; padding: 0; overflow: hidden; }
body { font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", Arial, sans-serif; background: #f4f7fb; }
.app-container { height: 100%; overflow: hidden; }
.sidebar { background: #f8f9fa; border-right: 1px solid #e9ecef; padding: 1rem 0 5rem; position: relative; transition: width .2s ease; overflow: hidden !important; }
.collapse-toggle { position: absolute; left: 1rem; bottom: 1rem; z-index: 2; width: 36px; height: 36px; display: grid; place-items: center; border: 1px solid #dbe7ec; background: #fff; color: #2f6f84; border-radius: 8px; cursor: pointer; }
.brand-block { display: flex; align-items: center; gap: 1rem; padding: 1rem; margin-bottom: .75rem; min-height: 72px; }
.brand-mark { width: 2.8rem; height: 2.8rem; background: #2f6f84; border-radius: 10px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.5rem; flex-shrink: 0; }
.brand-copy { min-width: 0; opacity: 1; transition: opacity .16s ease; }
.brand-block h1 { font-size: 1.125rem; font-weight: 900; margin: 0; color: #1e293b; white-space: nowrap; line-height: 1.2; }
.brand-block p { font-size: .75rem; color: #64748b; margin: 3px 0 0; white-space: nowrap; line-height: 1.2; }
.sidebar-status { display:flex; align-items:center; justify-content:space-between; padding:.875rem 1rem; margin:0 1rem 1rem; background:#eef8fb; border:1px solid #cffafe; border-radius:8px; transition: opacity .16s ease; }
.sidebar-status span { display: block; font-size: .75rem; color: #0369a1; line-height: 1.2; }
.sidebar-status strong { display: block; margin-top: 4px; color: #1e293b; font-size:.9rem; white-space: nowrap; line-height: 1.2; }
.nav-menu { border:none; background:transparent; padding:0 .5rem; overflow: hidden; }
.nav-menu.el-menu--collapse { width: auto; }
.nav-item { margin:.375rem 0; border-radius:8px; padding:0 .5rem !important; height:58px !important; display:flex !important; align-items:center !important; }
.nav-item:hover { background: rgba(47,111,132,.08) !important; }
.el-menu-item.is-active { background: rgba(47,111,132,.12) !important; border-left:3px solid #2f6f84 !important; padding-left: calc(.5rem - 3px) !important; }
.nav-copy { display:flex; flex-direction:column; gap:3px; min-width: 0; line-height: 1.15; }
.nav-copy span { font-size:.9rem; font-weight:700; color:#1e293b; }
.nav-copy small { font-size:.72rem; color:#64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.sidebar-tools { position:absolute; bottom:1rem; left:3.75rem; right:1rem; padding:.75rem; background:#fff; border:1px solid #e2e8f0; border-radius:8px; transition: opacity .16s ease, transform .16s ease; }
.tool-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; }
.tool-row .el-button,
.tool-row .el-button + .el-button {
  width: 100%;
  min-width: 0;
  margin-left: 0 !important;
  padding-left: 0;
  padding-right: 0;
}
.music-name { display: block; margin-top: 6px; color: #64748b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.collapsed .brand-block { justify-content: center; padding: 1rem .75rem; }
.collapsed .brand-copy, .collapsed .sidebar-status, .collapsed .sidebar-tools { opacity: 0; pointer-events: none; transform: translateX(-8px); }
.collapsed .nav-menu { padding: 0 .35rem; overflow: hidden; }
.collapsed .nav-item { justify-content: center; height: 48px !important; }
.collapsed .el-menu-item.is-active { padding-left: calc(.5rem - 3px) !important; }
.el-popper.is-dark { background: #fff !important; color: #111827 !important; border: 1px solid #dbe7ec !important; box-shadow: 0 2px 8px rgba(15,23,42,.12) !important; }
.el-popper.is-dark .el-popper__arrow::before { background: #fff !important; border: 1px solid #dbe7ec !important; }
.main-content { padding: 20px 24px; overflow: auto; min-width: 0; }
button, input, textarea, select { font-family: inherit; }
</style>
