import type { Project, Submission, Task, TimeBlock, TimeBlockSource, WorkbenchState } from './types'
import { dateTimeLabel, diffDays, minutesToTime, nowTime, timeToMinutes, todayStr, uid } from './utils'

export const STAGES = [
  'Ideation',
  'Writing',
  'Ready to Submit',
  'Submitted',
  'Under Review',
  'Revision',
  'Accepted',
  'Published',
  'Rejected',
]

export const TASK_QUADRANTS = ['Q1', 'Q2', 'Q3', 'Q4'] as const

export const TASK_QUADRANT_LABELS: Record<Task['quadrant'], string> = {
  Q1: 'Q1 重要且紧急',
  Q2: 'Q2 重要不紧急',
  Q3: 'Q3 紧急不重要',
  Q4: 'Q4 不紧急不重要',
}

export const TASK_STATUS_LABELS: Record<Task['status'], string> = {
  todo: '未开始',
  'in-progress': '进行中',
  done: '已完成',
}

export const TASK_QUADRANT_RANK: Record<Task['quadrant'], number> = {
  Q1: 1,
  Q2: 2,
  Q3: 3,
  Q4: 4,
}

export const defaultState = (): WorkbenchState => ({
  attendance: {},
  timeBlocks: {},
  focus: { active: null, sessions: [] },
  projects: [],
  tasks: [],
  submissions: [],
  thesis: {
    meta: { title: '', targetDate: '' },
    milestones: [],
    chapters: [],
    logs: [],
  },
  meetings: [],
  projectLogs: [],
  updatedAt: dateTimeLabel(),
})

const normalizeAttendance = (input: unknown): WorkbenchState['attendance'] => {
  const obj = input && typeof input === 'object' ? input as Record<string, any> : {}
  const out: WorkbenchState['attendance'] = {}
  for (const [date, day] of Object.entries(obj)) {
    out[date] = {
      logs: Array.isArray(day?.logs) ? day.logs : [],
      leaves: Array.isArray(day?.leaves) ? day.leaves : [],
    }
  }
  return out
}

const normalizeTimeBlocks = (input: unknown): WorkbenchState['timeBlocks'] => {
  const obj = input && typeof input === 'object' ? input as Record<string, any> : {}
  const out: WorkbenchState['timeBlocks'] = {}
  for (const [date, blocks] of Object.entries(obj)) {
    out[date] = (Array.isArray(blocks) ? blocks : []).map((block: any) => ({
      id: String(block?.id || uid('blk')),
      title: String(block?.title || ''),
      start: String(block?.start || '09:00'),
      end: String(block?.end || ''),
      taskId: String(block?.taskId || ''),
      sourceType: block?.sourceType || 'manual',
      sourceId: String(block?.sourceId || ''),
    }))
  }
  return out
}

const normalizeTask = (task: any): Task => ({
  id: String(task?.id || uid('task')),
  title: String(task?.title || '').trim(),
  projectId: String(task?.projectId || ''),
  quadrant: TASK_QUADRANTS.includes(task?.quadrant) ? task.quadrant : 'Q3',
  status: ['todo', 'in-progress', 'done'].includes(task?.status) ? task.status : 'todo',
  isToday: Boolean(task?.isToday),
  dueDate: String(task?.dueDate || ''),
  activeStart: task?.activeStart ? String(task.activeStart) : null,
  group: String(task?.group || '默认分组'),
  groupOrder: Number(task?.groupOrder || 0),
  members: String(task?.members || '自己'),
  partialDates: Array.isArray(task?.partialDates) ? task.partialDates.map(String) : [],
  createdAt: String(task?.createdAt || dateTimeLabel()),
})

const normalizeProject = (project: any): Project => ({
  id: String(project?.id || uid('proj')),
  title: String(project?.title || '').trim(),
  deadline: String(project?.deadline || ''),
  status: project?.status === 'done' ? 'done' : 'active',
  createdAt: String(project?.createdAt || dateTimeLabel()),
  files: Array.isArray(project?.files) ? project.files.map(String) : [],
  mdPath: String(project?.mdPath || ''),
  attPath: String(project?.attPath || ''),
})

