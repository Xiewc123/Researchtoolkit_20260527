<template>
  <div class="dashboard-module">
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><Monitor /></el-icon>
          <div>
            <h2>工作台总览</h2>
            <p>Research dashboard / 今日安排、专注记录与风险提醒</p>
          </div>
        </div>
        <div class="clock-panel">
          <strong>{{ nowDateText }}</strong>
          <span>{{ nowTimeText }}</span>
        </div>
      </div>
    </div>

    <div class="overview-grid">
      <section class="summary-card">
        <div class="stat-grid">
          <div v-for="item in stats" :key="item.label" class="stat-box">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </div>
        </div>

        <div class="attendance-area">
          <div class="section-title">
            <span>快捷打卡</span>
            <small>{{ attendanceStatus }}</small>
          </div>
          <div class="inline-controls">
            <el-button type="primary" size="small" @click="checkInStart">上工</el-button>
            <el-button size="small" @click="checkInEnd">下工</el-button>
            <el-select v-model="leaveType" class="leave-select" size="small">
              <el-option label="事假" value="事假" />
              <el-option label="会议" value="会议" />
              <el-option label="出差" value="出差" />
              <el-option label="休息" value="休息" />
              <el-option label="病假" value="病假" />
              <el-option label="其他" value="其他" />
            </el-select>
            <el-button size="small" @click="addLeave">请假</el-button>
          </div>
        </div>
      </section>

      <section class="flow-card">
        <div class="section-title"><span>主线概览</span></div>
        <button v-for="item in flow" :key="item.target" class="flow-item" @click="goTo(item.target)">
          <strong>{{ item.label }}</strong>
          <span>{{ item.meta }}</span>
        </button>
      </section>

      <section class="alert-card">
        <div class="section-title"><span>近期提醒</span></div>
        <div class="alert-list">
          <div v-for="alert in alerts" :key="alert.id" class="alert-item" :class="alert.tone">
            {{ alert.text }}
          </div>
        </div>
      </section>

      <section class="pomo-card">
        <div class="section-title">
          <span>专注番茄钟</span>
          <small>{{ pomoModeLabel }}</small>
        </div>
        <div class="pomo-face">
          <strong>{{ formatCountdown(pomoSecondsLeft) }}</strong>
          <div class="pomo-settings">
            <label>
              专注
              <el-select v-model="pomoFocusMinutes" size="small" :disabled="pomoRunning" @change="syncTimerBySetting">
                <el-option :value="25" label="25" />
                <el-option :value="30" label="30" />
                <el-option :value="40" label="40" />
                <el-option :value="50" label="50" />
              </el-select>
            </label>
            <label>
              休息
              <el-select v-model="pomoBreakMinutes" size="small" :disabled="pomoRunning" @change="syncTimerBySetting">
                <el-option :value="5" label="5" />
                <el-option :value="10" label="10" />
                <el-option :value="15" label="15" />
              </el-select>
            </label>
          </div>
        </div>

        <div class="pomo-form">
          <el-select class="task-select" v-model="pomoTaskId" placeholder="关联任务" size="small" clearable :disabled="pomoRunning">
            <el-option v-for="task in activeTasksList" :key="task.id" :label="task.title" :value="task.id" />
          </el-select>
          <!-- 加上 size="small" 和 class="cat-select" -->
          <el-select class="cat-select" v-model="pomoCategory" placeholder="分类" size="small" :disabled="pomoRunning">
            <el-option label="科研" value="科研" />
            <el-option label="写作" value="写作" />
            <el-option label="阅读" value="阅读" />
            <el-option label="事务" value="事务" />
            <el-option label="其他" value="其他" />
          </el-select>
        </div>

        <div class="pomo-actions">
          <el-button type="primary" size="small" :disabled="pomoRunning" @click="startPomo">{{ pomoRunning ? '运行中' : '开始' }}</el-button>
          <el-button size="small" @click="pausePomo">中止</el-button>
          <el-button size="small" :disabled="pomoRunning" @click="switchPomoMode">切换</el-button>
          <el-button type="danger" plain size="small" :disabled="pomoRunning" @click="clearPomo">清除</el-button>
        </div>
      </section>

      <section class="heatmap-card">
        <div class="section-title"><span>历史记录热力图</span></div>
        <div class="heatmap-wrap">
          <div class="week-labels">
            <span v-for="day in weekLabels" :key="day">{{ day }}</span>
          </div>
          <div ref="heatmapScroll" class="heatmap-scroll">
            <div class="month-row">
              <span v-for="month in heatmap.months" :key="`${month.label}-${month.left}`" :style="{ left: `${month.left}px` }">
                {{ month.label }}
              </span>
            </div>
            <div class="heatmap-grid">
              <div v-for="cell in heatmap.cells" :key="cell.key" class="heat-cell" :class="cell.color" :title="cell.title" />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { Monitor } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { useWorkbenchStore } from '../../stores/workbench'
