<template>
  <div class="schedule-manager">
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><Calendar /></el-icon>
          <div>
            <h2>日程管理</h2>
            <p>Today tasks / 时间轴调度与任务状态同步</p>
          </div>
        </div>
        <div class="status-board">
          <div class="status-item"><span>待办任务</span><strong>{{ activeTasksCount }}</strong></div>
          <div class="status-item"><span>临期任务</span><strong>{{ urgentTasksCount }}</strong></div>
        </div>
      </div>
    </div>

    <div class="stats-section">
      <div v-for="item in statCards" :key="item.label" class="stat-card" :class="{ urgent: item.urgent }">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>

    <div class="content-section">
      <section class="task-panel">
        <div class="panel-header">
          <h3>今日任务</h3>
          <el-button type="primary" size="small" @click="openTaskDialog()">新增任务</el-button>
        </div>

        <div class="quick-add">
          <el-input v-model="quickTaskTitle" size="small" placeholder="输入任务名称，按 Enter 快速加入今日任务" clearable @keyup.enter="quickAddTask" />
        </div>

        <div class="filter-controls">
          <el-select v-model="taskViewFilter" size="small">
            <el-option label="显示全部" value="all" />
            <el-option label="今日执行" value="today" />
            <el-option v-for="quadrant in TASK_QUADRANTS" :key="quadrant" :label="TASK_QUADRANT_LABELS[quadrant]" :value="quadrant" />
          </el-select>
          <el-select v-model="projectFilter" size="small" clearable placeholder="项目">
            <el-option label="所有项目" value="" />
            <el-option v-for="project in state.projects" :key="project.id" :label="project.title" :value="project.id" />
          </el-select>
        </div>

        <div class="task-board">
          <section v-for="group in groupedTasks" :key="group.quadrant" class="task-group">
            <div class="group-head" :class="group.quadrant.toLowerCase()">
              <strong>{{ group.quadrant }}</strong>
              <span>{{ TASK_QUADRANT_LABELS[group.quadrant].replace(`${group.quadrant} `, '') }}</span>
              <em>{{ group.tasks.length }}</em>
            </div>

            <div class="group-list">
              <div v-for="task in group.tasks" :key="task.id" class="task-row" :class="{ completed: task.status === 'done' }">
                <div class="task-main">
                  <el-checkbox :model-value="task.status === 'done'" @change="toggleTaskDone(task.id)" />
                  <el-tooltip effect="light" :content="task.title" placement="top-start" :show-after="50">
                    <button class="task-name" @click="openTaskDialog(task.id)">{{ task.title }}</button>
                  </el-tooltip>
                </div>

                <div class="task-actions">
                  <div class="task-meta">
                    <el-tooltip effect="light" :content="projectName(task.projectId)" placement="top" :show-after="50">
                      <span class="meta-project">{{ projectName(task.projectId) }}</span>
                    </el-tooltip>
                    <span class="meta-date">{{ task.dueDate || '-' }}</span>
                    <span :class="['urgency', urgencyClass(task)]">{{ urgencyText(task) }}</span>
                  </div>
                  <el-button link type="danger" size="small" @click="deleteTask(task.id)">删除</el-button>
                </div>
              </div>
              <div v-if="!group.tasks.length" class="empty-mini">暂无任务</div>
            </div>
          </section>
        </div>
      </section>

      <section class="timeline-panel">
        <div class="panel-header">
          <h3>今日日程</h3>
          <div class="timeline-tools">
            <el-date-picker v-model="timelineDate" type="date" value-format="YYYY-MM-DD" size="small" style="width: 120px;" />
            <el-button size="small" @click="timelineDate = todayStr()">回到今日</el-button>
            <el-button type="primary" size="small" @click="openBlockDialog()">新增</el-button>
          </div>
        </div>

        <div class="timeline-list">
          <div v-for="block in sortedBlocks" :key="block.id" class="timeline-item">
            <div class="timeline-range">{{ blockRange(block) }}</div>
            <div class="timeline-main">
              <el-tooltip effect="light" :content="block.title" placement="top-start" :show-after="50">
                <strong>{{ block.title }}</strong>
              </el-tooltip>
              <el-tooltip v-if="block.taskId && !isTaskCompleteBlock(block)" effect="light" :content="`任务：${taskName(block.taskId)}`" placement="top-start" :show-after="50">
                <span>任务：{{ taskName(block.taskId) }}</span>
              </el-tooltip>
            </div>
            <div class="timeline-actions">
              <el-button link size="small" @click="openBlockDialog(block.id)">编辑</el-button>
              <el-button link type="danger" size="small" @click="deleteBlock(block.id)">删除</el-button>
            </div>
          </div>
          <el-empty v-if="!sortedBlocks.length" description="这一天暂无时间块" />
        </div>
      </section>
    </div>

    <el-dialog v-model="taskDialogVisible" :title="editingTaskId ? '编辑任务' : '新增任务'" width="520px">
      <el-form :model="taskForm" label-width="88px" label-position="left">
        <el-form-item label="任务名称" required><el-input v-model="taskForm.title" /></el-form-item>
        <el-form-item label="所属项目">
          <el-select v-model="taskForm.projectId" clearable>
            <el-option label="无关联项目" value="" />
            <el-option v-for="project in state.projects" :key="project.id" :label="project.title" :value="project.id" />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="分组"><el-input v-model="taskForm.group" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="组内顺序"><el-input-number v-model="taskForm.groupOrder" :min="0" class="full-width" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="成员"><el-input v-model="taskForm.members" /></el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="象限">
              <el-select v-model="taskForm.quadrant">
                <el-option v-for="quadrant in TASK_QUADRANTS" :key="quadrant" :label="TASK_QUADRANT_LABELS[quadrant]" :value="quadrant" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态">
              <el-select v-model="taskForm.status">
                <el-option label="未开始" value="todo" />
                <el-option label="进行中" value="in-progress" />
                <el-option label="已完成" value="done" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="今日执行"><el-switch v-model="taskForm.isToday" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="截止日期"><el-date-picker v-model="taskForm.dueDate" type="date" value-format="YYYY-MM-DD" class="full-width" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存任务</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="blockDialogVisible" :title="editingBlockId ? '编辑时间块' : '新增时间块'" width="480px">
      <el-form :model="blockForm" label-width="88px" label-position="left">
        <el-form-item label="开始时间">
          <el-time-select v-model="blockForm.start" start="00:00" end="23:55" step="00:05" class="full-width" />
        </el-form-item>
        <el-form-item label="日程时长">
          <el-select v-model="blockForm.durationMinutes" class="full-width">
            <el-option v-for="option in durationOptions" :key="option.value" :label="option.label" :value="option.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="关联任务">
          <el-select v-model="blockForm.taskId" clearable placeholder="可选">
            <el-option label="不关联任务" value="" />
            <el-option v-for="task in activeTaskOptions" :key="task.id" :label="task.title" :value="task.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="日程名称"><el-input v-model="blockForm.title" placeholder="不选任务时必填" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="blockDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveBlock">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWorkbenchStore } from '../../stores/workbench'
