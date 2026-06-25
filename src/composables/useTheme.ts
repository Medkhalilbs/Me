import { ref, watch, onMounted } from 'vue'

type Theme = 'dark' | 'light'

export function useTheme() {
  const stored = localStorage.getItem('theme') as Theme | null
  const theme = ref<Theme>(stored || 'dark')

  function apply(t: Theme) {
    document.documentElement.setAttribute('data-theme', t)
    localStorage.setItem('theme', t)
  }

  function toggle() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
  }

  watch(theme, apply)
  onMounted(() => apply(theme.value))

  return { theme, toggle }
}