import type { ActiveFocus, WorkbenchState } from '../types'
import { dateTimeLabel, minutesToTime, nowTime, timeToMinutes, todayStr, uid } from '../utils'
import {
  addDurationBlock,
  addTimeBlock,
  getAttendanceStatus,
  getDashboardAlerts,
  getDashboardFlow,
  getDashboardStats,
  getDayAttendance,
  getFocusHeatmap,
} from '../store'

const router = useRouter()
const wb = useWorkbenchStore()
const state = computed<WorkbenchState>(() => wb.state)

const nowDateText = ref('')
const nowTimeText = ref('')
const heatmapScroll = ref<HTMLElement | null>(null)
let clockTimer: number | undefined
let pomoTimer: number | undefined
let titleTimer: number | undefined
const originalTitle = document.title

const refreshClock = () => {
  const date = new Date()
  nowDateText.value = date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
  nowTimeText.value = date.toLocaleTimeString('zh-CN')
}

const scrollHeatmapToLatest = () => {
  requestAnimationFrame(() => {
    if (heatmapScroll.value) heatmapScroll.value.scrollLeft = heatmapScroll.value.scrollWidth
  })
}

const stats = computed(() => getDashboardStats(state.value))
const flow = computed(() => getDashboardFlow(state.value))
const alerts = computed(() => getDashboardAlerts(state.value))
const heatmap = computed(() => getFocusHeatmap(state.value, 364))
const attendanceStatus = computed(() => getAttendanceStatus(state.value))
const activeTasksList = computed(() => state.value.tasks.filter((task) => task.status !== 'done'))
const weekLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const leaveType = ref('病假')

const goTo = (path: string) => router.push(path)

const checkInStart = async () => {
  let changed = false
  await wb.updateState((draft) => {
    const day = getDayAttendance(draft, todayStr())
    if (day.logs.some((log) => !log.end)) return
    const start = nowTime()
    addTimeBlock(draft, todayStr(), {
      title: '上工',
      start,
      end: start,
      sourceType: 'attendance',
      sourceId: `attendance-${todayStr()}-${day.logs.length}`,
    })
    day.logs.push({ start })
    changed = true
  })
  if (changed) ElMessage.success('已记录上工')
}

const checkInEnd = async () => {
  let changed = false
  await wb.updateState((draft) => {
    const day = getDayAttendance(draft, todayStr())
    const open = [...day.logs].reverse().find((log) => !log.end)
    if (!open) return
    const end = nowTime()
    open.end = end
    addTimeBlock(draft, todayStr(), {
      title: '下工',
      start: end,
      end,
      sourceType: 'attendance',
      sourceId: `attendance-end-${todayStr()}-${day.logs.length}`,
    })
    changed = true
  })
  if (changed) ElMessage.success('已记录下工')
}

const addLeave = async () => {
  await wb.updateState((draft) => {
    const id = uid('leave')
    const time = nowTime()
    getDayAttendance(draft, todayStr()).leaves.push({ id, type: leaveType.value, date: todayStr(), createdAt: dateTimeLabel() })
    addDurationBlock(draft, `请假：${leaveType.value}`, time, minutesToTime(timeToMinutes(time) + 1), {
      sourceType: 'leave',
      sourceId: id,
    })
  })
  ElMessage.success('请假记录已保存')
}

