import { onUnmounted } from 'vue'

export function useTiltCard() {
  const listeners = new Map<HTMLElement, { move: (e: MouseEvent) => void; leave: () => void }>()

  const applyTiltEffect = (el: HTMLElement | null) => {
    if (!el || listeners.has(el)) return

    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      // Normalize position from -0.5 to 0.5
      const percentX = (x / rect.width) - 0.5
      const percentY = (y / rect.height) - 0.5

      // Set max tilt to a premium, subtle 3.5 degrees
      const maxTilt = 3.5
      const tiltX = (percentY * maxTilt).toFixed(2)
      const tiltY = (-percentX * maxTilt).toFixed(2)

      el.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-4px)`
      el.style.transition = 'transform 0.1s ease-out'
    }

    const onMouseLeave = () => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)'
      el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }

    el.addEventListener('mousemove', onMouseMove)
    el.addEventListener('mouseleave', onMouseLeave)

    el.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'

    listeners.set(el, { move: onMouseMove, leave: onMouseLeave })
  }

  onUnmounted(() => {
    listeners.forEach((funcs, el) => {
      el.removeEventListener('mousemove', funcs.move)
      el.removeEventListener('mouseleave', funcs.leave)
    })
    listeners.clear()
  })

  return { applyTiltEffect }
}