import type { Task, TimeBlock } from '../types'
import {
  TASK_QUADRANT_LABELS,
  TASK_QUADRANT_RANK,
  TASK_QUADRANTS,
  addDurationBlock,
  createTask,
  createTimeBlock,
  getDayBlocks,
  removeTimeBlocksBySource,
} from '../store'
import { diffDays, minutesToTime, nowTime, timeMinute, timeToMinutes, todayStr } from '../utils'

const store = useWorkbenchStore()
const state = computed(() => store.state)

const quickTaskTitle = ref('')
const taskViewFilter = ref<'all' | 'today' | Task['quadrant']>('today')
const projectFilter = ref('')
const timelineDate = ref(todayStr())
const taskDialogVisible = ref(false)
const blockDialogVisible = ref(false)
const editingTaskId = ref('')
const editingBlockId = ref('')

const taskForm = reactive({
  title: '',
  projectId: '',
  group: '默认分组',
  groupOrder: 0,
  members: '自己',
  quadrant: 'Q3' as Task['quadrant'],
  status: 'todo' as Task['status'],
  isToday: true,
  dueDate: todayStr(),
})

const blockForm = reactive({ title: '', start: '09:00', durationMinutes: 30, taskId: '' })
const durationOptions = Array.from({ length: 16 }, (_, index) => {
  const value = (index + 1) * 15
  const hours = Math.floor(value / 60)
  const minutes = value % 60
  return {
    value,
    label: hours ? `${hours}小时${minutes ? `${minutes}分` : ''}` : `${minutes}分钟`,
  }
})

