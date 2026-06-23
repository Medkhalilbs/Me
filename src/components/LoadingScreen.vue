<template>
  <Transition name="loading">
    <div v-if="visible" class="loading-screen">
      <div class="loading-logo">MKBS</div>
      <p style="color: var(--text-secondary); margin-bottom: 1.5rem; font-size: 0.9rem; letter-spacing: 0.1em;">
        PORTFOLIO
      </p>
      <div class="loading-bar-track">
        <div class="loading-bar-fill"></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const visible = ref(true)

onMounted(() => {
  setTimeout(() => { visible.value = false }, 1800)
})
</script>

<style scoped>
.loading-enter-active,
.loading-leave-active {
  transition: opacity 0.5s ease;
}
.loading-enter-from,
.loading-leave-to {
  opacity: 0;
}
</style>
