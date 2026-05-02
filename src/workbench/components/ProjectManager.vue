<template>
  <div class="project-manager">
    <!-- 顶部标题栏 -->
    <div class="module-header">
      <div class="header-content">
        <div class="title-box">
          <el-icon class="title-icon"><DataAnalysis /></el-icon>
          <div>
            <h2>项目管理</h2>
            <p>项目进展与任务跟踪</p>
          </div>
        </div>
        <div class="status-board">
          <div class="status-item">
            <span class="status-label">活跃项目</span>
            <span class="status-value">{{ state.projects.length }}</span>
          </div>
          <div class="status-item">
            <span class="status-label">任务总数</span>
            <span class="status-value">{{ state.tasks.length }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 主内容区：双列布局 -->
    <div class="content-section">
      <!-- 左列：项目列表 -->
      <section class="project-column">
        <div class="panel-header">
          <h3>项目列表</h3>
          <el-button type="primary" size="small" @click="addProject">+ 新增</el-button>
        </div>

        <div class="project-list">
          <div
            v-for="p in state.projects"
            :key="p.id"
            :class="['project-item', currentProjectId === p.id ? 'active' : '']"
            @click="selectProject(p.id)"
          >
            <div class="project-info">
              <div class="project-title">{{ p.title }}</div>
              <div class="project-meta">{{ p.deadline || '无截止' }}</div>
            </div>
            <el-button link type="danger" size="small" @click.stop="deleteProject(p.id)">删除</el-button>
          </div>
          <div v-if="!state.projects.length" class="empty-state">暂无项目</div>
        </div>
      </section>

      <!-- 右列：项目详情 & 随手记 -->
      <section class="detail-column">
        <!-- 项目详情 -->
        <div class="detail-section">
          <div class="panel-header">
            <h3>{{ currentProjectId === 'overview' ? '总览' : (currentProject?.title || '项目详情') }}</h3>
          </div>

          <div v-if="currentProjectId === 'overview'" class="overview-content">
            <div class="task-summary">
              <div v-for="task in allTasks" :key="task.id" class="task-row">
                <span>{{ task.title }}</span>
                <span class="task-status">{{ task.status }}</span>
              </div>
              <div v-if="!allTasks.length" class="empty-state">暂无任务</div>
            </div>
          </div>

          <div v-else-if="currentProject" class="project-detail-content">
            <div class="task-summary">
              <div v-for="task in projectTasks" :key="task.id" class="task-row">
                <span>{{ task.title }}</span>
                <span class="task-status">{{ task.status }}</span>
              </div>
              <div v-if="!projectTasks.length" class="empty-state">暂无项目任务</div>
            </div>
          </div>
        </div>

        <!-- 随手记 -->
        <div class="note-section">
          <div class="panel-header">
            <h3>随手记</h3>
          </div>
          <div class="note-editor">
            <el-input
              v-model="noteContent"
              type="textarea"
              placeholder="记录想法..."
              resize="none"
              rows="4"
            />
            <el-button type="primary" @click="addNote" style="margin-top: 8px">保存</el-button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { DataAnalysis } from '@element-plus/icons-vue'
import { useWorkbenchStore } from '../../stores/workbench'
import { createProject } from '../store'

const store = useWorkbenchStore()
const state = computed(() => store.state)

const currentProjectId = ref('overview')
const noteContent = ref('')

const currentProject = computed(() => state.value.projects.find((p: any) => p.id === currentProjectId.value))

const allTasks = computed(() => state.value.tasks)
const projectTasks = computed(() => state.value.tasks.filter((t: any) => t.projectId === currentProjectId.value))

const selectProject = (id: string) => {
  currentProjectId.value = id
}

const addProject = () => {
  const title = prompt('项目名称')
  if (title) {
    const project = createProject(title)
    store.updateState(s => s.projects.push(project))
  }
}

const addNote = () => {
  if (noteContent.value.trim()) {
    store.updateState(s => {
      s.projectLogs.push({
        id: Date.now().toString(),
        content: noteContent.value,
        projectId: currentProjectId.value,
        createdAt: new Date().toISOString()
      })
    })
    noteContent.value = ''
  }
}

const deleteProject = (id: string) => {
  if (confirm('确定删除此项目？')) {
    store.updateState(s => {
      s.projects = s.projects.filter((p: any) => p.id !== id)
      s.tasks = s.tasks.filter((t: any) => t.projectId !== id)
    })
    if (currentProjectId.value === id) {
      currentProjectId.value = 'overview'
    }
  }
}

onMounted(() => {
  store.loadState()
})
</script>

<style scoped>
.project-manager {
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

/* 主内容区 */
.content-section {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 24px;
  flex: 1;
  min-height: 0;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.panel-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.project-column,
.detail-column {
  background: linear-gradient(135deg, #f8fafc 0%, #f5f9ff 100%);
  border: 1px solid #cffafe;
  border-radius: 14px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.detail-column {
  display: grid;
  grid-template-rows: auto 1fr auto 1fr;
  gap: 12px;
}

.project-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 12px;
  background: white;
  border: 1px solid rgba(47,111,132,0.1);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.project-item:hover {
  border-color: rgba(47,111,132,0.2);
}

.project-item.active {
  background: linear-gradient(135deg, rgba(47,111,132,0.1) 0%, rgba(79,174,217,0.05) 100%);
  border-color: rgba(47,111,132,0.3);
  border-left: 3px solid #2f6f84;
  padding-left: 9px;
}

.project-info {
  flex: 1;
  min-width: 0;
}

.project-title {
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 2px;
}

.project-meta {
  font-size: 0.75rem;
  color: #94a3b8;
}

.detail-section,
.note-section {
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
}

.detail-section {
  flex: 1;
  min-height: 200px;
}

.overview-content,
.project-detail-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.task-summary {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.task-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background: white;
  border: 1px solid rgba(47,111,132,0.1);
  border-radius: 10px;
  font-size: 0.9rem;
}

.task-status {
  font-size: 0.75rem;
  color: #94a3b8;
  background: rgba(47,111,132,0.05);
  padding: 2px 8px;
  border-radius: 4px;
}

.note-editor {
  display: flex;
  flex-direction: column;
}

.note-editor :deep(.el-textarea) {
  background: white;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
}
</style>