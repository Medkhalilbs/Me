import { onUnmounted } from 'vue'

export function useMagneticButton() {
  const listeners = new Map<HTMLElement, { move: (e: MouseEvent) => void; leave: () => void }>()

  const applyMagneticEffect = (el: HTMLElement | null) => {
    if (!el || listeners.has(el)) return

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - (rect.left + rect.width / 2)
      const y = e.clientY - (rect.top + rect.height / 2)
      const distance = Math.hypot(x, y)

      if (distance < 75) {
        // Subtle magnetic pull (25% of cursor offset)
        const pullX = x * 0.25
        const pullY = y * 0.25
        el.style.transform = `translate3d(${pullX}px, ${pullY}px, 0)`
        el.style.transition = 'transform 0.1s ease-out'
      } else {
        el.style.transform = 'translate3d(0, 0, 0)'
        el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
      }
    }

    const onMouseLeave = () => {
      el.style.transform = 'translate3d(0, 0, 0)'
      el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)
    
    // Base transition setup
    el.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)'

    listeners.set(el, { move: onMouseMove, leave: onMouseLeave })
  }

  onUnmounted(() => {
    listeners.forEach((funcs, el) => {
      el.removeEventListener('mousemove', funcs.move)
      el.removeEventListener('mouseleave', funcs.leave)
    })
    listeners.clear()
  })

  return { applyMagneticEffect }
}
