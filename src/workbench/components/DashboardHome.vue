<template>
  <div class="dashboard-home">
    <!-- 顶部标题栏（参照朝代年号表设计） -->
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><Monitor /></el-icon>
          <div>
            <h2>工作台总览</h2>
            <p>Daily Workbench Summary &amp; Quick Navigation</p>
          </div>
        </div>
        <div class="status-board">
          <div class="status-item">
            <span class="status-label">今日状态</span>
            <span class="status-value">{{ attendanceStatusToday() }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">活跃项目</span>
            <span class="status-value">{{ activeProjects }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片区 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">📋</div>
          <div class="stat-content">
            <div class="stat-label">任务总量</div>
            <div class="stat-value">{{ state.tasks.length }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <div class="stat-label">已完成</div>
            <div class="stat-value">{{ todayDoneTasks }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📅</div>
          <div class="stat-content">
            <div class="stat-label">今日任务</div>
            <div class="stat-value">{{ todayTasksCount }}</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-content">
            <div class="stat-label">专注时长</div>
            <div class="stat-value">{{ fmtSeconds(focusSeconds()) }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区：双列布局 -->
    <div class="content-section">
      <!-- 左列：快速导航 -->
      <div class="action-column">
        <div class="card-header">
          <h3>主线概览</h3>
        </div>
        <div class="action-list">
          <button class="action-card" @click="goTo('/schedule')">
            <div class="action-icon">📆</div>
            <div class="action-body">
              <div class="action-title">日程管理</div>
              <div class="action-desc">{{ scheduleSummary }}</div>
            </div>
            <div class="action-arrow">→</div>
          </button>
          <button class="action-card" @click="goTo('/project')">
            <div class="action-icon">📊</div>
            <div class="action-body">
              <div class="action-title">项目管理</div>
              <div class="action-desc">{{ projectSummary }}</div>
            </div>
            <div class="action-arrow">→</div>
          </button>
        </div>
      </div>

      <!-- 右列：专注时钟 & 提醒 -->
      <div class="side-column">
        <!-- 专注时钟控制 -->
        <div class="card-header">
          <h3>专注时钟</h3>
        </div>
        <div class="focus-card">
          <div class="focus-display">{{ fmtSeconds(focusSeconds()) }}</div>
          <div class="focus-buttons">
            <button class="focus-btn start" @click="startPomo">开始</button>
            <button class="focus-btn pause" @click="pausePomo">暂停</button>
            <button class="focus-btn clear" @click="clearPomo">清除</button>
          </div>
        </div>

        <!-- 近期提醒 -->
        <div class="card-header">
          <h3>近期提醒</h3>
        </div>
        <div class="alert-section">
          <div v-if="!alerts.length" class="empty-state">暂无提醒</div>
          <div v-for="(alert, idx) in alerts" :key="idx" class="alert-item">
            <span class="alert-icon">⚠️</span>
            <span>{{ alert }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Monitor } from '@element-plus/icons-vue'
import { useWorkbenchStore } from '../../stores/workbench'
import { todayStr, diffDays } from '../utils'

const router = useRouter()
const store = useWorkbenchStore()
const state = computed(() => store.state)

const todayDoneTasks = computed(() => state.value.tasks.filter(t => t.status === 'done').length)
const todayTasksCount = computed(() => state.value.tasks.filter(t => t.dueDate === todayStr() && t.status !== 'done').length)
const activeProjects = computed(() => state.value.projects.filter(p => p.status !== 'done').length)

const scheduleSummary = computed(() => {
  const blocks = state.value.timeBlocks[todayStr()] || []
  return `${blocks.length} 个时间块`
})

const projectSummary = computed(() => `${state.value.projects.length} 个项目，${state.value.tasks.length} 条任务`)

const focusSeconds = () => {
  const persisted = state.value.focus.sessions.reduce((sum, item) => sum + item.minutes * 60, 0)
  if (!state.value.focus.active) return persisted
  const activeSeconds = Math.floor((Date.now() - parseInt(state.value.focus.active, 10)) / 1000)
  return persisted + Math.max(0, activeSeconds)
}

const fmtSeconds = (sec: number) => {
  const h = String(Math.floor(sec / 3600)).padStart(2, '0')
  const m = String(Math.floor((sec % 3600) / 60)).padStart(2, '0')
  const s = String(sec % 60).padStart(2, '0')
  return `${h}:${m}:${s}`
}

const attendanceStatusToday = () => {
  const logs = state.value.attendance[todayStr()]?.logs || []
  if (!logs.length) return '未打卡'
  const hasOpen = logs.some(l => !l.end)
  return hasOpen ? '已上工' : '已下工'
}

const alerts = computed(() => {
  const list: string[] = []
  const nearSub = state.value.submissions.find(s => s.deadline && diffDays(todayStr(), s.deadline) >= 0 && diffDays(todayStr(), s.deadline) <= 7)
  if (nearSub) list.push(`投稿 "${nearSub.title}" 截止日期临近`)
  const overdueTasks = state.value.tasks.filter(t => t.dueDate && diffDays(todayStr(), t.dueDate) < 0)
  if (overdueTasks.length) list.push(`有 ${overdueTasks.length} 个逾期任务`)
  return list
})

const startPomo = () => {
  store.updateState(s => {
    s.focus.active = Date.now().toString()
  })
}

const pausePomo = () => {
  store.updateState(s => {
    if (s.focus.active) {
      const minutes = Math.floor((Date.now() - parseInt(s.focus.active)) / 60000)
      s.focus.sessions.push({ date: todayStr(), minutes })
      s.focus.active = null
    }
  })
}

const clearPomo = () => {
  store.updateState(s => {
    s.focus.active = null
  })
}

const goTo = (path: string) => {
  router.push(path)
}

onMounted(() => {
  store.loadState()
})
</script>

<style scoped>
.dashboard-home {
  display: flex;
  flex-direction: column;
  gap: 24px;
  height: 100%;
}

/* 顶部标题栏 */
.module-header {
  padding: 24px;
  background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5));
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.6);
  box-shadow: 0 10px 30px rgba(0,0,0,0.03);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-box {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  font-size: 32px;
  color: #2f6f84;
  background: #fff;
  padding: 10px;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(47, 111, 132, 0.15);
}

.title-box h2 {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
}

.title-box p {
  margin: 4px 0 0 0;
  font-size: 11px;
  color: #94a3b8;
  letter-spacing: 1px;
}

.status-board {
  display: flex;
  gap: 24px;
}

.status-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.status-label {
  font-size: 11px;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.status-value {
  font-size: 16px;
  font-weight: 700;
  color: #2f6f84;
}

/* 统计卡片区 */
.stats-section {
  display: flex;
  gap: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  width: 100%;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f5f9ff 100%);
  border: 1px solid #cffafe;
  border-radius: 12px;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.02);
}

.stat-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-label {
  font-size: 0.7rem;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-value {
  font-size: 1.4rem;
  font-weight: 700;
  color: #2f6f84;
}

/* 主内容区 */
.content-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  flex: 1;
}

.card-header {
  margin-bottom: 12px;
}

.card-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.action-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.action-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  background: linear-gradient(135deg, rgba(47,111,132,0.05) 0%, rgba(79,174,217,0.03) 100%);
  border: 1px solid rgba(47,111,132,0.1);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.action-card:hover {
  background: linear-gradient(135deg, rgba(47,111,132,0.1) 0%, rgba(79,174,217,0.05) 100%);
  border-color: rgba(47,111,132,0.2);
  transform: translateX(4px);
}

.action-icon {
  font-size: 24px;
  flex-shrink: 0;
}

.action-body {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.action-desc {
  font-size: 0.8rem;
  color: #94a3b8;
}

.action-arrow {
  font-size: 18px;
  color: #2f6f84;
  opacity: 0.6;
  flex-shrink: 0;
}

/* 专注时钟 */
.focus-card {
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #f5f9ff 100%);
  border: 1px solid #cffafe;
  border-radius: 12px;
  text-align: center;
  margin-bottom: 20px;
}

.focus-display {
  font-size: 2.4rem;
  font-weight: 900;
  color: #2f6f84;
  font-family: 'Monaco', 'Courier New', monospace;
  letter-spacing: 2px;
  margin-bottom: 14px;
}

.focus-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.focus-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.focus-btn.start {
  background: #2f6f84;
  color: white;
}

.focus-btn.pause {
  background: #4a90a4;
  color: white;
}

.focus-btn.clear {
  background: #fee2e2;
  color: #b91c1c;
}

.focus-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47,111,132,0.15);
}

/* 提醒区 */
.alert-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 10px;
  color: #92400e;
  font-size: 0.85rem;
}

.alert-icon {
  font-size: 16px;
  flex-shrink: 0;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
}
</style>