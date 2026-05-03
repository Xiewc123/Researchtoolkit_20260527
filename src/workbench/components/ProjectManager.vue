<template>
  <div class="project-manager">
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><DataAnalysis /></el-icon>
          <div>
            <h2>项目管理</h2>
            <p>Project workflow / 项目、任务清单与推进日志</p>
          </div>
        </div>
        <div class="status-board">
          <div class="status-item"><span>活跃项目</span><strong>{{ activeProjectsCount }}</strong></div>
          <div class="status-item"><span>任务总数</span><strong>{{ state.tasks.length }}</strong></div>
        </div>
      </div>
    </div>

    <div class="workspace-grid">
      <section class="project-column">
        <div class="panel-header">
          <h3>项目列表</h3>
          <el-button type="primary" size="small" @click="openProjectDialog()">新增项目</el-button>
        </div>

        <button class="overview-button" :class="{ active: currentProjectId === 'overview' }" @click="selectProject('overview')">项目全局概览</button>

        <div class="project-list">
          <div v-for="project in state.projects" :key="project.id" class="project-item" :class="{ active: currentProjectId === project.id }" @click="selectProject(project.id)">
            <div class="project-info">
              <div class="project-title-row">
                <strong>{{ project.title }}</strong>
                <em class="task-count">({{ projectTaskStats(project.id) }})</em>
              </div>
              <span>{{ project.deadline || '无截止日期' }}</span>
            </div>
            <span class="project-status" :class="project.status">{{ project.status === 'done' ? '已完成' : '进行中' }}</span>
          </div>
          <el-empty v-if="!state.projects.length" description="暂无项目" />
        </div>

        <div class="note-box">
          <div class="panel-header compact"><h3>随手记</h3></div>
          <el-select v-model="noteProjectId" clearable placeholder="选择关联项目，留空为全局记录">
            <el-option label="全局记录" value="" />
            <el-option v-for="project in state.projects" :key="project.id" :label="project.title" :value="project.id" />
          </el-select>
          <el-input v-model="noteContent" type="textarea" :rows="8" resize="none" placeholder="记录灵感、进展或下一步动作" />
          <el-button type="primary" @click="addNote">发布到日志</el-button>
        </div>
      </section>

      <section class="detail-column">
        <div class="detail-head">
          <div>
            <h3>{{ detailTitle }}</h3>
            <p>{{ detailSubtitle }}</p>
          </div>
          <div class="detail-actions" v-if="currentProject">
            <el-button size="small" @click="openProjectDialog(currentProject.id)">编辑项目</el-button>
            <el-button size="small" :type="currentProject.status === 'done' ? 'warning' : 'success'" plain @click="toggleProjectStatus(currentProject.id)">
              {{ currentProject.status === 'done' ? '重新激活' : '标记完成' }}
            </el-button>
            <el-button size="small" type="danger" plain @click="deleteProject(currentProject.id)">删除</el-button>
          </div>
        </div>

        <div class="detail-body">
          <section class="task-section">
            <div class="panel-header">
              <h3>任务清单</h3>
              <div class="task-tools">
                <el-select v-if="currentProjectId === 'overview'" v-model="taskProjectFilter" size="small" clearable placeholder="项目筛选">
                  <el-option label="所有项目" value="" />
                  <el-option v-for="project in state.projects" :key="project.id" :label="project.title" :value="project.id" />
                </el-select>
                <el-button type="primary" size="small" @click="openTaskDialog()">新增任务</el-button>
              </div>
            </div>

            <div class="task-table">
              <div class="task-head">
                <span>任务</span><span>项目/分组</span><span>象限</span><span>状态</span><span>截止</span><span></span>
              </div>
              <div v-for="task in visibleTasks" :key="task.id" class="task-row" :class="{ completed: task.status === 'done' }">
                <button class="task-name" @click="openTaskDialog(task.id)">{{ task.title }}</button>
                <span class="muted">{{ projectName(task.projectId) }} / {{ task.group || '默认分组' }}</span>
                <span>{{ task.quadrant }}</span>
                <span class="muted">{{ TASK_STATUS_LABELS[task.status] }}</span>
                <span class="muted">{{ task.dueDate || '-' }}</span>
                <el-button link type="danger" size="small" @click="deleteTask(task.id)">删</el-button>
              </div>
              <el-empty v-if="!visibleTasks.length" description="暂无任务" />
            </div>
          </section>

          <section class="log-section">
            <div class="panel-header"><h3>项目日志</h3></div>
            <div class="log-list">
              <div v-for="log in visibleLogs" :key="log.id" class="log-item">
                <div class="log-meta">
                  <strong>{{ logProjectName(log.projectId) }}</strong>
                  <span>
                    {{ formatLogTime(log.createdAt) }}
                    <el-button link size="small" @click="openLogDialog(log.id)">改</el-button>
                    <el-button link type="danger" size="small" @click="deleteLog(log.id)">删</el-button>
                  </span>
                </div>
                <p>{{ log.content }}</p>
              </div>
              <el-empty v-if="!visibleLogs.length" description="暂无日志" />
            </div>
          </section>
        </div>
      </section>
    </div>

    <el-dialog v-model="projectDialogVisible" :title="editingProjectId ? '编辑项目' : '新增项目'" width="480px">
      <el-form :model="projectForm" label-width="88px" label-position="left">
        <el-form-item label="项目名称" required><el-input v-model="projectForm.title" /></el-form-item>
        <el-form-item label="截止日期"><el-date-picker v-model="projectForm.deadline" type="date" value-format="YYYY-MM-DD" class="full-width" /></el-form-item>
        <el-form-item label="状态">
          <el-select v-model="projectForm.status"><el-option label="进行中" value="active" /><el-option label="已完成" value="done" /></el-select>
        </el-form-item>
        <el-form-item label="MD 路径"><el-input v-model="projectForm.mdPath" placeholder="可选，本地 Markdown 文件路径" /></el-form-item>
        <el-form-item label="附件路径"><el-input v-model="projectForm.attPath" placeholder="可选，本地附件目录路径" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="projectDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveProject">保存项目</el-button>
      </template>
    </el-dialog>

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
          <el-col :span="12"><el-form-item label="象限"><el-select v-model="taskForm.quadrant"><el-option v-for="quadrant in TASK_QUADRANTS" :key="quadrant" :label="TASK_QUADRANT_LABELS[quadrant]" :value="quadrant" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="状态"><el-select v-model="taskForm.status"><el-option label="未开始" value="todo" /><el-option label="进行中" value="in-progress" /><el-option label="已完成" value="done" /></el-select></el-form-item></el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12"><el-form-item label="分组"><el-input v-model="taskForm.group" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="排序"><el-input-number v-model="taskForm.groupOrder" :min="0" class="full-width" /></el-form-item></el-col>
        </el-row>
        <el-form-item label="成员"><el-input v-model="taskForm.members" /></el-form-item>
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

    <el-dialog v-model="logDialogVisible" title="修改日志" width="520px">
      <el-input v-model="logForm.content" type="textarea" :rows="6" resize="none" />
      <template #footer>
        <el-button @click="logDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveLog">保存日志</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { DataAnalysis } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useWorkbenchStore } from '../../stores/workbench'
