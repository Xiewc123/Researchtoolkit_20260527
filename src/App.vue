<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Collection, Monitor } from '@element-plus/icons-vue'
import { resolveRouteByMenuIndex, workbenchModules } from './workbench/modules'

const router = useRouter()
const route = useRoute()

const activeMenu = computed(() => {
  const path = route.path.replace(/^\//, '')
  return path === '' ? 'home' : path
})

const handleSelect = (key: string) => {
  router.push(resolveRouteByMenuIndex(key))
}
</script>

<template>
  <el-container class="app-container">
    <el-aside width="280px" class="sidebar">
      <div class="brand-block">
        <div class="brand-mark">
          <el-icon><Collection /></el-icon>
        </div>
        <div>
          <h1>科研工具箱</h1>
          <p>Research Toolkit</p>
        </div>
      </div>

      <div class="sidebar-status">
        <div>
          <span>工具箱模式</span>
          <strong>科研工具台</strong>
        </div>
        <el-icon><Monitor /></el-icon>
      </div>

      <el-menu :default-active="activeMenu" class="nav-menu" @select="handleSelect">
        <el-menu-item v-for="item in workbenchModules" :key="item.index" :index="item.index" class="nav-item">
          <el-icon><component :is="item.icon" /></el-icon>
          <div class="nav-copy">
            <span>{{ item.title }}</span>
            <small>{{ item.desc }}</small>
          </div>
        </el-menu-item>
      </el-menu>

      <div class="sidebar-footer">
        <span>工具箱模式</span>
        <strong>v0.3 风格统一版</strong>
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
.sidebar { background: #f8f9fa; border-right: 1px solid #e9ecef; padding: 1rem 0; position: relative; }
.brand-block { display: flex; align-items: center; gap: 1rem; padding: 1rem; margin-bottom: 1rem; }
.brand-mark { width: 2.8rem; height: 2.8rem; background: linear-gradient(135deg, #2f6f84 0%, #1e5a6e 100%); border-radius: 12px; display:flex; align-items:center; justify-content:center; color:#fff; font-size:1.5rem; }
.brand-block h1 { font-size: 1.125rem; font-weight: 900; margin: 0; color: #1e293b; }
.brand-block p { font-size: .7rem; color: #94a3b8; margin: 2px 0 0; letter-spacing: 1px; }
.sidebar-status { display:flex; align-items:center; justify-content:space-between; padding:.875rem 1rem; margin:0 1rem 1rem; background:linear-gradient(135deg,#f0f9ff 0%,#f5f9ff 100%); border:1px solid #cffafe; border-radius:10px; }
.nav-menu { border:none; background:transparent; padding:0 .5rem; }
.nav-item { margin:.375rem 0; border-radius:10px; padding:0 .5rem !important; height:70px !important; display:flex !important; align-items:center !important; }
.nav-item:hover { background: rgba(47,111,132,.08) !important; }
.el-menu-item.is-active { background: linear-gradient(135deg, rgba(47,111,132,.12) 0%, rgba(79,174,217,.08) 100%) !important; border-left:3px solid #2f6f84 !important; padding-left: calc(.5rem - 3px) !important; }
.nav-copy { display:flex; flex-direction:column; gap:2px; }
.nav-copy span { font-size:.9rem; font-weight:700; color:#1e293b; }
.nav-copy small { font-size:.7rem; color:#94a3b8; }
.sidebar-footer { position:absolute; bottom:1.5rem; left:1rem; right:1rem; text-align:center; padding:1rem; background:linear-gradient(135deg,#f0f9ff 0%,#f5f9ff 100%); border:1px solid #cffafe; border-radius:10px; }
.sidebar-footer span { font-size: .75rem; color: #0369a1; }
.sidebar-footer strong { display:block; margin-top:4px; color:#1e293b; font-size:.9rem; }
.main-content { padding: 20px 24px; overflow: auto; }
</style>
