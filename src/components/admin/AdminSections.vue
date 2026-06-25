<template>
  <div class="admin-panel">
    <h2 class="panel-title">⚙️ Section Visibility Settings</h2>
    <p class="panel-sub">Toggle which sections of your public portfolio are visible to visitors.</p>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading settings…</div>

    <!-- Main Content -->
    <div v-else class="sections-list">
      <div v-for="sec in sections" :key="sec.id" class="card section-card-row">
        <div class="section-info">
          <h4 class="section-display-name">{{ getSectionLabel(sec.section_key) }}</h4>
          <p class="section-desc">{{ getSectionDescription(sec.section_key) }}</p>
          <span class="section-key-tag">key: {{ sec.section_key }}</span>
        </div>

        <div class="section-toggle-area">
          <label class="switch">
            <input
              type="checkbox"
              :checked="sec.is_visible === 1"
              @change="toggleVisibility(sec, $event)"
              :disabled="updatingKey === sec.section_key"
            />
            <span class="slider round"></span>
          </label>
          <span class="toggle-status-text" :class="{ visible: sec.is_visible === 1 }">
            {{ sec.is_visible === 1 ? 'Visible' : 'Hidden' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@/api'
import type { SectionSetting } from '@/types'

const sections = ref<SectionSetting[]>([])
const loading = ref(true)
const error = ref('')
const updatingKey = ref<string | null>(null)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/sections')
    sections.value = res.data
  } catch (e: any) {
    error.value = 'Failed to load section settings.'
  } finally {
    loading.value = false
  }
}

async function toggleVisibility(sec: SectionSetting, event: Event) {
  const target = event.target as HTMLInputElement
  const newVisible = target.checked ? 1 : 0
  updatingKey.value = sec.section_key

  try {
    await api.patch(`/sections/${sec.section_key}`, { is_visible: newVisible })
    sec.is_visible = newVisible
  } catch (e: any) {
    target.checked = !target.checked // revert checkbox
    alert('Failed to update visibility setting.')
  } finally {
    updatingKey.value = null
  }
}

function getSectionLabel(key: string): string {
  const labels: Record<string, string> = {
    'hero': 'Hero Header',
    'about': 'About Me',
    'languages': 'Languages Spoken',
    'skills': 'Technical Skills',
    'experience': 'Work Experience',
    'projects': 'Portfolio Projects',
    'education': 'Education History',
    'tech-stack': 'Core Tech Stack',
    'certifications': 'Certifications & Credentials',
    'why-work-with-me': 'Why Work With Me',
    'contact': 'Contact Form',
  }
  return labels[key] || key
}

function getSectionDescription(key: string): string {
  const descriptions: Record<string, string> = {
    'hero': 'Top introduction banner containing your name, title, and key stats.',
    'about': 'Detailed biography paragraphs and personal engineering callout box.',
    'languages': 'Spoken languages and linguistic proficiency meters.',
    'skills': 'Categorized technical proficiencies and specific tag list.',
    'experience': 'Professional timeline of jobs, roles, and client consulting.',
    'projects': 'Case studies, demo URLs, problem/solution writeups, and repo links.',
    'education': 'Academic degrees, universities, and graduation dates.',
    'tech-stack': 'Grid of icon badges showing primary programming languages/tools.',
    'certifications': 'Verified professional credentials and badges.',
    'why-work-with-me': 'Value propositions and unique selling points cards.',
    'contact': 'Direct email form and contact info sidebar.',
  }
  return descriptions[key] || ''
}

onMounted(load)
</script>

<style scoped>
.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.panel-sub {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

.sections-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 800px;
}

.section-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  gap: 2rem;
}

.section-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.section-display-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.section-desc {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.section-key-tag {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: lowercase;
}

.section-toggle-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  flex-shrink: 0;
}

.toggle-status-text {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.toggle-status-text.visible {
  color: var(--success);
}

/* Styled Toggle Switch CSS */
.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background-color: var(--border);
  transition: .3s;
  border: 1px solid var(--border);
}

.slider::before {
  position: absolute;
  content: "";
  height: 18px;
  width: 18px;
  left: 3px;
  bottom: 3px;
  background-color: var(--text-primary);
  transition: .3s;
}

input:checked + .slider {
  background-color: var(--accent-glow);
  border-color: var(--accent);
}

input:checked + .slider::before {
  transform: translateX(24px);
  background-color: var(--accent);
}

.slider.round {
  border-radius: 34px;
}

.slider.round::before {
  border-radius: 50%;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-weight: 600;
}
</style>