const activeProjectsCount = computed(() => state.value.projects.filter((project) => project.status !== 'done').length)
const activeTasksCount = computed(() => state.value.tasks.filter((task) => task.status !== 'done').length)
const isUrgent = (date: string) => !!date && diffDays(todayStr(), date) <= 3
const urgentProjectsCount = computed(() => state.value.projects.filter((project) => project.status !== 'done' && isUrgent(project.deadline)).length)
const urgentTasksCount = computed(() => state.value.tasks.filter((task) => task.status !== 'done' && isUrgent(task.dueDate)).length)
const statCards = computed(() => [
  { label: '活跃项目', value: activeProjectsCount.value },
  { label: '待办任务', value: activeTasksCount.value },
  { label: '临期/逾期项目', value: urgentProjectsCount.value, urgent: urgentProjectsCount.value > 0 },
  { label: '临期/逾期任务', value: urgentTasksCount.value, urgent: urgentTasksCount.value > 0 },
])

const filteredTasks = computed(() => {
  return state.value.tasks
    .filter((task) => {
      if (taskViewFilter.value === 'today' && !task.isToday) return false
      if (TASK_QUADRANTS.includes(taskViewFilter.value as Task['quadrant']) && task.quadrant !== taskViewFilter.value) return false
      if (projectFilter.value && task.projectId !== projectFilter.value) return false
      return true
    })
    .sort((a, b) => {
      if (a.status === 'done' && b.status !== 'done') return 1
      if (a.status !== 'done' && b.status === 'done') return -1
      return TASK_QUADRANT_RANK[a.quadrant] - TASK_QUADRANT_RANK[b.quadrant] || (a.groupOrder || 0) - (b.groupOrder || 0)
    })
})

const groupedTasks = computed(() => {
  const displayQuadrants = TASK_QUADRANTS.includes(taskViewFilter.value as Task['quadrant'])
    ? [taskViewFilter.value as Task['quadrant']]
    : TASK_QUADRANTS
  return displayQuadrants.map((quadrant) => ({
    quadrant,
    tasks: filteredTasks.value.filter((task) => task.quadrant === quadrant),
  }))
})

const sortedBlocks = computed(() => [...getDayBlocks(state.value, timelineDate.value)].sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start)))
const activeTaskOptions = computed(() => state.value.tasks.filter((task) => task.status !== 'done'))
const projectName = (id: string) => state.value.projects.find((project) => project.id === id)?.title || '无项目'
const taskName = (id: string) => state.value.tasks.find((task) => task.id === id)?.title || '未知任务'

const isTaskCompleteBlock = (block: TimeBlock) =>
  block.title.startsWith('完成任务：') && (timeToMinutes(block.end) - timeToMinutes(block.start) <= 1)

const blockRange = (block: TimeBlock) => {
  const start = timeMinute(block.start)
  const end = timeMinute(block.end)
  if (!end || end === start || isTaskCompleteBlock(block)) return start
  return `${start}-${end}`
}

const urgencyText = (task: Task) => {
  if (!task.dueDate || task.status === 'done') return '-'
  const days = diffDays(todayStr(), task.dueDate)
  if (days < 0) return '逾期'
  if (days === 0) return '今日'
  if (days <= 3) return `${days}天`
  return '-'
}

const urgencyClass = (task: Task) => {
  const text = urgencyText(task)
  if (text === '逾期') return 'danger'
  if (text === '今日' || text.endsWith('天')) return 'warn'
  return ''
}

const resetTaskForm = () => Object.assign(taskForm, {
  title: '',
  projectId: '',
  group: '默认分组',
  groupOrder: 0,
  members: '自己',
  quadrant: 'Q3',
  status: 'todo',
  isToday: true,
  dueDate: todayStr(),
})

const openTaskDialog = (taskId = '') => {
  editingTaskId.value = taskId
  const task = state.value.tasks.find((item) => item.id === taskId)
  if (task) Object.assign(taskForm, task)
  else resetTaskForm()
  taskDialogVisible.value = true
}

const quickAddTask = async () => {
  const title = quickTaskTitle.value.trim()
  if (!title) return
  await store.updateState((draft) => {
    const task = createTask(title, '', todayStr())
    task.isToday = true
    draft.tasks.unshift(task)
  })
  quickTaskTitle.value = ''
}

