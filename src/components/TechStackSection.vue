<template>
  <section id="tech-stack" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 06 — STACK</div>
      <h2 class="section-title reveal">Technology Stack</h2>
      <p class="section-subtitle reveal">Languages, frameworks, and infrastructure tools grouped by category</p>

      <!-- Category Groups Layout -->
      <div class="stack-categories-container reveal">
        <div v-for="[groupName, items] in groupedStack" :key="groupName" class="stack-group">
          <!-- Monospace Category Title -->
          <div class="group-label">{{ groupName }}</div>
          <!-- Pills Container -->
          <div class="group-pills">
            <div
              v-for="item in items"
              :key="item.id"
              class="tech-pill"
            >
              <span class="tech-pill-text">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TechStackItem } from '@/types'

const props = defineProps<{ techStack: TechStackItem[] }>()

// Dynamically group database tech stack entries by domain
const groupedStack = computed(() => {
  const groups: Record<string, TechStackItem[]> = {
    'Frontend': [],
    'Backend': [],
    'Database': [],
    'DevOps & CI/CD': [],
    'Cloud & Infrastructure': [],
    'Management & Integration': []
  }

  props.techStack.forEach(item => {
    const name = item.name.toLowerCase()
    if (['vue', 'nuxt', 'react', 'typescript', 'javascript', 'css', 'tailwind', 'webpack', 'vite'].some(t => name.includes(t))) {
      groups['Frontend'].push(item)
    } else if (['spring', 'java', 'node', 'express', 'n8n', 'rest'].some(t => name.includes(t))) {
      groups['Backend'].push(item)
    } else if (['oracle', 'postgres', 'mongo', 'sql', 'pl/sql'].some(t => name.includes(t))) {
      groups['Database'].push(item)
    } else if (['docker', 'jenkins', 'git', 'sonar', 'jfrog', 'pm2', 'pipeline'].some(t => name.includes(t))) {
      groups['DevOps & CI/CD'].push(item)
    } else if (['aws', 'gcp', 'cloudflare'].some(t => name.includes(t))) {
      groups['Cloud & Infrastructure'].push(item)
    } else {
      groups['Management & Integration'].push(item)
    }
  })

  return Object.entries(groups).filter(([_, items]) => items.length > 0)
})
</script>

<style scoped>
.stack-categories-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.stack-group {
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 1.5rem;
  align-items: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
}

.stack-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.group-label {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--accent-navy);
  letter-spacing: 0.05em;
}

.group-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
}

.tech-pill {
  padding: 0.45rem 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 4px;
  cursor: default;
  transition: all var(--transition);
}

.tech-pill-text {
  font-family: var(--font-mono);
  font-size: 0.8rem;
  font-weight: 500;
  color: var(--text-secondary);
  transition: color var(--transition);
}

.tech-pill:hover {
  border-color: var(--accent-navy);
  transform: translateY(-1px);
}

.tech-pill:hover .tech-pill-text {
  color: var(--accent-navy);
  font-weight: 600;
}

@media (max-width: 768px) {
  .stack-group {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
}
</style>