const pomoFocusMinutes = ref(25)
const pomoBreakMinutes = ref(5)
const pomoMode = ref<'focus' | 'break'>('focus')
const pomoSecondsLeft = ref(25 * 60)
const pomoTaskId = ref('')
const pomoCategory = ref('科研')

const pomoRunning = computed(() => Boolean(state.value.focus.active))
const currentPomoMinutes = computed(() => (pomoMode.value === 'focus' ? pomoFocusMinutes.value : pomoBreakMinutes.value))
const pomoModeLabel = computed(() => (pomoMode.value === 'focus' ? (pomoRunning.value ? '专注中' : '专注') : (pomoRunning.value ? '休息中' : '休息')))

const syncTimerBySetting = () => {
  if (!pomoRunning.value) pomoSecondsLeft.value = currentPomoMinutes.value * 60
}

const formatCountdown = (seconds: number) => {
  const safe = Math.max(0, Math.floor(seconds))
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`
}

const remainingSeconds = (active: ActiveFocus) =>
  Math.max(0, active.durationSeconds - Math.floor((Date.now() - active.startedAt) / 1000))

const syncFromActive = async () => {
  const active = state.value.focus.active
  if (!active) return
  pomoMode.value = active.mode
  pomoTaskId.value = active.taskId
  pomoCategory.value = active.category
  pomoSecondsLeft.value = remainingSeconds(active)
  if (pomoSecondsLeft.value <= 0) await finishActivePomo(active)
}

const stopPomoTicker = () => {
  if (pomoTimer) window.clearInterval(pomoTimer)
  pomoTimer = undefined
}

const startPomoTicker = () => {
  stopPomoTicker()
  pomoTimer = window.setInterval(syncFromActive, 1000)
}

const startPomo = async () => {
  if (state.value.focus.active) return
  const active: ActiveFocus = {
    mode: pomoMode.value,
    startedAt: Date.now(),
    durationSeconds: currentPomoMinutes.value * 60,
    taskId: pomoTaskId.value,
    category: pomoCategory.value,
    startTime: nowTime(),
  }
  await wb.updateState((draft) => {
    draft.focus.active = active
  })
  pomoSecondsLeft.value = active.durationSeconds
  startPomoTicker()
}

const commitFocus = async (active: ActiveFocus, end = nowTime()) => {
  const task = state.value.tasks.find((item) => item.id === active.taskId)
  const title = task?.title || active.category || '专注'
  const minutes = Math.max(1, Math.round((active.durationSeconds - remainingSeconds(active)) / 60))
  const sessionId = uid('foc')
  await wb.updateState((draft) => {
    draft.focus.sessions.unshift({
      id: sessionId,
      date: todayStr(),
      start: active.startTime,
      end,
      minutes,
      title,
      taskId: active.taskId,
    })
    addDurationBlock(draft, `专注：${title}`, active.startTime, end, {
      taskId: active.taskId,
      sourceType: 'focus',
      sourceId: sessionId,
    })
  })
}

const playDoneSound = () => {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
  if (!AudioCtx) return
  const ctx = new AudioCtx()
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = 880
  gain.gain.setValueAtTime(0.001, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.7)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start()
  oscillator.stop(ctx.currentTime + 0.75)
}

const flashTitle = (text: string) => {
  if (titleTimer) window.clearInterval(titleTimer)
  let visible = false
  titleTimer = window.setInterval(() => {
    visible = !visible
    document.title = visible ? text : originalTitle
  }, 900)
  window.setTimeout(() => {
    if (titleTimer) window.clearInterval(titleTimer)
    titleTimer = undefined
    document.title = originalTitle
  }, 12000)
}

const notifyPomoDone = async (active: ActiveFocus) => {
  const title = active.mode === 'focus' ? '专注时间结束' : '休息时间结束'
  const message = active.mode === 'focus' ? '本轮专注已完成，可以休息一下。' : '休息结束，可以回到工作。'
  playDoneSound()
  flashTitle(title)
  ElNotification({ title, message, type: 'success', duration: 0, position: 'top-right' })
  if ('Notification' in window) {
    const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission
    if (permission === 'granted') new Notification(title, { body: message })
  }
  ElMessageBox.alert(message, title, { confirmButtonText: '知道了' }).catch(() => {})
}

const finishActivePomo = async (active: ActiveFocus) => {
  stopPomoTicker()
  if (active.mode === 'focus') await commitFocus(active)
  await notifyPomoDone(active)
  await wb.updateState((draft) => {
    draft.focus.active = null
  })
  pomoMode.value = active.mode === 'focus' ? 'break' : 'focus'
  pomoSecondsLeft.value = (pomoMode.value === 'focus' ? pomoFocusMinutes.value : pomoBreakMinutes.value) * 60
}

const pausePomo = async () => {
  const active = state.value.focus.active
  if (!active) return
  stopPomoTicker()
  if (active.mode === 'focus' && active.durationSeconds - remainingSeconds(active) >= 60) {
    await commitFocus(active)
    ElMessage.success('已保存本次专注片段')
  }
  await wb.updateState((draft) => {
    draft.focus.active = null
  })
  pomoSecondsLeft.value = remainingSeconds(active)
}

const switchPomoMode = () => {
  if (pomoRunning.value) return
  pomoMode.value = pomoMode.value === 'focus' ? 'break' : 'focus'
  pomoSecondsLeft.value = currentPomoMinutes.value * 60
}

const clearPomo = () => {
  if (pomoRunning.value) return
  pomoMode.value = 'focus'
  pomoSecondsLeft.value = pomoFocusMinutes.value * 60
}

onMounted(async () => {
  await wb.loadState()
  refreshClock()
  clockTimer = window.setInterval(refreshClock, 1000)
  scrollHeatmapToLatest()
  await syncFromActive()
  if (state.value.focus.active) startPomoTicker()
})

onBeforeUnmount(() => {
  if (clockTimer) window.clearInterval(clockTimer)
  if (titleTimer) window.clearInterval(titleTimer)
  document.title = originalTitle
  stopPomoTicker()
})
</script>

<style scoped>
.dashboard-module { height: 100%; display: flex; flex-direction: column; gap: 16px; color: #1e293b; }
.module-header { padding: 24px; background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5)); border-radius: 16px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.title-box { display: flex; align-items: center; gap: 16px; }
.title-icon { font-size: 32px; color: #2f6f84; background: #fff; padding: 10px; border-radius: 14px; box-shadow: 0 4px 15px rgba(47,111,132,0.15); }
.title-box h2 { margin: 0; font-size: 22px; font-weight: 700; }
.title-box p { margin: 4px 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 1px; }
.clock-panel { text-align: right; }
.clock-panel strong { display: block; color: #2f6f84; }
.clock-panel span { font-size: 12px; color: #94a3b8; }
.overview-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; min-height: 0; }
.summary-card, .flow-card, .alert-card, .pomo-card, .heatmap-card { background: #fff; border-radius: 16px; padding: 18px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02); border: 1px solid rgba(255,255,255,0.6); }
.stat-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
.stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; }
.stat-box span { display: block; font-size: 12px; color: #64748b; }
.stat-box strong { display: block; margin-top: 4px; font-size: 24px; color: #2f6f84; }
.attendance-area { margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0; }
.section-title { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; font-weight: 700; color: #2f6f84; }
.section-title small { color: #94a3b8; font-weight: 400; }
.flow-card, .alert-card { min-height: 260px; }
.flow-item { width: 100%; text-align: left; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; margin-bottom: 8px; cursor: pointer; }
.flow-item:hover { border-color: rgba(47,111,132,0.35); }
.flow-item strong { display: block; color: #1e293b; }
.flow-item span { display: block; margin-top: 4px; color: #64748b; font-size: 12px; }
.alert-list { display: flex; flex-direction: column; gap: 8px; max-height: 230px; overflow: auto; }
.alert-item { border-radius: 10px; padding: 10px 12px; font-size: 13px; border: 1px solid #e2e8f0; background: #f8fafc; }
.alert-item.warn { color: #92400e; background: #fffbeb; border-color: #fde68a; }
.alert-item.danger { color: #be123c; background: #fff1f2; border-color: #fecdd3; }

/* --- 快捷打卡 & 番茄钟按钮更小更紧凑 --- */
.inline-controls, .pomo-actions { 
  display: flex; /* 改用 flex 等分宽度 */
  gap: 6px; /* 缩小间距 */
  align-items: center; 
  margin-top: 12px;
}
.inline-controls > *, .pomo-actions > * { 
  flex: 1; 
  min-width: 0; /* 防止子元素撑破父容器 */
}
.inline-controls :deep(.el-button), .pomo-actions :deep(.el-button) { 
  width: 100%; 
  margin-left: 0; 
  padding-left: 0; 
  padding-right: 0; 
}
.leave-select { 
  width: 100%; 
}

/* --- 修复番茄钟时间与休息框超出问题 --- */
.pomo-face { 
  display: flex; 
  align-items: center; /* 居中对齐 */
  justify-content: space-between; 
  flex-wrap: wrap; /* 空间不够时允许换行 */
  gap: 12px; 
  padding-bottom: 14px; 
  border-bottom: 1px solid #e2e8f0; 
}
.pomo-face > strong { 
  font-size: 38px; /* 稍微缩小一点字体防止挤占空间 */
  line-height: 1; 
  font-variant-numeric: tabular-nums; 
}
.pomo-settings { 
  display: flex; 
  flex-direction: column; /* 让专注和休息上下排列，节省横向空间 */
  gap: 6px; 
}
.pomo-settings label { 
  display: flex; 
  align-items: center; 
  gap: 6px;
  width: auto; 
  font-size: 12px; 
  color: #64748b; 
  white-space: nowrap; /* 防止文字换行 */
}
.pomo-settings :deep(.el-select) {
  width: 65px; /* 严格限制宽度，因为里面只有数字 */
}

/* --- 番茄钟关联任务和类型排成一行 --- */
.pomo-form { 
  display: flex; /* 改为 flex 横向排列 */
  gap: 8px; 
  margin-top: 12px; 
}
.pomo-form .task-select { 
  flex: 1; /* 任务名较长，占据剩余所有空间 */
  min-width: 0; 
}
.pomo-form .cat-select { 
  width: 85px; /* 分类字数少，固定较小的宽度 */
  flex-shrink: 0; /* 防止被挤压 */
}

.heatmap-card { grid-column: span 2; min-width: 0; }
.heatmap-wrap { display: flex; min-width: 0; }
.week-labels { display: flex; flex-direction: column; gap: 4px; margin-top: 20px; margin-right: 8px; color: #94a3b8; font-size: 10px; }
.week-labels span { height: 12px; line-height: 12px; }
.heatmap-scroll { flex: 1; overflow-x: auto; padding-bottom: 8px; }
.month-row { position: relative; height: 18px; color: #94a3b8; font-size: 10px; }
.month-row span { position: absolute; top: 0; }
.heatmap-grid { display: grid; grid-template-rows: repeat(7, 12px); grid-auto-flow: column; grid-auto-columns: 12px; gap: 4px; width: max-content; }
.heat-cell { width: 12px; height: 12px; border-radius: 3px; }
.blank { background: transparent; }
.level-0 { background: #eef2f7; }
.level-1 { background: #c7ead8; }
.level-2 { background: #98d7b8; }
.level-3 { background: #6fc398; }
.level-4 { background: #45aa7d; }
.level-5 { background: #2f8f68; }
.level-6 { background: #226f55; }
.level-7 { background: #18513f; }
.level-8 { background: #0f3b2f; }
@media (max-width: 800px) { .overview-grid { grid-template-columns: 1fr; } .heatmap-card { grid-column: span 1; } }
</style>