const normalizeSubmissions = (input: unknown): Submission[] =>
  (Array.isArray(input) ? input : []).map((submission: any) => ({
    id: String(submission?.id || uid('sub')),
    title: String(submission?.title || ''),
    venue: String(submission?.venue || ''),
    deadline: String(submission?.deadline || ''),
    stage: STAGES.includes(submission?.stage) ? submission.stage : STAGES[0],
    logs: Array.isArray(submission?.logs) ? submission.logs : [],
    createdAt: String(submission?.createdAt || dateTimeLabel()),
    updatedAt: String(submission?.updatedAt || ''),
  }))

export const normalizeState = (raw: unknown): WorkbenchState => {
  let parsed = raw
  if (typeof raw === 'string') {
    try {
      parsed = JSON.parse(raw)
    } catch {
      parsed = {}
    }
  }

  const base = defaultState()
  const state = parsed && typeof parsed === 'object' ? parsed as Record<string, any> : {}

  return {
    ...base,
    attendance: normalizeAttendance(state.attendance),
    timeBlocks: normalizeTimeBlocks(state.timeBlocks),
    focus: {
      active: state.focus?.active && typeof state.focus.active === 'object' ? state.focus.active : null,
      sessions: Array.isArray(state.focus?.sessions) ? state.focus.sessions : [],
    },
    projects: (Array.isArray(state.projects) ? state.projects : []).map(normalizeProject),
    tasks: (Array.isArray(state.tasks) ? state.tasks : []).map(normalizeTask).filter((task) => task.title),
    submissions: normalizeSubmissions(state.submissions),
    thesis: {
      meta: {
        title: String(state.thesis?.meta?.title || ''),
        targetDate: String(state.thesis?.meta?.targetDate || ''),
      },
      milestones: Array.isArray(state.thesis?.milestones) ? state.thesis.milestones : [],
      chapters: Array.isArray(state.thesis?.chapters) ? state.thesis.chapters : [],
      logs: Array.isArray(state.thesis?.logs) ? state.thesis.logs : [],
    },
    meetings: Array.isArray(state.meetings) ? state.meetings : [],
    projectLogs: Array.isArray(state.projectLogs) ? state.projectLogs : [],
    updatedAt: String(state.updatedAt || base.updatedAt),
  }
}

export const touchState = (state: WorkbenchState) => {
  state.updatedAt = dateTimeLabel()
}

export const getDayAttendance = (state: WorkbenchState, date = todayStr()) => {
  state.attendance[date] ||= { logs: [], leaves: [] }
  state.attendance[date].logs ||= []
  state.attendance[date].leaves ||= []
  return state.attendance[date]
}

export const getDayBlocks = (state: WorkbenchState, date = todayStr()) => {
  state.timeBlocks[date] ||= []
  return state.timeBlocks[date]
}

export const createProject = (title: string, deadline = ''): Project => ({
  id: uid('proj'),
  title: title.trim(),
  deadline,
  status: 'active',
  createdAt: dateTimeLabel(),
  files: [],
  mdPath: '',
  attPath: '',
})

export const createTask = (title: string, projectId = '', dueDate = ''): Task => ({
  id: uid('task'),
  title: title.trim(),
  projectId,
  dueDate,
  status: 'todo',
  quadrant: 'Q3',
  isToday: false,
  activeStart: null,
  group: '默认分组',
  groupOrder: 0,
  members: '自己',
  partialDates: [],
  createdAt: dateTimeLabel(),
})

export const createTimeBlock = (
  title: string,
  start: string,
  end: string,
  taskId = '',
  sourceType: TimeBlockSource = 'manual',
  sourceId = ''
): TimeBlock => ({
  id: uid('blk'),
  title: title.trim(),
  start,
  end,
  taskId,
  sourceType,
  sourceId,
})

export const addTimeBlock = (
  state: WorkbenchState,
  date: string,
  payload: {
    title: string
    start: string
    end?: string
    taskId?: string
    sourceType?: TimeBlockSource
    sourceId?: string
  }
) => {
  const block = createTimeBlock(
    payload.title,
    payload.start,
    payload.end || '',
    payload.taskId || '',
    payload.sourceType || 'manual',
    payload.sourceId || ''
  )
  getDayBlocks(state, date).push(block)
  return block
}