import type { Project, Task } from '../types'
import { TASK_QUADRANT_LABELS, TASK_QUADRANT_RANK, TASK_QUADRANTS, TASK_STATUS_LABELS, addDurationBlock, createProject, createTask, removeTimeBlocksBySource } from '../store'
import { dateTimeLabel, minutesToTime, nowTime, timeToMinutes, todayStr, uid } from '../utils'

const store = useWorkbenchStore()
const state = computed(() => store.state)

const currentProjectId = ref('overview')
const noteProjectId = ref('')
const noteContent = ref('')
const taskProjectFilter = ref('')
const projectDialogVisible = ref(false)
const taskDialogVisible = ref(false)
const logDialogVisible = ref(false)
const editingProjectId = ref('')
const editingTaskId = ref('')
const editingLogId = ref('')

const projectForm = reactive({ title: '', deadline: '', status: 'active' as Project['status'], mdPath: '', attPath: '' })
const taskForm = reactive({ title: '', projectId: '', quadrant: 'Q3' as Task['quadrant'], status: 'todo' as Task['status'], isToday: true, dueDate: todayStr(), group: '默认分组', groupOrder: 0, members: '自己' })
const logForm = reactive({ content: '' })

const currentProject = computed(() => state.value.projects.find((project) => project.id === currentProjectId.value))
const activeProjectsCount = computed(() => state.value.projects.filter((project) => project.status !== 'done').length)
const detailTitle = computed(() => currentProject.value?.title || '项目全局概览')
const detailSubtitle = computed(() => currentProject.value ? `${projectTasks.value.length} 条任务` : `${state.value.projects.length} 个项目，${state.value.tasks.length} 条任务`)
const projectTasks = computed(() => state.value.tasks.filter((task) => task.projectId === currentProjectId.value))

