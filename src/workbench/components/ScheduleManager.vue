<template>
  <div class="schedule-manager">
    <!-- 顶部标题栏 -->
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><Calendar /></el-icon>
          <div>
            <h2>日程管理</h2>
            <p>任务安排与时间轴追踪</p>
          </div>
        </div>
        <div class="status-board">
          <div class="status-item">
            <span class="status-label">待办任务</span>
            <span class="status-value">{{ activeTasks }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">临期</span>
            <span class="status-value">{{ urgentTasks }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">📅</div>
        <div class="stat-content">
          <div class="stat-label">活跃项目</div>
          <div class="stat-value">{{ activeProjs }}</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📋</div>
        <div class="stat-content">
          <div class="stat-label">待办任务</div>
          <div class="stat-value">{{ activeTasks }}</div>
        </div>
      </div>
      <div class="stat-card urgent">
        <div class="stat-icon">⚠️</div>
        <div class="stat-content">
          <div class="stat-label">临期项目</div>
          <div class="stat-value">{{ urgentProjs }}</div>
        </div>
      </div>
      <div class="stat-card urgent">
        <div class="stat-icon">🔥</div>
        <div class="stat-content">
          <div class="stat-label">临期任务</div>
          <div class="stat-value">{{ urgentTasks }}</div>
        </div>
      </div>
    </div>

    <!-- 主内容区：双列布局 -->
    <div class="content-section">
      <!-- 左列：任务列表 -->
      <section class="task-panel">
        <div class="panel-header">
          <h3>今日任务</h3>
        </div>

        <div class="add-form">
          <el-input 
            v-model="newTaskTitle" 
            @keyup.enter="addTask" 
            placeholder="添加任务..."
            clearable
          />
        </div>

        <div class="filter-controls">
          <el-select v-model="filterProj" placeholder="项目" clearable size="small">
            <el-option label="所有项目" value="" />
            <el-option v-for="p in state.projects" :key="p.id" :label="p.title" :value="p.id" />
          </el-select>
          <el-select v-model="filterStatus" placeholder="状态" clearable size="small">
            <el-option label="所有状态" value="" />
            <el-option label="待办" value="todo" />
            <el-option label="进行中" value="in-progress" />
            <el-option label="完成" value="done" />
          </el-select>
        </div>

        <div class="task-list">
          <div v-for="task in filteredTasks" :key="task.id" class="task-item">
            <label class="task-checkbox">
              <input type="checkbox" :checked="task.status === 'done'" @change="toggleTask(task)" />
              <span :class="{ completed: task.status === 'done' }">{{ task.title }}</span>
            </label>
            <el-button link type="primary" size="small" @click="editTask(task)">编辑</el-button>
          </div>
          <div v-if="!filteredTasks.length" class="empty-state">暂无任务</div>
        </div>
      </section>

      <!-- 右列：时间轴 -->
      <section class="timeline-panel">
        <div class="panel-header">
          <h3>今日时间轴</h3>
        </div>
        <div class="timeline-list">
          <div v-for="block in todayBlocks" :key="block.id" class="timeline-item">
            <div class="timeline-badge">{{ block.start }}</div>
            <div class="timeline-content">
              <div class="timeline-title">{{ block.title }}</div>
              <div class="timeline-duration">{{ block.start }} - {{ block.end }}</div>
            </div>
          </div>
          <div v-if="!todayBlocks.length" class="empty-state">暂无时间块</div>
        </div>
      </section>
    </div>

    <!-- 任务编辑对话框 -->
    <el-dialog v-model="taskDialogVisible" title="编辑任务" width="460px">
      <div class="dialog-form">
        <div class="form-group">
          <label>标题</label>
          <el-input v-model="editingTask.title" placeholder="输入任务标题" />
        </div>
        <div class="form-group">
          <label>项目</label>
          <el-select v-model="editingTask.projectId" placeholder="选择项目">
            <el-option label="无项目" value="" />
            <el-option v-for="p in state.projects" :key="p.id" :label="p.title" :value="p.id" />
          </el-select>
        </div>
        <div class="form-group">
          <label>截止日期</label>
          <el-input v-model="editingTask.dueDate" type="date" />
        </div>
        <div class="form-group">
          <label>象限（优先级）</label>
          <el-select v-model="editingTask.quadrant">
            <el-option label="Q1 重要且紧急" value="Q1" />
            <el-option label="Q2 重要不紧急" value="Q2" />
            <el-option label="Q3 紧急不重要" value="Q3" />
            <el-option label="Q4 不紧不重要" value="Q4" />
          </el-select>
        </div>
      </div>
      <template #footer>
        <el-button @click="taskDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveTask">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Calendar } from '@element-plus/icons-vue'
import { useWorkbenchStore } from '../../stores/workbench'
import { createTask, todayStr } from '../store'
import { diffDays } from '../utils'

const store = useWorkbenchStore()
const state = computed(() => store.state)

const newTaskTitle = ref('')
const filterProj = ref('')
const filterStatus = ref('')
const taskDialogVisible = ref(false)
const editingTask = ref<any>(null)

const activeProjs = computed(() => state.value.projects.filter(p => p.status !== 'done').length)
const activeTasks = computed(() => state.value.tasks.filter(t => t.status !== 'done').length)
const isUrgent = (d: string) => {
  if (!d) return false
  const days = diffDays(todayStr(), d)
  return days >= 0 && days <= 3
}
const urgentProjs = computed(() => state.value.projects.filter(p => isUrgent(p.deadline)).length)
const urgentTasks = computed(() => state.value.tasks.filter(t => isUrgent(t.dueDate)).length)

const filteredTasks = computed(() => {
  return state.value.tasks.filter((t: any) => {
    if (filterProj.value && t.projectId !== filterProj.value) return false
    if (filterStatus.value && t.status !== filterStatus.value) return false
    return true
  })
})

const todayBlocks = computed(() => state.value.timeBlocks[todayStr()] || [])

const addTask = () => {
  if (!newTaskTitle.value.trim()) return
  const task = createTask(newTaskTitle.value, '', todayStr())
  task.isToday = true
  store.updateState(s => s.tasks.push(task))
  newTaskTitle.value = ''
}

const toggleTask = (task: any) => {
  store.updateState(s => {
    const t = s.tasks.find((t: any) => t.id === task.id)
    if (t) t.status = t.status === 'done' ? 'todo' : 'done'
  })
}

const editTask = (task: any) => {
  editingTask.value = { ...task }
  taskDialogVisible.value = true
}

const saveTask = () => {
  if (!editingTask.value.title.trim()) {
    alert('任务标题不能为空')
    return
  }
  store.updateState(s => {
    const index = s.tasks.findIndex((t: any) => t.id === editingTask.value.id)
    if (index !== -1) {
      s.tasks[index] = { ...editingTask.value }
    }
  })
  taskDialogVisible.value = false
  editingTask.value = null
}

onMounted(() => {
  store.loadState()
})
</script>

<style scoped>
.schedule-manager {
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

/* 统计卡片 */
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
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

.stat-card.urgent {
  background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%);
  border-color: #fcd34d;
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
  grid-template-columns: 1.2fr 1fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.panel-header {
  margin-bottom: 14px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.task-panel,
.timeline-panel {
  background: linear-gradient(135deg, #f8fafc 0%, #f5f9ff 100%);
  border: 1px solid #cffafe;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.add-form {
  margin-bottom: 8px;
}

.filter-controls {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.filter-controls :deep(.el-select) {
  flex: 1;
  min-width: 0;
}

.task-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 10px 12px;
  background: white;
  border: 1px solid rgba(47,111,132,0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.task-item:hover {
  background: white;
  border-color: rgba(47,111,132,0.2);
}

.task-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  flex: 1;
  min-width: 0;
}

.task-checkbox input {
  cursor: pointer;
  flex-shrink: 0;
}

.task-checkbox span {
  color: #1e293b;
  font-size: 0.9rem;
  word-break: break-all;
}

.task-checkbox span.completed {
  text-decoration: line-through;
  color: #94a3b8;
}

.timeline-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  padding: 12px;
  background: white;
  border: 1px solid rgba(47,111,132,0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.timeline-item:hover {
  border-color: rgba(47,111,132,0.2);
}

.timeline-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
  background: #2f6f84;
  padding: 4px 8px;
  border-radius: 6px;
  white-space: nowrap;
  flex-shrink: 0;
}

.timeline-content {
  flex: 1;
  min-width: 0;
}

.timeline-title {
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 2px;
}

.timeline-duration {
  font-size: 0.75rem;
  color: #94a3b8;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
}

/* 对话框 */
.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1e293b;
}
</style>
