import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@/api'

export const useAdminStore = defineStore('admin', () => {
  const token = ref<string | null>(localStorage.getItem('admin_token'))
  const isAuthenticated = computed(() => !!token.value)
  const loginError = ref<string | null>(null)
  const loading = ref(false)

  async function login(password: string, path: string): Promise<boolean> {
    loading.value = true
    loginError.value = null
    try {
      const res = await api.post('/auth/login', { password, path })
      token.value = res.data.token
      localStorage.setItem('admin_token', res.data.token)
      return true
    } catch (e: any) {
      loginError.value = e.response?.data?.error || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch {}
    token.value = null
    localStorage.removeItem('admin_token')
  }

  async function changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      await api.post('/auth/change-password', { currentPassword, newPassword })
      return true
    } catch (e: any) {
      throw new Error(e.response?.data?.error || 'Failed to change password')
    }
  }

  return { token, isAuthenticated, loginError, loading, login, logout, changePassword }
})