export const removeTimeBlocksBySource = (
  state: WorkbenchState,
  sourceType: TimeBlockSource,
  sourceId: string,
  date?: string
) => {
  const dates = date ? [date] : Object.keys(state.timeBlocks)
  dates.forEach((day) => {
    state.timeBlocks[day] = getDayBlocks(state, day).filter(
      (block) => !(block.sourceType === sourceType && block.sourceId === sourceId)
    )
  })
}

export const updateTimeBlockEnd = (state: WorkbenchState, blockId: string, end = nowTime()) => {
  for (const blocks of Object.values(state.timeBlocks)) {
    const block = blocks.find((item) => item.id === blockId)
    if (block) {
      block.end = end
      return true
    }
  }
  return false
}

export const createSubmission = (title: string, venue: string, deadline: string, stage: string): Submission => ({
  id: uid('sub'),
  title: title.trim(),
  venue: venue.trim(),
  deadline,
  stage: STAGES.includes(stage) ? stage : STAGES[0],
  logs: [],
  createdAt: dateTimeLabel(),
  updatedAt: '',
})

const doneSubStages = new Set(['Accepted', 'Published', 'Rejected'])
const openWorkLogsToday = (state: WorkbenchState) =>
  getDayAttendance(state).logs.filter((log) => !log.end).length
const nearestSubmission = (state: WorkbenchState) => {
  const list = state.submissions
    .filter((submission) => submission.deadline && !doneSubStages.has(submission.stage))
    .sort((a, b) => a.deadline.localeCompare(b.deadline))
  return list[0] || null
}

export const getAttendanceStatus = (state: WorkbenchState) => {
  const logs = getDayAttendance(state).logs
  if (!logs.length) return '未打卡'
  return logs.some((log) => !log.end) ? '已上工' : '已下工'
}

export const getDashboardStats = (state: WorkbenchState) => {
  const today = todayStr()
  const doneTasks = state.tasks.filter((task) => task.status === 'done').length
  const todayTasks = state.tasks.filter((task) => task.dueDate === today && task.status !== 'done').length

  return [
    { label: '任务总量', value: state.tasks.length },
    { label: '任务完成', value: doneTasks },
    { label: '今日任务', value: todayTasks },
    { label: '活跃项目', value: state.projects.filter((project) => project.status !== 'done').length },
  ]
}

export const getDashboardFlow = (state: WorkbenchState) => {
  const todayBlocks = getDayBlocks(state)
  return [
    {
      label: '日程管理',
      meta: `${todayBlocks.length} 个时间块，${openWorkLogsToday(state)} 条未收口打卡`,
      target: '/schedule',
    },
    {
      label: '项目管理',
      meta: `${state.projects.length} 个项目，${state.tasks.length} 条任务`,
      target: '/project',
    },
  ]
}

