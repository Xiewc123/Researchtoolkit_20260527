import { createRouter, createWebHistory } from 'vue-router'
import DashboardHome from '../workbench/components/DashboardHome.vue'
import ScheduleManager from '../workbench/components/ScheduleManager.vue'
import ProjectManager from '../workbench/components/ProjectManager.vue'
import TextConvert from '../components/TextConvert.vue'
import DynastySearch from '../components/DynastySearch.vue'

const routes = [
  { path: '/', redirect: '/home' },
  { path: '/home', component: DashboardHome },
  { path: '/schedule', component: ScheduleManager },
  { path: '/project', component: ProjectManager },
  { path: '/convert', component: TextConvert },
  { path: '/dynasty', component: DynastySearch }
]

export default createRouter({
  history: createWebHistory(),
  routes
})