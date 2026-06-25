<template>
  <section id="projects" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 04 — PROJECTS</div>
      <h2 class="section-title reveal">Featured Work</h2>
      <p class="section-subtitle reveal">Deployments, security tooling, and automation pipelines built to scale</p>

      <!-- Terminal Tab Filters -->
      <div class="project-filters reveal">
        <button
          v-for="f in filters"
          :key="f.value"
          class="filter-tab"
          :class="{ active: activeFilter === f.value }"
          @click="activeFilter = f.value"
        >
          <span class="tab-prefix">></span> {{ f.label }}
        </button>
      </div>

      <!-- Projects Grid -->
      <div class="projects-grid">
        <div
          v-for="(project, i) in visibleProjects"
          :key="project.id"
          class="card project-card reveal"
          :style="{ animationDelay: `${i * 0.08}s` }"
        >
          <!-- Project Cover Image -->
          <div v-if="project.hero_image_path" class="project-image-cover">
            <img :src="`/api/images/projects/${project.hero_image_path}`" :alt="project.title" class="proj-cover-img" />
          </div>

          <!-- Card Header Info -->
          <div class="proj-card-top">
            <span class="category-badge navy-badge">
              {{ project.category }}
            </span>
            
            <div class="status-indicator">
              <span
                class="status-dot"
                :style="{ backgroundColor: project.status === 'completed' ? 'var(--success)' : 'var(--accent-navy)' }"
              ></span>
              <span class="status-lbl">{{ project.status === 'completed' ? 'deployed' : 'active development' }}</span>
            </div>
          </div>

          <h3 class="project-title">{{ project.title }}</h3>
          <p class="project-summary-desc">{{ project.description }}</p>

          <!-- Expandable Details Section -->
          <div class="expandable-wrapper">
            <button class="expand-toggle-btn" @click="toggleExpand(project.id)">
              <span class="toggle-icon">{{ isExpanded(project.id) ? '[-] collapse_details' : '[+] view_details' }}</span>
            </button>

            <Transition name="expand-details">
              <div v-if="isExpanded(project.id)" class="details-content">
                <div class="detail-block">
                  <span class="block-label">// problem</span>
                  <p class="block-text">{{ project.problem }}</p>
                </div>
                <div class="detail-block">
                  <span class="block-label">// solution</span>
                  <p class="block-text">{{ project.solution }}</p>
                </div>
                <div v-if="project.business_impact" class="detail-block">
                  <span class="block-label">// impact</span>
                  <p class="block-text">{{ project.business_impact }}</p>
                </div>
                
                <div v-if="project.features && project.features.length" class="detail-block">
                  <span class="block-label">// key features</span>
                  <ul class="features-list">
                    <li v-for="feat in project.features" :key="feat.id">{{ feat.text }}</li>
                  </ul>
                </div>
              </div>
            </Transition>
          </div>

          <!-- Bottom: Tech Stack -->
          <div class="project-tech">
            <span v-for="tech in project.tech" :key="tech" class="tech-tag">{{ tech }}</span>
          </div>

          <!-- Action Links -->
          <div class="project-links">
            <a v-if="project.github_url" :href="project.github_url" target="_blank" rel="noopener" class="btn btn-outline btn-sm">
              Codebase
            </a>
            <a v-if="project.demo_url" :href="project.demo_url" target="_blank" rel="noopener" class="btn btn-primary btn-sm">
              Live Link
            </a>
          </div>
        </div>
      </div>

      <div v-if="visibleProjects.length === 0" class="no-results">
        // No projects found in this repository folder
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Project } from '@/types'

const props = defineProps<{
  projects: Project[]
}>()

const activeFilter = ref('all')
const expandedCards = ref<Record<number, boolean>>({})

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
  return list.sort((a, b) => a.sort_order - b.sort_order)
})

function isExpanded(id: number) {
  return !!expandedCards.value[id]
}

function toggleExpand(id: number) {
  expandedCards.value[id] = !expandedCards.value[id]
}
</script>

<style scoped>
.project-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 3rem;
  justify-content: center;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1.5rem;
}

.filter-tab {
  padding: 0.5rem 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  color: var(--text-secondary);
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition);
  display: flex;
  align-items: center;
  gap: 0.4rem;
  border-radius: 4px;
}

.tab-prefix {
  color: var(--text-muted);
  transition: color var(--transition);
}

.filter-tab.active {
  border-color: var(--accent-navy);
  color: var(--accent-navy);
  border-bottom: 2px solid var(--accent-navy);
}

.filter-tab:hover {
  border-color: rgba(74, 125, 191, 0.4);
  color: var(--text-primary);
}

.filter-tab.active .tab-prefix,
.filter-tab:hover .tab-prefix {
  color: var(--accent-navy);
}

/* Projects Grid */
.projects-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.project-card {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.proj-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
}

.category-badge {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05rem;
  padding: 0.2rem 0.6rem;
  border-radius: 3px;
  border: 1px solid var(--border);
}

.navy-badge {
  color: var(--accent-navy);
  background: var(--accent-navy-subtle);
  border-color: rgba(74, 125, 191, 0.2);
}


.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
}

.status-lbl {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  color: var(--text-secondary);
}

.project-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.project-summary-desc {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0 0 1.5rem;
}

/* Expandable Block styling */
.expandable-wrapper {
  margin-bottom: 1.5rem;
}

.expand-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--accent-navy);
  transition: opacity var(--transition);
  outline: none;
}

.expand-toggle-btn:hover {
  opacity: 0.8;
}

.details-content {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.detail-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.block-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
}

.block-text {
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.features-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.features-list li {
  position: relative;
  padding-left: 1.1rem;
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.features-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--success);
  font-weight: bold;
}

/* Tech tag container */
.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: auto; /* Push tags and links to bottom */
  margin-bottom: 1.5rem;
}

.project-links {
  display: flex;
  gap: 0.75rem;
}

.btn-sm {
  padding: 0.5rem 1.25rem;
  font-size: 0.82rem;
}

/* Expand animation */
.expand-details-enter-active,
.expand-details-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  overflow: hidden;
  max-height: 500px;
}

.expand-details-enter-from,
.expand-details-leave-to {
  max-height: 0;
  opacity: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
}

.no-results {
  text-align: center;
  font-family: var(--font-mono);
  color: var(--text-muted);
  padding: 4rem;
}

@media (max-width: 900px) {
  .projects-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

.project-image-cover {
  width: calc(100% + 4rem); /* matches card padding of 2rem */
  margin-top: -2rem;
  margin-left: -2rem;
  margin-right: -2rem;
  margin-bottom: 1.5rem;
  height: 200px;
  overflow: hidden;
  border-bottom: 1px solid var(--border);
  position: relative;
}

.proj-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s var(--transition-slow);
}

.project-card:hover .proj-cover-img {
  transform: scale(1.05);
}
</style>
