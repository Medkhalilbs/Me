<template>
  <div v-if="enabled && showCursor" class="custom-cursor-wrapper">
    <div
      class="cursor-dot"
      :style="{ left: dotX + 'px', top: dotY + 'px' }"
    ></div>
    <div
      class="cursor-ring"
      :style="{ left: ringX + 'px', top: ringY + 'px' }"
      :class="{ hovering: isHovering }"
    ></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const enabled = ref(false)
const showCursor = ref(false)
const isHovering = ref(false)

const dotX = ref(0)
const dotY = ref(0)
const ringX = ref(0)
const ringY = ref(0)

let mouseX = 0
let mouseY = 0
let rafId: number

const updatePosition = (e: MouseEvent) => {
  mouseX = e.clientX
  mouseY = e.clientY
  dotX.value = mouseX
  dotY.value = mouseY

  if (!showCursor.value) {
    showCursor.value = true
    ringX.value = mouseX
    ringY.value = mouseY
  }
}

const handleMouseOver = (e: MouseEvent) => {
  const target = e.target as HTMLElement
  if (!target) return

  if (
    target.tagName === 'A' ||
    target.tagName === 'BUTTON' ||
    target.closest('a') ||
    target.closest('button') ||
    target.classList.contains('interactive') ||
    target.style.cursor === 'pointer'
  ) {
    isHovering.value = true
  } else {
    isHovering.value = false
  }
}

const animateRing = () => {
  const ease = 0.14
  ringX.value += (mouseX - ringX.value) * ease
  ringY.value += (mouseY - ringY.value) * ease
  rafId = requestAnimationFrame(animateRing)
}

const checkEnableStatus = () => {
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  const isAdmin = route && (route.path.includes('/admin') || route.meta.isAdmin || !!document.querySelector('.admin-wrapper'))

  if (!isMobile && !isAdmin) {
    if (!enabled.value) {
      enabled.value = true
      window.addEventListener('mousemove', updatePosition)
      window.addEventListener('mouseover', handleMouseOver)
      document.body.style.cursor = 'none'
      animateRing()
    }
  } else {
    if (enabled.value) {
      enabled.value = false
      window.removeEventListener('mousemove', updatePosition)
      window.removeEventListener('mouseover', handleMouseOver)
      document.body.style.cursor = 'auto'
      cancelAnimationFrame(rafId)
    }
  }
}

watch(() => route.path, () => {
  setTimeout(checkEnableStatus, 100)
})

onMounted(() => {
  checkEnableStatus()
})

onUnmounted(() => {
  window.removeEventListener('mousemove', updatePosition)
  window.removeEventListener('mouseover', handleMouseOver)
  document.body.style.cursor = 'auto'
  cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.custom-cursor-wrapper {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 999999;
}

/* Small solid dot — navy */
.cursor-dot {
  position: fixed;
  width: 5px;
  height: 5px;
  background-color: var(--accent-navy);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000000;
}

/* Lagging ring — thin navy circle */
.cursor-ring {
  position: fixed;
  width: 24px;
  height: 24px;
  border: 1.5px solid var(--accent-navy);
  border-radius: 50%;
  opacity: 0.65;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 999999;
  transition:
    width 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    height 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    border-color 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.35s ease;
}

/* Expand to bronze ring on hover over interactive elements */
.cursor-ring.hovering {
  width: 38px;
  height: 38px;
  border-color: var(--accent-bronze);
  opacity: 0.55;
}
</style>
