<template>
  <Transition name="loading-fade" @after-leave="$emit('finished')">
    <div v-if="visible" class="loading-screen">
      <div class="logo-container">
        <!-- Signature gradient MKBS initials -->
        <h1 class="loading-logo gradient-signature-text">MKBS</h1>
      </div>

      <!-- Thin progress bar -->
      <div class="loading-bar-track">
        <div class="loading-bar-fill"></div>
      </div>

      <!-- Terminal typing logs -->
      <div class="terminal-text">
        <div class="terminal-line">{{ textLine1 }}<span v-if="textLine1 && !textLine2" class="cursor">_</span></div>
        <div class="terminal-line">{{ textLine2 }}<span v-if="textLine2 && !textLine3" class="cursor">_</span></div>
        <div class="terminal-line">{{ textLine3 }}<span v-if="textLine3" class="cursor animate-blink">_</span></div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

defineEmits(['finished'])

const visible = ref(true)
const textLine1 = ref('')
const textLine2 = ref('')
const textLine3 = ref('')

onMounted(() => {
  let i1 = 0
  const l1 = '> initializing...'
  const t1 = setInterval(() => {
    if (i1 < l1.length) {
      textLine1.value += l1[i1++]
    } else {
      clearInterval(t1)
      setTimeout(() => {
        let i2 = 0
        const l2 = '> loading modules...'
        const t2 = setInterval(() => {
          if (i2 < l2.length) {
            textLine2.value += l2[i2++]
          } else {
            clearInterval(t2)
            setTimeout(() => {
              let i3 = 0
              const l3 = '> ready'
              const t3 = setInterval(() => {
                if (i3 < l3.length) {
                  textLine3.value += l3[i3++]
                } else {
                  clearInterval(t3)
                  setTimeout(() => {
                    visible.value = false
                  }, 500)
                }
              }, 40)
            }, 250)
          }
        }, 30)
      }, 200)
    }
  }, 25)
})
</script>

<style scoped>
.loading-screen {
  position: fixed;
  inset: 0;
  background-color: #0A0E1A;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 2rem;
  pointer-events: auto;
}

.logo-container {
  margin-bottom: 1.75rem;
}

.loading-logo {
  font-size: clamp(3rem, 7vw, 4.5rem);
  font-weight: 800;
  font-family: 'Space Grotesk', sans-serif;
  letter-spacing: -0.03em;
  margin: 0;
  text-align: center;
}

/* Thin 2px progress bar */
.loading-bar-track {
  width: 180px;
  height: 2px;
  background: rgba(74, 125, 191, 0.12);
  border-radius: 1px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.loading-bar-fill {
  height: 100%;
  /* Use signature gradient for the bar fill */
  background: linear-gradient(90deg, #4A7DBF 0%, #8B7355 100%);
  border-radius: 1px;
  width: 0%;
  animation: loadFill 1.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

/* Terminal text — navy accent */
.terminal-text {
  width: 200px;
  text-align: left;
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.78rem;
  color: rgba(74, 125, 191, 0.6);
  line-height: 1.7;
  min-height: 80px;
}

.terminal-line {
  min-height: 1.7em;
  white-space: nowrap;
}

.cursor {
  font-weight: bold;
  color: #4A7DBF;
}

.animate-blink {
  animation: blink 1s infinite alternate;
}

@keyframes loadFill {
  0%   { width: 0%; }
  100% { width: 100%; }
}

@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
}
</style>
