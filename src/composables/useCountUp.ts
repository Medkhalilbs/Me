import { ref, onMounted, onUnmounted } from 'vue'

export function useCountUp(target: number, duration = 2000, suffix = '') {
  const display = ref('0' + suffix)
  let rafId: number

  function start() {
    const startTime = performance.now()
    const update = (now: number) => {
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out-cubic
      const current = Math.round(eased * target)
      display.value = current + suffix
      if (progress < 1) rafId = requestAnimationFrame(update)
    }
    rafId = requestAnimationFrame(update)
  }

  onUnmounted(() => cancelAnimationFrame(rafId))

  return { display, start }
}