const visibleTasks = computed(() => {
  const list = currentProjectId.value === 'overview'
    ? state.value.tasks.filter((task) => !taskProjectFilter.value || task.projectId === taskProjectFilter.value)
    : projectTasks.value
  return [...list].sort((a, b) => {
    if (a.status === 'done' && b.status !== 'done') return 1
    if (a.status !== 'done' && b.status === 'done') return -1
    return TASK_QUADRANT_RANK[a.quadrant] - TASK_QUADRANT_RANK[b.quadrant] || (a.groupOrder || 0) - (b.groupOrder || 0)
  })
})

const visibleLogs = computed(() => {
  const list = currentProjectId.value === 'overview' ? state.value.projectLogs : state.value.projectLogs.filter((log) => log.projectId === currentProjectId.value)
  return [...list].sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
})

watch(currentProjectId, (id) => {
  if (id !== 'overview') noteProjectId.value = id
})

const selectProject = (id: string) => { currentProjectId.value = id }
const projectName = (id: string) => state.value.projects.find((project) => project.id === id)?.title || '无项目'
const logProjectName = (id: string) => id ? projectName(id) : '全局记录'
const formatLogTime = (value: string) => value ? value.replace('T', ' ').slice(0, 16) : ''
const projectTaskStats = (projectId: string) => {
  const tasks = state.value.tasks.filter((task) => task.projectId === projectId)
  if (!tasks.length) return '0/0'
  const doneCount = tasks.filter((task) => task.status === 'done').length
  return `${doneCount}/${tasks.length}`
}

const openProjectDialog = (projectId = '') => {
  editingProjectId.value = projectId
  const project = state.value.projects.find((item) => item.id === projectId)
  Object.assign(projectForm, project || { title: '', deadline: '', status: 'active', mdPath: '', attPath: '' })
  projectDialogVisible.value = true
}

const saveProject = async () => {
  const title = projectForm.title.trim()
  if (!title) return ElMessage.warning('项目名称不能为空')
  await store.updateState((draft) => {
    if (editingProjectId.value) {
      const project = draft.projects.find((item) => item.id === editingProjectId.value)
      if (project) Object.assign(project, projectForm, { title })
    } else {
      const project = createProject(title, projectForm.deadline)
      draft.projects.unshift({ ...project, status: projectForm.status, mdPath: projectForm.mdPath, attPath: projectForm.attPath })
      currentProjectId.value = project.id
      noteProjectId.value = project.id
    }
  })
  projectDialogVisible.value = false
}

const toggleProjectStatus = async (projectId: string) => {
  await store.updateState((draft) => {
    const project = draft.projects.find((item) => item.id === projectId)
    if (project) project.status = project.status === 'done' ? 'active' : 'done'
  })
}

const deleteProject = async (projectId: string) => {
  await ElMessageBox.confirm('确认删除此项目？项目下任务会保留但解除项目关联。', '删除项目', { type: 'warning' })
  await store.updateState((draft) => {
    draft.projects = draft.projects.filter((project) => project.id !== projectId)
    draft.tasks.forEach((task) => { if (task.projectId === projectId) task.projectId = '' })
    draft.projectLogs.forEach((log) => { if (log.projectId === projectId) log.projectId = '' })
  })
  currentProjectId.value = 'overview'
  noteProjectId.value = ''
}

const addNote = async () => {
  const content = noteContent.value.trim()
  if (!content) return
  await store.updateState((draft) => {
    draft.projectLogs.unshift({ id: uid('plog'), content, projectId: noteProjectId.value || '', createdAt: dateTimeLabel() })
  })
  noteContent.value = ''
}

const openLogDialog = (logId: string) => {
  editingLogId.value = logId
  logForm.content = state.value.projectLogs.find((log) => log.id === logId)?.content || ''
  logDialogVisible.value = true
}

