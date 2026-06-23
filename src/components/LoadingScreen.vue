<template>
  <Transition name="loading" @after-leave="destroyDOM">
    <div v-if="visible" class="loading-screen" :class="{ 'fade-out': !visible }">
      <div class="logo-container">
        <svg width="240" height="80" viewBox="0 0 240 80" class="svg-logo">
          <!-- M -->
          <path d="M 20 60 L 20 20 L 40 45 L 60 20 L 60 60" fill="none" stroke="#C9A961" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" class="letter m"/>
          <!-- K -->
          <path d="M 80 20 L 80 60 M 110 20 L 82 40 L 110 60" fill="none" stroke="#C9A961" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" class="letter k"/>
          <!-- B -->
          <path d="M 130 60 L 130 20 L 150 20 C 160 20, 160 38, 150 38 L 130 38 M 150 38 C 162 38, 162 60, 150 60 L 130 60" fill="none" stroke="#C9A961" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" class="letter b"/>
          <!-- S -->
          <path d="M 205 20 C 185 15, 175 32, 190 40 C 205 48, 195 65, 175 60" fill="none" stroke="#C9A961" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round" class="letter s"/>
        </svg>
      </div>
      <p class="loading-text">
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
  setTimeout(() => { visible.value = false }, 2500) // Slightly longer to let the draw animation play
})

function destroyDOM() {
  // Callback when transition finishes to ensure total destruction
}
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  background: #0B0D10;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  opacity: 1;
  transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), visibility 0.5s;
}

.loading-screen.fade-out {
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}

.logo-container {
  margin-bottom: 1.5rem;
}

.svg-logo {
  filter: drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
}

.letter {
  stroke-dasharray: 200;
  stroke-dashoffset: 200;
  animation: drawStroke 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

.letter.m { animation-delay: 0.1s; }
.letter.k { animation-delay: 0.3s; }
.letter.b { animation-delay: 0.5s; }
.letter.s { animation-delay: 0.7s; }

@keyframes drawStroke {
  to {
    stroke-dashoffset: 0;
  }
}

.loading-text {
  color: #8B8884;
  margin-bottom: 1.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  letter-spacing: 0.2em;
  font-family: 'Space Grotesk', sans-serif;
}

.loading-bar-track {
  width: 200px;
  height: 2px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 2px;
  overflow: hidden;
}

.loading-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #1E3A5F, #C9A961);
  border-radius: 2px;
  animation: fillProgress 2.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes fillProgress {
  0% { width: 0%; }
  100% { width: 100%; }
}

.loading-leave-active {
  transition: opacity 0.5s ease;
}
.loading-leave-to {
  opacity: 0;
}
</style>
