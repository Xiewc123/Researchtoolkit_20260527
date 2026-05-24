import { Calendar, Collection, DataAnalysis, Monitor, Timer } from '@element-plus/icons-vue'

export interface WorkbenchModuleMeta {
  index: string
  title: string
  desc: string
  icon: any
  route: string
}

export const workbenchModules: WorkbenchModuleMeta[] = [
  { index: 'home', title: '工作台总览', desc: '今日安排与专注记录', icon: Monitor, route: '/home' },
  { index: 'schedule', title: '日程管理', desc: '时间块与日程记录', icon: Calendar, route: '/schedule' },
  { index: 'project', title: '项目管理', desc: '项目、任务与日志', icon: DataAnalysis, route: '/project' },
  { index: 'convert', title: '文本转换', desc: '繁简转换与 OCR 辅助', icon: Collection, route: '/convert' },
  { index: 'dynasty', title: '朝代年号表', desc: '历史朝代与帝王检索', icon: Calendar, route: '/dynasty' },
  { index: 'history', title: '世界历史年代图表', desc: '文明与帝国时间轴', icon: Timer, route: '/history' },
]

export const resolveRouteByMenuIndex = (index: string): string => {
  const hit = workbenchModules.find((item) => item.index === index)
  return hit?.route || '/home'
}
