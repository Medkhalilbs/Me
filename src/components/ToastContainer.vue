<template>
  <Teleport to="body">
    <div class="toast-container" aria-live="polite" aria-atomic="false">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="toast.type"
          role="alert"
        >
          <span class="toast-icon">{{ icons[toast.type] }}</span>
          <span class="toast-message">{{ toast.message }}</span>
          <button
            class="toast-close"
            @click="dismiss(toast.id)"
            aria-label="Dismiss notification"
          >×</button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '@/composables/useToast'

const { toasts, dismiss } = useToast()

const icons: Record<string, string> = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
}
</script>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem 1.25rem;
  border-radius: var(--radius);
  backdrop-filter: blur(12px);
  min-width: 280px;
  max-width: 400px;
  pointer-events: auto;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25);
  border: 1px solid transparent;
}

.toast.success {
  background: rgba(16, 185, 129, 0.12);
  border-color: rgba(16, 185, 129, 0.3);
  color: #10b981;
}

.toast.error {
  background: rgba(239, 68, 68, 0.12);
  border-color: rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.toast.info {
  background: var(--accent-glow);
  border-color: var(--accent-navy);
  color: var(--accent);
}

.toast-icon {
  font-size: 1rem;
  font-weight: 700;
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.toast.success .toast-icon { background: rgba(16, 185, 129, 0.2); }
.toast.error .toast-icon   { background: rgba(239, 68, 68, 0.2); }
.toast.info .toast-icon    { background: var(--accent-glow); }

.toast-message {
  flex: 1;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.1rem;
  opacity: 0.6;
  color: inherit;
  padding: 0;
  line-height: 1;
  flex-shrink: 0;
  transition: opacity 0.2s;
}
.toast-close:hover { opacity: 1; }

/* TransitionGroup animations */
.toast-enter-active {
  animation: toastIn 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  animation: toastOut 0.25s ease forwards;
}

@keyframes toastIn {
  from { opacity: 0; transform: translateX(100%) scale(0.9); }
  to   { opacity: 1; transform: translateX(0) scale(1); }
}
@keyframes toastOut {
  from { opacity: 1; transform: translateX(0) scale(1); }
  to   { opacity: 0; transform: translateX(100%) scale(0.9); }
}
</style>