const saveLog = async () => {
  const content = logForm.content.trim()
  if (!content) return
  await store.updateState((draft) => {
    const log = draft.projectLogs.find((item) => item.id === editingLogId.value)
    if (log) {
      log.content = content
      log.updatedAt = dateTimeLabel()
    }
  })
  logDialogVisible.value = false
}

const deleteLog = async (logId: string) => {
  await ElMessageBox.confirm('确认删除这条日志？', '删除日志', { type: 'warning' })
  await store.updateState((draft) => {
    draft.projectLogs = draft.projectLogs.filter((log) => log.id !== logId)
  })
}

const resetTaskForm = () => Object.assign(taskForm, { title: '', projectId: currentProjectId.value === 'overview' ? '' : currentProjectId.value, quadrant: 'Q3', status: 'todo', isToday: true, dueDate: todayStr(), group: '默认分组', groupOrder: 0, members: '自己' })

const openTaskDialog = (taskId = '') => {
  editingTaskId.value = taskId
  const task = state.value.tasks.find((item) => item.id === taskId)
  if (task) Object.assign(taskForm, task)
  else resetTaskForm()
  taskDialogVisible.value = true
}

const saveTask = async () => {
  const title = taskForm.title.trim()
  if (!title) return ElMessage.warning('任务名称不能为空')
  await store.updateState((draft) => {
    const previous = editingTaskId.value ? draft.tasks.find((item) => item.id === editingTaskId.value) : null
    if (previous) {
      const wasDone = previous.status === 'done'
      Object.assign(previous, taskForm, { title, activeStart: taskForm.status === 'in-progress' ? (previous.activeStart || nowTime()) : null })
      if (!wasDone && previous.status === 'done') {
        const end = nowTime()
        addDurationBlock(draft, `完成任务：${previous.title}`, minutesToTime(Math.max(0, timeToMinutes(end) - 1)), end, { taskId: previous.id, sourceType: 'task-complete', sourceId: previous.id })
      }
      if (wasDone && previous.status !== 'done') removeTimeBlocksBySource(draft, 'task-complete', previous.id)
    } else {
      const task = createTask(title, taskForm.projectId, taskForm.dueDate)
      draft.tasks.unshift({ ...task, ...taskForm, id: task.id, title, activeStart: taskForm.status === 'in-progress' ? nowTime() : null })
    }
  })
  taskDialogVisible.value = false
}

const deleteTask = async (taskId: string) => {
  await ElMessageBox.confirm('确认删除这条任务？关联时间块会保留但解除任务关联。', '删除任务', { type: 'warning' })
  await store.updateState((draft) => {
    draft.tasks = draft.tasks.filter((task) => task.id !== taskId)
    removeTimeBlocksBySource(draft, 'task-complete', taskId)
    Object.values(draft.timeBlocks).forEach((blocks) => blocks.forEach((block) => { if (block.taskId === taskId) block.taskId = '' }))
  })
}

onMounted(() => store.loadState())
</script>

