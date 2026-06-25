import { ref, onMounted } from 'vue'
import api from '@/api'

/**
 * Generic admin CRUD composable.
 * @param endpoint - API endpoint (e.g. '/hero-stats')
 */
export function useAdminCrud<T extends { id: number }>(endpoint: string, readEndpoint?: string) {
  const items = ref<T[]>([])
  const loading = ref(true)
  const saving = ref(false)
  const saved = ref(false)
  const error = ref('')

  async function load() {
    loading.value = true
    try {
      const res = await api.get(readEndpoint || endpoint)
      items.value = res.data
    } catch (e: any) {
      error.value = e.message
    } finally {
      loading.value = false
    }
  }

  async function create(data: Omit<T, 'id'>) {
    saving.value = true
    error.value = ''
    try {
      await api.post(endpoint, data)
      await load()
      flashSaved()
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Create failed'
    } finally {
      saving.value = false
    }
  }

  async function update(id: number, data: Partial<T>) {
    saving.value = true
    error.value = ''
    try {
      await api.patch(`${endpoint}/${id}`, data)
      await load()
      flashSaved()
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Update failed'
    } finally {
      saving.value = false
    }
  }

  async function remove(id: number) {
    saving.value = true
    error.value = ''
    try {
      await api.delete(`${endpoint}/${id}`)
      await load()
    } catch (e: any) {
      error.value = e.response?.data?.error || 'Delete failed'
    } finally {
      saving.value = false
    }
  }

  function flashSaved() {
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  }

  onMounted(load)

  return { items, loading, saving, saved, error, load, create, update, remove }
}
