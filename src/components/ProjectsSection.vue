<template>
  <section id="projects" class="section" style="background: var(--bg-secondary);">
    <div class="container">
      <div class="section-badge reveal">🚀 Projects</div>
      <h2 class="section-title reveal">Featured Work</h2>
      <p class="section-subtitle reveal">Enterprise solutions and impactful software shipped in production</p>

      <!-- Filter Tabs -->
      <div class="project-filters reveal">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-btn"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >{{ f.label }}</button>
      </div>

      <!-- Search -->
      <div class="project-search reveal">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="color: var(--text-muted);">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input v-model="searchQuery" class="form-input" style="padding: 0.6rem 1rem;" placeholder="Search projects..." />
      </div>

      <!-- Grid -->
      <TransitionGroup name="project-list" tag="div" class="projects-grid">
        <div
          v-for="(project, i) in visibleProjects"
          :key="project.id"
          class="card project-card"
          :style="{ animationDelay: `${i * 0.08}s` }"
        >
          <div class="project-category-badge">{{ project.category }}</div>
          <h3 class="project-title">{{ project.title }}</h3>
          <p class="project-desc">{{ project.description }}</p>

          <!-- Problem / Solution -->
          <div class="project-detail">
            <div class="detail-item">
              <span class="detail-icon">🎯</span>
              <div>
                <div class="detail-label">Challenge</div>
                <div class="detail-text">{{ project.problem }}</div>
              </div>
            </div>
            <div class="detail-item">
              <span class="detail-icon">⚡</span>
              <div>
                <div class="detail-label">Solution</div>
                <div class="detail-text">{{ project.solution }}</div>
              </div>
            </div>
          </div>

          <!-- Features -->
          <ul class="project-features">
            <li v-for="feat in project.features" :key="feat.id">{{ feat.text }}</li>
          </ul>

          <!-- Impact -->
          <div class="project-impact">
            <span class="impact-icon">📈</span>
            <span>{{ project.business_impact }}</span>
          </div>

          <!-- Tech -->
          <div class="project-tech">
            <span v-for="tech in project.tech" :key="tech" class="tech-tag">{{ tech }}</span>
          </div>

          <!-- Links -->
          <div class="project-links">
            <a v-if="project.github_url" :href="project.github_url" target="_blank" rel="noopener" class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.82rem;">
              GitHub
            </a>
            <a v-if="project.demo_url" :href="project.demo_url" target="_blank" rel="noopener" class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.82rem;">
              Live Demo
            </a>
          </div>
        </div>
      </TransitionGroup>

      <div v-if="visibleProjects.length === 0" class="no-results">
        No projects match your search.
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project } from '@/types'

const props = defineProps<{ projects: Project[] }>()

const activeFilter = ref('all')
const searchQuery = ref('')

const filters = [
  { label: 'All',        value: 'all' },
  { label: 'Mobile',     value: 'mobile' },
  { label: 'Web',        value: 'web' },
  { label: 'Security',   value: 'security' },
  { label: 'Automation', value: 'automation' },
]

const visibleProjects = computed(() => {
  let list = props.projects
  if (activeFilter.value !== 'all') {
    list = list.filter(p => p.category === activeFilter.value)
  }
  if (searchQuery.value.trim()) {
    const q = searchQuery.value.toLowerCase()
    list = list.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.tech.some(t => t.toLowerCase().includes(q))
    )
  }
  return list
})
</script>

<style scoped>
.project-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
}

.filter-btn {
  padding: 0.45rem 1.1rem;
  border-radius: 50px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  text-transform: capitalize;
}

.filter-btn.active,
.filter-btn:hover {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
}

.project-search {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 0 1rem;
  margin-bottom: 2rem;
  max-width: 400px;
}

.project-search .form-input {
  border: none;
  background: transparent;
  padding-left: 0;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
}

.project-card { padding: 1.75rem; }

.project-category-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 50px;
  background: var(--accent-glow);
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.75rem;
}

.project-title { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.6rem; }
.project-desc { color: var(--text-secondary); font-size: 0.88rem; line-height: 1.6; margin: 0 0 1rem; }

.project-detail { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem; }
.detail-item { display: flex; gap: 0.75rem; align-items: flex-start; }
.detail-icon { font-size: 1.1rem; flex-shrink: 0; }
.detail-label { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; color: var(--accent); margin-bottom: 0.15rem; }
.detail-text { font-size: 0.82rem; color: var(--text-secondary); line-height: 1.5; }

.project-features {
  list-style: none;
  padding: 0;
  margin: 0 0 1rem;
}
.project-features li {
  padding-left: 1.2rem;
  position: relative;
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 0.35rem;
}
.project-features li::before { content: '✓'; position: absolute; left: 0; color: var(--success); font-weight: 700; }

.project-impact {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
  background: var(--accent-glow);
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 1rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
}

.impact-icon { flex-shrink: 0; font-size: 1rem; }

.project-tech { display: flex; flex-wrap: wrap; gap: 0.35rem; margin-bottom: 1rem; }
.project-links { display: flex; gap: 0.5rem; }

.no-results {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem;
  font-size: 1rem;
}

.project-list-move,
.project-list-enter-active,
.project-list-leave-active { transition: all 0.4s ease; }
.project-list-enter-from { opacity: 0; transform: scale(0.95); }
.project-list-leave-to { opacity: 0; transform: scale(0.95); }
</style>