const saveTask = async () => {
  const title = taskForm.title.trim()
  if (!title) return ElMessage.warning('任务名称不能为空')
  await store.updateState((draft) => {
    if (editingTaskId.value) {
      const task = draft.tasks.find((item) => item.id === editingTaskId.value)
      if (task) Object.assign(task, taskForm, { title, activeStart: taskForm.status === 'in-progress' ? (task.activeStart || nowTime()) : null })
    } else {
      const task = createTask(title, taskForm.projectId, taskForm.dueDate)
      draft.tasks.unshift({ ...task, ...taskForm, id: task.id, title, activeStart: taskForm.status === 'in-progress' ? nowTime() : null })
    }
  })
  taskDialogVisible.value = false
}

const toggleTaskDone = async (taskId: string) => {
  await store.updateState((draft) => {
    const task = draft.tasks.find((item) => item.id === taskId)
    if (!task) return
    if (task.status === 'done') {
      task.status = 'todo'
      removeTimeBlocksBySource(draft, 'task-complete', task.id)
      return
    }
    const end = nowTime()
    const start = task.activeStart || end
    task.status = 'done'
    task.activeStart = null
    if (!task.partialDates.includes(todayStr())) task.partialDates.push(todayStr())
    addDurationBlock(draft, `完成任务：${task.title}`, start, end, { taskId: task.id, sourceType: 'task-complete', sourceId: task.id })
  })
}

const deleteTask = async (taskId: string) => {
  await ElMessageBox.confirm('确认删除这条任务？关联时间块会保留但解除任务关联。', '删除任务', { type: 'warning' })
  await store.updateState((draft) => {
    draft.tasks = draft.tasks.filter((task) => task.id !== taskId)
    removeTimeBlocksBySource(draft, 'task-complete', taskId)
    Object.values(draft.timeBlocks).forEach((blocks) => blocks.forEach((block) => { if (block.taskId === taskId) block.taskId = '' }))
  })
}

const roundUpToFiveMinutes = (time: string) => {
  const minutes = timeToMinutes(time)
  return minutesToTime(Math.min(23 * 60 + 55, Math.ceil(minutes / 5) * 5))
}

const durationFromBlock = (block?: TimeBlock) => {
  if (!block?.start || !block?.end) return 30
  const diff = timeToMinutes(block.end) - timeToMinutes(block.start)
  if (diff <= 0) return 30
  return Math.max(15, Math.min(240, Math.round(diff / 15) * 15))
}

const openBlockDialog = (blockId = '') => {
  editingBlockId.value = blockId
  const block = getDayBlocks(state.value, timelineDate.value).find((item) => item.id === blockId)
  if (block) {
    Object.assign(blockForm, {
      title: block.title,
      start: timeMinute(block.start),
      durationMinutes: durationFromBlock(block),
      taskId: block.taskId,
    })
  } else {
    Object.assign(blockForm, { title: '', start: roundUpToFiveMinutes(nowTime()), durationMinutes: 30, taskId: '' })
  }
  blockDialogVisible.value = true
}

const saveBlock = async () => {
  let title = blockForm.title.trim()
  if (!title && blockForm.taskId) title = taskName(blockForm.taskId)
  if (!title) return ElMessage.warning('请填写日程名称或选择关联任务')
  const endMinutes = timeToMinutes(blockForm.start) + blockForm.durationMinutes
  if (endMinutes > 24 * 60) return ElMessage.warning('日程结束时间不能超过当天 24:00')
  const end = minutesToTime(endMinutes)
  await store.updateState((draft) => {
    const blocks = getDayBlocks(draft, timelineDate.value)
    if (editingBlockId.value) {
      const block = blocks.find((item) => item.id === editingBlockId.value)
      if (block) Object.assign(block, { title, start: blockForm.start, end, taskId: blockForm.taskId })
    } else {
      blocks.push(createTimeBlock(title, blockForm.start, end, blockForm.taskId))
    }
  })
  blockDialogVisible.value = false
}

const deleteBlock = async (blockId: string) => {
  await ElMessageBox.confirm('确认删除这个时间块？', '删除时间块', { type: 'warning' })
  await store.updateState((draft) => {
    const blocks = getDayBlocks(draft, timelineDate.value)
    const index = blocks.findIndex((block) => block.id === blockId)
    if (index !== -1) blocks.splice(index, 1)
  })
}

onMounted(() => store.loadState())
</script>

