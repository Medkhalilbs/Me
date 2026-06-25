<template>
  <section id="education" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 05 — EDUCATION</div>
      <h2 class="section-title reveal">Academic Background</h2>
      <p class="section-subtitle reveal">Foundational systems training and computing credentials</p>

      <div class="education-grid">
        <div
          v-for="(edu, i) in education"
          :key="edu.id"
          class="card education-card reveal navy-edu-card"
          :style="{ animationDelay: `${i * 0.15}s` }"
        >
          <div class="card-header-icon">
            <span v-if="edu.school.toLowerCase().includes('esprit')">💻</span>
            <span v-else>🔌</span>
          </div>
          <div class="edu-meta">
            <span class="edu-years">{{ edu.start_year }} – {{ edu.end_year }}</span>
            <h3 class="edu-school">{{ edu.school }}</h3>
            <h4 class="edu-degree">{{ edu.degree }}</h4>
            <p class="edu-desc">{{ edu.description }}</p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Education } from '@/types'
defineProps<{ education: Education[] }>()
</script>

<style scoped>
.education-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.education-card {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  transition: all var(--transition);
}

.card-header-icon {
  font-size: 1.6rem;
  padding: 0.6rem;
  background: var(--bg-secondary);
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.edu-meta { flex: 1; }

.edu-years {
  font-family: var(--font-mono);
  font-size: 0.76rem;
  font-weight: 600;
  display: inline-block;
  margin-bottom: 0.5rem;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
}

/* ESPRIT — navy accent */
.navy-edu-card .edu-years {
  color: var(--accent-navy);
  border-color: rgba(74, 125, 191, 0.22);
}

.navy-edu-card .edu-school {
  color: var(--accent-navy);
}

.navy-edu-card:hover {
  border-color: rgba(74, 125, 191, 0.35) !important;
}



.edu-school {
  font-size: 1.2rem;
  font-weight: 700;
  margin: 0 0 0.3rem;
}

.edu-degree {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
  line-height: 1.4;
}

.edu-desc {
  font-size: 0.83rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
}

[data-theme="light"] .card-header-icon {
  background: var(--bg-primary);
}

@media (max-width: 768px) {
  .education-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
</style>
