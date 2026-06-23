<template>
  <section id="skills" class="section" style="background: var(--bg-secondary);">
    <div class="section-number">02</div>
    <div class="container">
      <div class="section-badge reveal">⚡ Skills</div>
      <h2 class="section-title reveal">Technical Expertise</h2>
      <p class="section-subtitle reveal">A full-stack toolkit built over 5 years of enterprise projects</p>

      <div class="skills-grid">
        <div
          v-for="(cat, i) in skills"
          :key="cat.id"
          class="card skill-card reveal"
          :style="{ animationDelay: `${i * 0.08}s` }"
        >
          <div class="skill-card-header">
            <div class="skill-icon">
              <component :is="iconMap[cat.icon] || DefaultIcon" />
            </div>
            <div class="skill-meta">
              <h3 class="skill-name">{{ cat.name }}</h3>
              <span class="skill-pct">{{ cat.proficiency }}%</span>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="skill-bar-track" style="margin: 1rem 0;">
            <div
              class="skill-bar-fill"
              :ref="el => registerBar(el as HTMLElement, cat.proficiency)"
            ></div>
          </div>

          <!-- Tags -->
          <div class="skill-tags">
            <span v-for="tag in cat.tags" :key="tag.id" class="tech-tag">{{ tag.name }}</span>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, h } from 'vue'
import type { SkillCategory } from '@/types'

defineProps<{ skills: SkillCategory[] }>()

// Simple SVG icon fallback
const DefaultIcon = { render: () => h('svg', { width: 20, height: 20, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
  h('polyline', { points: '16 18 22 12 16 6' }),
  h('polyline', { points: '8 6 2 12 8 18' }),
]) }

const iconMap: Record<string, unknown> = { code: DefaultIcon, monitor: DefaultIcon, server: DefaultIcon, database: DefaultIcon, settings: DefaultIcon, cloud: DefaultIcon, wrench: DefaultIcon }

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
  }, { threshold: 0.2 })

  bars.forEach(b => observer.observe(b.el))
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

/* Asymmetric grid layout on larger screens */
@media (min-width: 992px) {
  .skill-card:nth-child(3n + 1) {
    grid-column: span 2;
  }
}

.skill-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.skill-icon {
  width: 44px; height: 44px;
  background: var(--accent-glow);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: var(--accent);
  flex-shrink: 0;
  font-size: 1.2rem;
}

.skill-meta { flex: 1; }

.skill-name {
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0 0 0.15rem;
}

.skill-pct {
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 600;
}

.skill-bar-track {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: visible; /* Let the glow pulse dot spill out */
  position: relative;
}

.skill-bar-fill {
  height: 100%;
  border-radius: 3px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--accent-alt) 100%);
  width: 0%;
  transition: width 1.5s cubic-bezier(0.16, 1, 0.3, 1);
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.4);
  position: relative;
}

/* Glowing pulse tip on the skill progress bars */
.skill-bar-fill::after {
  content: '';
  position: absolute;
  right: -2px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px #fff, 0 0 12px var(--accent);
  animation: pulse-glow-dot 1.2s infinite alternate;
}

@keyframes pulse-glow-dot {
  0% { transform: translateY(-50%) scale(0.8); opacity: 0.6; }
  100% { transform: translateY(-50%) scale(1.2); opacity: 1; }
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}
</style>
