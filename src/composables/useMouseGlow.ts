import { onMounted, onUnmounted } from 'vue'

export function useMouseGlow() {
  function onMove(e: MouseEvent) {
    const el = document.getElementById('mouse-glow')
    if (el) {
      el.style.left = e.clientX + 'px'
      el.style.top = e.clientY + 'px'
    }
  }

  onMounted(() => window.addEventListener('mousemove', onMove))
  onUnmounted(() => window.removeEventListener('mousemove', onMove))
}
