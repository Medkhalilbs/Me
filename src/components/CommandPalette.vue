<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="open" class="command-overlay" @click.self="$emit('close')">
        <div class="command-palette" role="dialog" aria-modal="true">
          <!-- Search Input -->
          <div class="command-input-wrap">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted); flex-shrink: 0;">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              ref="inputRef"
              v-model="query"
              class="command-input"
              placeholder="Search sections, actions..."
              @keydown.esc="$emit('close')"
              @keydown.up.prevent="moveSelection(-1)"
              @keydown.down.prevent="moveSelection(1)"
              @keydown.enter="executeSelected"
            />
            <kbd class="esc-badge">ESC</kbd>
          </div>

          <!-- Results -->
          <div class="command-results">
            <div
              v-for="(item, i) in filtered"
              :key="item.href"
              class="command-item"
              :class="{ active: i === selectedIndex }"
              @click="execute(item)"
              @mouseenter="selectedIndex = i"
            >
              <span class="command-icon">{{ item.icon }}</span>
              <div>
                <div class="command-label">{{ item.label }}</div>
                <div class="command-desc">{{ item.description }}</div>
              </div>
            </div>
            <div v-if="filtered.length === 0" class="command-empty">No results found</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'

const props = defineProps<{ open: boolean }>()
const emit = defineEmits(['close'])

const query = ref('')
const selectedIndex = ref(0)
const inputRef = ref<HTMLInputElement | null>(null)

const commands = [
  { icon: '🏠', label: 'Hero / Home',    description: 'Go to the top boot sequence',        href: '#hero' },
  { icon: '👤', label: 'About',          description: 'Learn more about my background',      href: '#about' },
  { icon: '⚡', label: 'Skills',         description: 'Technical skills & architecture',     href: '#skills' },
  { icon: '💼', label: 'Experience',     description: 'Work history & professional timeline',href: '#experience' },
  { icon: '🚀', label: 'Projects',       description: 'Featured projects & case studies',    href: '#projects' },
  { icon: '🎓', label: 'Education',      description: 'Academic background & degrees',       href: '#education' },
  { icon: '🛠',  label: 'Tech Stack',    description: 'All technologies & tools used',       href: '#tech-stack' },
  { icon: '🏆', label: 'Certifications', description: 'AWS certificates & credentials',       href: '#certifications' },
  { icon: '✨', label: 'Why Work With Me', description: 'Enterprise consulting value props',  href: '#why-me' },
  { icon: '📬', label: 'Contact',        description: 'Get in touch / send message',         href: '#contact' },
]

const filtered = computed(() => {
  const q = query.value.toLowerCase()
  if (!q) return commands
  return commands.filter(c =>
    c.label.toLowerCase().includes(q) || c.description.toLowerCase().includes(q)
  )
})

function moveSelection(dir: number) {
  selectedIndex.value = (selectedIndex.value + dir + filtered.value.length) % filtered.value.length
}

function execute(item: (typeof commands)[0]) {
  window.location.hash = item.href
  emit('close')
}

function executeSelected() {
  if (filtered.value[selectedIndex.value]) execute(filtered.value[selectedIndex.value])
}

watch(() => props.open, async (v) => {
  if (v) {
    query.value = ''
    selectedIndex.value = 0
    await nextTick()
    inputRef.value?.focus()
  }
})
</script>

<style scoped>
.command-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  z-index: 9000;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
}

.command-palette {
  width: 600px;
  max-width: calc(100vw - 2rem);
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card), var(--shadow-navy);
  overflow: hidden;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.command-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid var(--border);
}

.command-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text-primary);
  font-size: 1rem;
  font-family: var(--font-mono);
}
.command-input::placeholder { color: var(--text-muted); }

.esc-badge {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 0.15rem 0.4rem;
  font-size: 0.7rem;
  font-family: var(--font-mono);
  color: var(--text-muted);
}

.command-results {
  max-height: 350px;
  overflow-y: auto;
  padding: 0.5rem;
}

.command-item {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition);
  border: 1px solid transparent;
}

.command-item.active,
.command-item:hover {
  background: var(--accent-navy-subtle);
  border-color: rgba(74, 125, 191, 0.15);
}

.command-icon { font-size: 1.25rem; width: 28px; text-align: center; }

.command-label { font-weight: 600; font-size: 0.9rem; color: var(--text-primary); }
.command-desc  { font-size: 0.78rem; color: var(--text-secondary); }

.command-empty {
  text-align: center;
  color: var(--text-muted);
  font-family: var(--font-mono);
  padding: 2rem;
  font-size: 0.9rem;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