<style scoped>
.schedule-manager { height: 100%; display: flex; flex-direction: column; gap: 16px; color: #1e293b; }
.module-header { padding: 24px; background: rgba(255,255,255,0.86); border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 10px 30px rgba(0,0,0,0.03); }
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 16px; }
.title-box { display: flex; align-items: center; gap: 16px; }
.title-icon { font-size: 32px; color: #2f6f84; background: #fff; padding: 10px; border-radius: 10px; box-shadow: 0 4px 15px rgba(47,111,132,0.15); }
.title-box h2 { margin: 0; font-size: 22px; font-weight: 700; }
.title-box p { margin: 4px 0 0; font-size: 12px; color: #64748b; }
.status-board { display: flex; gap: 24px; }
.status-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.status-item span { font-size: 12px; color: #64748b; }
.status-item strong { font-size: 18px; color: #2f6f84; }
.stats-section { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
.stat-card { display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; }
.stat-card.urgent { background: #fffbeb; border-color: #fde68a; }
.stat-card span { color: #64748b; font-size: 12px; }
.stat-card strong { color: #2f6f84; font-size: 20px; }
.content-section { display: grid; grid-template-columns: minmax(0, 1.2fr) minmax(360px, .8fr); gap: 16px; flex: 1; min-height: 0; }
.task-panel, .timeline-panel { background: #fff; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0; min-height: 0; display: flex; flex-direction: column; }
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 10px; }
.panel-header h3 { margin: 0; color: #2f6f84; font-size: 15px; }
.quick-add { margin-bottom: 4px; }
.filter-controls { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
.task-board { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 16px; padding-right: 4px; padding-bottom: 8px; }
.task-group { min-width: 480px; border: 1px solid #e2e8f0; border-radius: 10px; background: #fff; display: flex; flex-direction: column; flex-shrink: 0; }
.group-head { display: flex; align-items: center; gap: 10px; padding: 10px 16px; border-bottom: 1px solid #e2e8f0; }
.group-head strong { color: #1e293b; font-size: 14px; }
.group-head span { color: #64748b; font-size: 13px; flex: 1; }
.group-head em { font-style: normal; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 12px; font-size: 12px; }
.group-head.q1 { background: #fff1f2; border-bottom-color: #ffe4e6; }
.group-head.q2 { background: #fffbeb; border-bottom-color: #fef3c7; }
.group-head.q3 { background: #eff6ff; border-bottom-color: #dbeafe; }
.group-head.q4 { background: #f8fafc; }
.group-list { padding: 0; }
.task-row { display: grid; grid-template-columns: minmax(170px, 1fr) 240px; align-items: center; gap: 16px; padding: 10px 16px; border-bottom: 1px solid #eef2f7; transition: background-color 0.2s; min-width: 480px; }
.task-row:last-child { border-bottom: none; }
.task-row:hover { background-color: #f8fafc; }
.task-row.completed { color: #94a3b8; }
.task-row.completed .task-name { color: #94a3b8; text-decoration: line-through; }
.task-main { display: flex; align-items: center; gap: 12px; min-width: 0; }
.task-name { flex: 1; padding: 0; border: 0; background: transparent; color: #1e293b; font-weight: 600; font-size: 13px; text-align: left; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-name:hover { color: #2f6f84; }
.task-actions { display: flex; align-items: center; gap: 8px; justify-content: flex-end; min-width: 240px; }
.task-meta { display: flex; gap: 8px; color: #64748b; font-size: 12px; flex: 1; min-width: 0; }
.task-meta .meta-project { flex: 1 1 80px; min-width: 36px; max-width: 160px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: left; }
.task-meta .meta-date { width: 80px; flex-shrink: 0; text-align: right; }
.task-meta .urgency { width: 38px; flex-shrink: 0; text-align: right; }
.urgency.warn { color: #92400e; font-weight: bold; }
.urgency.danger { color: #be123c; font-weight: bold; }
.empty-mini { padding: 20px 0; text-align: center; color: #94a3b8; font-size: 13px; }
.timeline-list { flex: 1; overflow: auto; min-height: 0; }
.timeline-tools { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; justify-content: flex-end; }
.timeline-item { display: grid; grid-template-columns: 96px minmax(0, 1fr) 54px; gap: 10px; align-items: center; padding: 7px 8px; border-bottom: 1px solid #eef2f7; font-size: 12px; }
.timeline-range { font-weight: 700; color: #2f6f84; font-variant-numeric: tabular-nums; }
.timeline-main { min-width: 0; }
.timeline-main strong { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timeline-main span { display: block; color: #64748b; font-size: 11px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.timeline-actions { display: flex; justify-content: flex-end; }
.full-width { width: 100%; }
@media (max-width: 900px) { .stats-section, .content-section { grid-template-columns: 1fr; } }
</style>
