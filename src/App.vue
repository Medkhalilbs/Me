<template>
  <div>
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'

const portfolioStore = usePortfolioStore()

// Easter Egg
let keysTyped = ''
const handleKeydown = (e: KeyboardEvent) => {
  keysTyped += e.key.toLowerCase()
  if (keysTyped.endsWith('mkbs')) {
    triggerEasterEgg()
    keysTyped = ''
  }
  if (keysTyped.length > 20) {
    keysTyped = keysTyped.slice(-10)
  }
}

const triggerEasterEgg = () => {
  const flash = document.createElement('div')
  flash.style.position = 'fixed'
  flash.style.inset = '0'
  flash.style.zIndex = '9999999'
  flash.style.backgroundColor = '#3B82F6'
  flash.style.mixBlendMode = 'difference'
  flash.style.opacity = '1'
  flash.style.pointerEvents = 'none'
  flash.style.transition = 'opacity 2s cubic-bezier(0.16, 1, 0.3, 1)'
  document.body.appendChild(flash)
  
  setTimeout(() => {
    flash.style.opacity = '0'
    setTimeout(() => {
      flash.remove()
    }, 2000)
  }, 100)
}

onMounted(() => {
  portfolioStore.fetchAll()
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style>
/* Global resets or overrides if needed */
</style>
