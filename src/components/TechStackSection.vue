<template>
  <section id="tech-stack" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">{{ meta.badge || '// 06 — STACK' }}</div>
      <h2 class="section-title reveal">{{ meta.title || 'Technology Stack' }}</h2>
      <p class="section-subtitle reveal">{{ meta.subtitle || 'Languages, frameworks, and infrastructure tools grouped by category' }}</p>

      <!-- Category Groups Layout -->
      <div class="stack-categories-container reveal">
        <div v-for="group in groupedStack" :key="group.name" class="stack-group">
          <!-- Monospace Category Title -->
          <div class="group-label">{{ group.name }}</div>
          <!-- Pills Container -->
          <div class="group-pills">
            <div
              v-for="item in group.items"
              :key="item"
              class="tech-pill"
            >
              <span class="tech-pill-text">{{ item }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'

const store = usePortfolioStore()
const meta = computed(() => store.getSectionMeta('tech-stack'))

// Group by skill_categories + skill_tags (replaces keyword matching)
const groupedStack = computed(() =>
  store.skills
    .filter(cat => cat.tags.length > 0)
    .map(cat => ({ name: cat.name, items: cat.tags.map(t => t.name) }))
)
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