export const getDashboardAlerts = (state: WorkbenchState) => {
  const today = todayStr()
  const alerts: Array<{ id: string; text: string; tone: 'info' | 'warn' | 'danger' }> = []

  const nearSub = nearestSubmission(state)
  if (nearSub) {
    const days = diffDays(today, nearSub.deadline)
    alerts.push({
      id: `sub-${nearSub.id}`,
      tone: days < 0 ? 'danger' : days === 0 ? 'warn' : 'info',
      text: `投稿《${nearSub.title}》${days < 0 ? `已逾期 ${Math.abs(days)} 天` : days === 0 ? '今天截止' : `还有 ${days} 天`}`,
    })
  }

  const activeTasksWithDue = state.tasks.filter((task) => task.status !== 'done' && task.dueDate)
  const overdueTasks = activeTasksWithDue.filter((task) => diffDays(today, task.dueDate) < 0)
  if (overdueTasks.length) {
    alerts.push({
      id: 'overdue-tasks',
      tone: 'danger',
      text: `有 ${overdueTasks.length} 条任务已逾期：${overdueTasks.map((task) => task.title).join('、')}`,
    })
  }

  const todayTasks = activeTasksWithDue.filter((task) => diffDays(today, task.dueDate) === 0)
  if (todayTasks.length) {
    alerts.push({
      id: 'today-tasks',
      tone: 'warn',
      text: `今天截止任务：${todayTasks.map((task) => task.title).join('、')}`,
    })
  }

  activeTasksWithDue
    .filter((task) => {
      const days = diffDays(today, task.dueDate)
      return days > 0 && days <= 3
    })
    .forEach((task) => {
      alerts.push({
        id: `near-task-${task.id}`,
        tone: 'info',
        text: `任务《${task.title}》还有 ${diffDays(today, task.dueDate)} 天截止`,
      })
    })

  const activeProjectsWithDue = state.projects.filter((project) => project.status !== 'done' && project.deadline)
  const overdueProjects = activeProjectsWithDue.filter((project) => diffDays(today, project.deadline) < 0)
  if (overdueProjects.length) {
    alerts.push({
      id: 'overdue-projects',
      tone: 'danger',
      text: `有 ${overdueProjects.length} 个项目已逾期：${overdueProjects.map((project) => project.title).join('、')}`,
    })
  }

  activeProjectsWithDue
    .filter((project) => {
      const days = diffDays(today, project.deadline)
      return days >= 0 && days <= 3
    })
    .forEach((project) => {
      const days = diffDays(today, project.deadline)
      alerts.push({
        id: `near-project-${project.id}`,
        tone: days === 0 ? 'warn' : 'info',
        text: `项目《${project.title}》${days === 0 ? '今天截止' : `还有 ${days} 天截止`}`,
      })
    })

  const openLogs = openWorkLogsToday(state)
  if (openLogs) alerts.push({ id: 'open-worklogs', tone: 'warn', text: `有 ${openLogs} 条打卡尚未下工` })

  const thesisTarget = state.thesis.meta.targetDate
  if (thesisTarget) {
    const days = diffDays(today, thesisTarget)
    alerts.push({
      id: 'thesis-target',
      tone: days < 0 ? 'danger' : 'info',
      text: `论文目标日期 ${thesisTarget}，${days < 0 ? `已超期 ${Math.abs(days)} 天` : `还有 ${days} 天`}`,
    })
  }

  if (!alerts.length) alerts.push({ id: 'no-alerts', tone: 'info', text: '当前没有高优先级风险，可以继续推进主线任务。' })
  return alerts
}

export const getFocusHeatmap = (state: WorkbenchState, dayCount = 364) => {
  const dayMap: Record<string, number> = {}
  state.focus.sessions.forEach((session) => {
    if (!session?.date) return
    dayMap[session.date] = (dayMap[session.date] || 0) + Number(session.minutes || 0)
  })

  const today = new Date()
  const startDate = new Date(today)
  startDate.setDate(today.getDate() - dayCount)
  const prefix = startDate.getDay()
  const cells = []
  for (let i = 0; i < prefix; i++) cells.push({ key: `blank-${i}`, date: '', minutes: 0, color: 'blank', title: '' })

  const months: Array<{ left: number; label: string }> = []
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  let lastMonthCol = -1

  for (let i = 0; i <= dayCount; i++) {
    const day = new Date(startDate)
    day.setDate(startDate.getDate() + i)
    const date = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, '0')}-${String(day.getDate()).padStart(2, '0')}`
    const minutes = dayMap[date] || 0
    const colIndex = Math.floor((i + prefix) / 7)
    if (day.getDate() === 1 || i === 0) {
      if (lastMonthCol === -1 || colIndex - lastMonthCol >= 3) {
        months.push({ left: colIndex * 16, label: monthNames[day.getMonth()] })
        lastMonthCol = colIndex
      }
    }
    cells.push({
      key: date,
      date,
      minutes,
      color: minutes > 420 ? 'level-8' : minutes > 360 ? 'level-7' : minutes > 300 ? 'level-6' : minutes > 240 ? 'level-5' : minutes > 180 ? 'level-4' : minutes > 120 ? 'level-3' : minutes > 60 ? 'level-2' : minutes > 0 ? 'level-1' : 'level-0',
      title: `${date}: ${minutes} min`,
    })
  }

  return { cells, months }
}

export const addDurationBlock = (
  state: WorkbenchState,
  title: string,
  start: string,
  end: string,
  options: { taskId?: string; sourceType?: TimeBlockSource; sourceId?: string; date?: string } = {}
) => {
  const startMinutes = timeToMinutes(start)
  const endMinutes = timeToMinutes(end)
  const safeEnd = endMinutes <= startMinutes ? minutesToTime(startMinutes + 1) : end
  return addTimeBlock(state, options.date || todayStr(), {
    title,
    start,
    end: safeEnd,
    taskId: options.taskId || '',
    sourceType: options.sourceType || 'manual',
    sourceId: options.sourceId || '',
  })
}
