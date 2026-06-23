<template>
  <div ref="dividerRef" class="section-divider-container">
    <div class="divider-line" :class="{ active: isVisible }"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const dividerRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)
let observer: IntersectionObserver | null = null

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        isVisible.value = true
        observer?.unobserve(entry.target)
      }
    })
  }, { threshold: 0.2 })

  if (dividerRef.value) {
    observer.observe(dividerRef.value)
  }
})

onUnmounted(() => {
  observer?.disconnect()
})
</script>

<style scoped>
.section-divider-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 1px;
  overflow: hidden;
  background: transparent;
}

.divider-line {
  width: 0%;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--accent) 50%, transparent);
  transition: width 2.2s cubic-bezier(0.16, 1, 0.3, 1);
  opacity: 0.3;
}

.divider-line.active {
  width: 100%;
}
</style>
