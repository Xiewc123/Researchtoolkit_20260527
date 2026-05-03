export interface AttendanceLog {
  start: string
  end?: string
  blockId?: string
}

export interface AttendanceDay {
  logs: AttendanceLog[]
  leaves: any[]
}

export type TimeBlockSource =
  | 'manual'
  | 'attendance'
  | 'leave'
  | 'focus'
  | 'task-complete'

export interface TimeBlock {
  id: string
  title: string
  start: string
  end: string
  taskId: string
  sourceType?: TimeBlockSource
  sourceId?: string
}

export interface FocusSession {
  id: string
  date: string
  start: string
  end: string
  minutes: number
  title: string
  taskId: string
}

export interface ActiveFocus {
  mode: 'focus' | 'break'
  startedAt: number
  durationSeconds: number
  taskId: string
  category: string
  startTime: string
}

export interface Focus {
  active: ActiveFocus | null
  sessions: FocusSession[]
}

export interface Task {
  id: string
  title: string
  projectId: string
  quadrant: 'Q1' | 'Q2' | 'Q3' | 'Q4'
  status: 'todo' | 'in-progress' | 'done'
  isToday: boolean
  dueDate: string
  activeStart: string | null
  group: string
  groupOrder: number
  members: string
  partialDates: string[]
  createdAt: string
}

export interface Project {
  id: string
  title: string
  deadline: string
  status: 'active' | 'done'
  createdAt: string
  files: string[]
  mdPath: string
  attPath: string
}

export interface Submission {
  id: string
  title: string
  venue: string
  deadline: string
  stage: string
  logs: any[]
  createdAt: string
  updatedAt: string
}

export interface Thesis {
  meta: {
    title: string
    targetDate: string
  }
  milestones: any[]
  chapters: any[]
  logs: any[]
}

export interface Meeting {
  id: string
  title: string
  date: string
}

export interface WorkbenchState {
  attendance: Record<string, AttendanceDay>
  timeBlocks: Record<string, TimeBlock[]>
  focus: Focus
  projects: Project[]
  tasks: Task[]
  submissions: Submission[]
  thesis: Thesis
  meetings: Meeting[]
  projectLogs: any[]
  updatedAt: string
}
