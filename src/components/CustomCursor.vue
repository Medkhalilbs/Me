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
  const ease = 0.15
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
  // Let the DOM update, then check if we should enable the cursor
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

.cursor-dot {
  position: fixed;
  width: 6px;
  height: 6px;
  background-color: var(--accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 1000000;
}

.cursor-ring {
  position: fixed;
  width: 28px;
  height: 28px;
  border: 1px solid var(--accent);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
  z-index: 999999;
  transition: width 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
              height 0.3s cubic-bezier(0.16, 1, 0.3, 1), 
              background-color 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.cursor-ring.hovering {
  width: 44px;
  height: 44px;
  background-color: rgba(59, 130, 246, 0.08);
  border-color: var(--accent);
}
</style>
