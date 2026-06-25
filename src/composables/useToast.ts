import { ref } from 'vue'

export interface Toast {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

const toasts = ref<Toast[]>([])

function show(message: string, type: 'success' | 'error' | 'info' = 'success') {
  const id = Date.now()
  toasts.value.push({ id, message, type })
  setTimeout(() => dismiss(id), 4000)
}

function dismiss(id: number) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function useToast() {
  return { toasts, show, dismiss }
}
