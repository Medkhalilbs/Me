import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import api from '@/api'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'portfolio',
    component: () => import('@/views/PortfolioView.vue'),
  },
  {
    // Dynamic admin path — matches the secret URL from the DB
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

router.beforeEach(async (to, from, next) => {
  if (to.meta.isAdmin) {
    const adminPath = to.params.adminPath as string
    try {
      const res = await api.get(`/profile/check-path/${adminPath}`)
      if (res.data.valid) {
        next()
      } else {
        next({ name: 'portfolio' })
      }
    } catch (e) {
      next({ name: 'portfolio' })
    }
  } else {
    next()
  }
})

export default router
