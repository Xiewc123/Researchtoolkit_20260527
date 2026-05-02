import { Calendar, Collection, DataAnalysis, Monitor } from '@element-plus/icons-vue'

export interface WorkbenchModuleMeta {
  index: string
  title: string
  desc: string
  icon: any
  route: string
}

export const workbenchModules: WorkbenchModuleMeta[] = [
  { index: 'home', title: '工作台总览', desc: '科研日常统计与快速入口', icon: Monitor, route: '/home' },
  { index: 'schedule', title: '日程管理', desc: '安排时间块、记录日序', icon: Calendar, route: '/schedule' },
  { index: 'project', title: '项目管理', desc: '项目与任务进度跟踪', icon: DataAnalysis, route: '/project' },
  { index: 'convert', title: '文本转换', desc: '繁简转换与 OCR 辅助', icon: Collection, route: '/convert' },
  { index: 'dynasty', title: '朝代年号表', desc: '历史朝代与帝王便览', icon: Calendar, route: '/dynasty' }
]

export const resolveRouteByMenuIndex = (index: string): string => {
  const hit = workbenchModules.find(item => item.index === index)
  return hit?.route || '/home'
}
