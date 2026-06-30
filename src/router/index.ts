import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'portfolio',
    component: () => import('@/views/PortfolioView.vue'),
  },
  {
    // Dynamic admin path — the AdminView handles its own auth check on mount
    path: '/:adminPath',
    name: 'admin',
    component: () => import('@/views/AdminView.vue'),
    meta: { isAdmin: true },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to) {
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0, behavior: 'smooth' }
  },
})

export default router