<style scoped>
.project-manager { height: 100%; display: flex; flex-direction: column; gap: 16px; color: #1e293b; }
.module-header { padding: 24px; background: linear-gradient(135deg, rgba(255,255,255,0.8), rgba(255,255,255,0.5)); border-radius: 16px; border: 1px solid rgba(255,255,255,0.6); box-shadow: 0 10px 30px rgba(0,0,0,0.03); }

/* 这里加入了 flex-wrap: wrap，修复卡片标题堆叠问题 */
.header-content { display: flex; justify-content: space-between; align-items: center; gap: 16px; flex-wrap: wrap; }

.title-box { display: flex; align-items: center; gap: 16px; }
.title-icon { font-size: 32px; color: #2f6f84; background: #fff; padding: 10px; border-radius: 14px; box-shadow: 0 4px 15px rgba(47,111,132,0.15); }
.title-box h2 { margin: 0; font-size: 22px; font-weight: 700; }
.title-box p { margin: 4px 0 0; font-size: 11px; color: #94a3b8; letter-spacing: 1px; }
.status-board { display: flex; gap: 24px; }
.status-item { display: flex; flex-direction: column; align-items: center; gap: 4px; }
.status-item span { font-size: 11px; color: #94a3b8; }
.status-item strong { font-size: 18px; color: #2f6f84; }
.workspace-grid { display: grid; grid-template-columns: 280px minmax(0, 1fr); gap: 16px; min-height: 0; flex: 1; }
.project-column, .detail-column { background: #fff; border-radius: 16px; padding: 16px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.02); min-height: 0; }
.project-column { display: flex; flex-direction: column; gap: 12px; }
.panel-header { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 10px; }
.panel-header.compact { margin: 0; }
.panel-header h3 { margin: 0; color: #2f6f84; font-size: 15px; }
.overview-button { width: 100%; border: 1px solid #e2e8f0; background: #f8fafc; border-radius: 10px; padding: 10px 12px; text-align: left; font-weight: 700; color: #1e293b; cursor: pointer; }
.overview-button.active, .project-item.active { border-color: rgba(47,111,132,.35); background: linear-gradient(135deg, rgba(47,111,132,.1), rgba(79,174,217,.05)); }
.project-list { flex: 1; overflow: auto; display: flex; flex-direction: column; gap: 6px; min-height: 120px; }
.project-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; border: 1px solid #e2e8f0; border-radius: 10px; background: #f8fafc; padding: 9px 12px; cursor: pointer; }

/* 这里新增了给项目列表标题 + 进度的布局样式 */
.project-info { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
.project-title-row { display: flex; align-items: center; gap: 6px; }
.project-title-row strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 13px; }
.task-count { font-style: normal; font-size: 12px; color: #94a3b8; font-family: monospace; white-space: nowrap; }
.project-info span { font-size: 12px; color: #64748b; }

.project-status { display: inline-flex; align-items: center; height: 20px; padding: 0 7px; border-radius: 5px; font-size: 11px; line-height: 1; border: 1px solid #dbe7ec; color: #64748b; background: #fff; white-space: nowrap; }
.project-status.done { color: #2f6f84; background: #eefaf4; border-color: #c7ead8; }
.note-box { display: flex; flex-direction: column; gap: 10px; padding-top: 12px; border-top: 1px solid #e2e8f0; }
.detail-column { display: flex; flex-direction: column; gap: 12px; min-width: 0; }

/* 这里加入了 flex-wrap: wrap，修复操作按钮挤压问题 */
.detail-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; flex-wrap: wrap; }

.detail-head h3 { margin: 0; color: #1e293b; font-size: 20px; }
.detail-head p { margin: 4px 0 0; color: #64748b; font-size: 13px; }
.detail-actions { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }

/* 移除了原本复杂的动态网格，因为删掉了 Timeline，直接固定为两列分布 */
.detail-body { display: grid; grid-template-columns: minmax(0px, 1fr) minmax(0, 1fr); gap: 10px; min-height: 0; flex: 1; min-width: 0; }
.task-section, .log-section { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px; min-height: 0; display: flex; flex-direction: column; min-width: 0; }
.task-tools { display: flex; gap: 8px; align-items: center; }

/* 移除了 timeline-grid */
.task-table, .log-list { overflow: auto; min-height: 0; flex: 1; }

.task-head, .task-row { display: grid; grid-template-columns: minmax(160px, 1.5fr) minmax(120px, 1fr) 48px 58px 78px 34px; gap: 8px; align-items: center; }
.task-head { position: sticky; top: 0; z-index: 1; padding: 6px 8px; background: #eef6f8; color: #64748b; font-size: 11px; font-weight: 700; border-bottom: 1px solid #dbe7ec; }
.task-row { min-height: 32px; padding: 5px 8px; background: #fff; border-bottom: 1px solid #eef2f7; font-size: 12px; }
.task-row.completed { color: #94a3b8; }
.task-name { padding: 0; border: 0; background: transparent; color: #1e293b; font-weight: 700; text-align: left; cursor: pointer; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.task-name:hover { color: #2f6f84; text-decoration: underline; }
.muted { color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.log-item { background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; margin-bottom: 8px; font-size: 12px; }
.log-meta { display: flex; justify-content: space-between; gap: 8px; color: #64748b; font-size: 11px; align-items: center; }
.log-meta strong { color: #2f6f84; }
.log-item p { margin: 5px 0 0; white-space: pre-wrap; line-height: 1.5; }
.full-width { width: 100%; }

/* 精简媒体查询代码 */
@media (max-width: 800px) { 
  .workspace-grid, .detail-body { grid-template-columns: 1fr; } 
  .task-head { display: none; } 
  .task-row { grid-template-columns: 1fr; } 
  .task-row > *:nth-child(n+2) { display: none; } 
}
</style>
