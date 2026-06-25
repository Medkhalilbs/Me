<template>
  <section id="skills" class="section" style="background: var(--bg-secondary);">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 02 — SKILLS</div>
      <h2 class="section-title reveal">Technical Arsenal</h2>
      <p class="section-subtitle reveal">A system architecture view of my tools and capabilities</p>

      <div class="skills-grid">
        <div
          v-for="(cat, i) in skills"
          :key="cat.id"
          class="card skill-card reveal navy-node"
          :style="{ animationDelay: `${i * 0.08}s` }"
        >
          <div class="skill-card-header">
            <div class="skill-icon">
              <!-- SVG icons by category -->
              <svg v-if="cat.icon === 'monitor'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <svg v-else-if="cat.icon === 'server'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2"/><rect x="2" y="14" width="20" height="8" rx="2" ry="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>
              <svg v-else-if="cat.icon === 'database'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/><path d="M3 12c0 1.66 4 3 9 3s9-1.34 9-3"/></svg>
              <svg v-else-if="cat.icon === 'settings'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <svg v-else-if="cat.icon === 'wrench'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
              <svg v-else-if="cat.icon === 'cloud'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/></svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="skill-meta">
              <h3 class="skill-name">{{ cat.name }}</h3>
              <span class="skill-pct">{{ cat.proficiency }}% proficiency</span>
            </div>
          </div>

          <!-- Proficiency bar -->
          <div class="skill-bar-track">
            <div
              class="skill-bar-fill"
              :ref="el => registerBar(el as HTMLElement, cat.proficiency)"
            ></div>
          </div>

          <!-- Tech tags -->
          <div class="skill-tags">
            <span v-for="tag in cat.tags" :key="tag.id" class="tech-tag">{{ tag.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import type { SkillCategory } from '@/types'

defineProps<{ skills: SkillCategory[] }>()

const bars: Array<{ el: HTMLElement; target: number }> = []
let observer: IntersectionObserver

function registerBar(el: HTMLElement | null, target: number) {
  if (!el || bars.some(b => b.el === el)) return
  bars.push({ el, target })
}

onMounted(() => {
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = bars.find(b => b.el === entry.target)
        if (bar) {
          bar.el.style.width = bar.target + '%'
          observer.unobserve(entry.target)
        }
      }
    })
  }, { threshold: 0.15 })
  bars.forEach(b => observer.observe(b.el))
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
/* 3 columns on desktop, 2 on tablet, 1 on mobile */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.75rem;
  position: relative;
  z-index: 1;
}

.skill-card {
  padding: 1.6rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  /* No circuit pins — clean card */
  overflow: hidden;
}

/* Header */
.skill-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.1rem;
}

.skill-icon {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.skill-meta { flex: 1; }

.skill-name {
  font-size: 1.05rem;
  font-weight: 600;
  margin: 0 0 0.2rem;
}

.skill-pct {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Progress bar */
.skill-bar-track {
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  position: relative;
  margin-bottom: 1.25rem;
}

.skill-bar-fill {
  height: 100%;
  border-radius: 2px;
  width: 0%;
  transition: width 1.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

/* ── Navy node (default) ── */
.navy-node .skill-icon {
  background: var(--accent-navy-subtle);
  border: 1px solid rgba(74, 125, 191, 0.18);
  color: var(--accent-navy);
}
.navy-node .skill-bar-fill {
  background: var(--accent-navy);
}
.navy-node .skill-pct {
  color: var(--accent-navy);
}
.navy-node:hover {
  border-color: rgba(74, 125, 191, 0.35) !important;
}



@media (max-width: 1024px) {
  .skills-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
  }
}

@media (max-width: 640px) {
  .skills-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>
