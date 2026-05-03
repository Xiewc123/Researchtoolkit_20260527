<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Collection, Expand, Fold, Monitor } from '@element-plus/icons-vue'
import { resolveRouteByMenuIndex, workbenchModules } from './workbench/modules'

const router = useRouter()
const route = useRoute()
const collapsed = ref(false)

const activeMenu = computed(() => {
  const path = route.path.replace(/^\//, '')
  return path === '' ? 'home' : path
})

const asideWidth = computed(() => (collapsed.value ? '72px' : '280px'))

const handleSelect = (key: string) => {
  router.push(resolveRouteByMenuIndex(key))
}
</script>

<template>
  <el-container class="app-container" :class="{ collapsed }">
    <el-aside :width="asideWidth" class="sidebar">
      <button class="collapse-toggle" :title="collapsed ? '展开侧边栏' : '收起侧边栏'" @click="collapsed = !collapsed">
        <el-icon><component :is="collapsed ? Expand : Fold" /></el-icon>
      </button>

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
          <strong>科研工具台</strong>
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

      <div class="sidebar-footer">
        <span>本地桌面工作流</span>
        <strong>v0.3 统一风格版</strong>
      </div>
    </el-aside>

    <el-main class="main-content">
      <router-view />
    </el-main>
  </el-container>
</template>

<style>
* { box-sizing: border-box; }
html, body, #app { height: 100%; margin: 0; padding: 0; }
body { font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Microsoft YaHei", Arial, sans-serif; background: #f4f7fb; }
.app-container { height: 100%; }
.sidebar { background: #f8f9fa; border-right: 1px solid #e9ecef; padding: 1rem 0; position: relative; transition: width .18s ease; overflow: hidden; }
.collapse-toggle { position: absolute; top: 10px; right: 10px; z-index: 2; width: 28px; height: 28px; display: grid; place-items: center; border: 1px solid #dbe7ec; background: #fff; color: #2f6f84; border-radius: 8px; cursor: pointer; }
.brand-block { display: flex; align-items: center; gap: 1rem; padding: 1rem; margin-bottom: 1rem; min-height: 72px; }
.brand-mark { width: 2.8rem; height: 2.8rem; background: linear-gradient(135deg, #2f6f84 0%, #1e5a6e 100%); border-radius: 12px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.5rem; flex-shrink: 0; }
.brand-copy { min-width: 0; }
.brand-block h1 { font-size: 1.125rem; font-weight: 900; margin: 0; color: #1e293b; white-space: nowrap; }
.brand-block p { font-size: .7rem; color: #94a3b8; margin: 2px 0 0; letter-spacing: 1px; white-space: nowrap; }
.sidebar-status { display:flex; align-items:center; justify-content:space-between; padding:.875rem 1rem; margin:0 1rem 1rem; background:linear-gradient(135deg,#f0f9ff 0%,#f5f9ff 100%); border:1px solid #cffafe; border-radius:10px; }
.sidebar-status span { display: block; font-size: .75rem; color: #0369a1; }
.sidebar-status strong { display: block; margin-top: 4px; color: #1e293b; font-size:.9rem; white-space: nowrap; }
.nav-menu { border:none; background:transparent; padding:0 .5rem; }
.nav-menu.el-menu--collapse { width: auto; }
.nav-item { margin:.375rem 0; border-radius:10px; padding:0 .5rem !important; height:70px !important; display:flex !important; align-items:center !important; }
.nav-item:hover { background: rgba(47,111,132,.08) !important; }
.el-menu-item.is-active { background: linear-gradient(135deg, rgba(47,111,132,.12) 0%, rgba(79,174,217,.08) 100%) !important; border-left:3px solid #2f6f84 !important; padding-left: calc(.5rem - 3px) !important; }
.nav-copy { display:flex; flex-direction:column; gap:2px; min-width: 0; }
.nav-copy span { font-size:.9rem; font-weight:700; color:#1e293b; }
.nav-copy small { font-size:.7rem; color:#94a3b8; }
.sidebar-footer { position:absolute; bottom:1.5rem; left:1rem; right:1rem; text-align:center; padding:1rem; background:linear-gradient(135deg,#f0f9ff 0%,#f5f9ff 100%); border:1px solid #cffafe; border-radius:10px; }
.sidebar-footer span { font-size: .75rem; color: #0369a1; }
.sidebar-footer strong { display:block; margin-top:4px; color:#1e293b; font-size:.9rem; white-space: nowrap; }
.collapsed .brand-block { justify-content: center; padding: 1rem .75rem; }
.collapsed .brand-copy, .collapsed .sidebar-status, .collapsed .sidebar-footer { display: none; }
.collapsed .nav-menu { padding: 0 .35rem; }
.collapsed .nav-item { justify-content: center; height: 48px !important; }
.collapsed .el-menu-item.is-active { padding-left: calc(.5rem - 3px) !important; }
.main-content { padding: 20px 24px; overflow: auto; min-width: 0; }
button, input, textarea, select { font-family: inherit; }
</style>
