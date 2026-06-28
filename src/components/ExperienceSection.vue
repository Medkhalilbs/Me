<template>
  <section id="experience" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">{{ meta.badge || '// 03 — EXPERIENCE' }}</div>
      <h2 class="section-title reveal">{{ meta.title || 'Career Trajectory' }}</h2>
      <p class="section-subtitle reveal">{{ meta.subtitle || 'Professional chronicle of full-stack engineering and embedded designs' }}</p>

      <div class="exp-timeline">
        <div
          v-for="(exp, i) in experiences"
          :key="exp.id"
          class="exp-entry reveal navy-experience"
          :style="{ animationDelay: `${i * 0.12}s` }"
        >
          <!-- Timeline connector -->
          <div class="exp-connector">
            <div
              class="exp-dot"
              :class="{
                'current': exp.is_current
              }"
            ></div>
            <div v-if="i < experiences.length - 1" class="exp-line"></div>
          </div>

          <!-- Card -->
          <div class="card exp-card">
            <div class="exp-header">
              <div class="exp-period">
                <span class="calendar-icon">📅</span>
                {{ exp.start_date }} — {{ exp.is_current ? 'Present' : exp.end_date }}
                <span v-if="exp.is_current" class="current-badge">Active</span>
              </div>

              <h3 class="exp-role">{{ exp.role }}</h3>
              <!-- Employer / Client affiliation line -->
              <div class="exp-affiliation">
                <span class="exp-employer-chip">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
                  {{ exp.company }}
                </span>
                <template v-if="exp.client">
                  <span class="exp-affiliation-arrow">→</span>
                  <span class="exp-client-chip">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    {{ exp.client }}
                  </span>
                </template>
              </div>

              <div class="exp-meta-row">
                <div v-if="exp.location" class="exp-location">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ exp.location }}
                </div>
              </div>
            </div>

            <!-- Bullet responsibilities -->
            <ul class="exp-responsibilities">
              <li v-for="resp in exp.responsibilities" :key="resp.id">{{ resp.text }}</li>
            </ul>

            <!-- Tech pills -->
            <div class="exp-tech">
              <span v-for="tech in exp.tech" :key="tech" class="tech-tag">{{ tech }}</span>
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
const experiences = computed(() => store.experiences)
const meta = computed(() => store.getSectionMeta('experience'))
</script>

<style scoped>
.exp-timeline {
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
}

.exp-entry {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 1.5rem;
}

.exp-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.75rem;
}

.exp-dot {
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: var(--bg-primary);
  border: 2px solid var(--border);
  position: relative;
  z-index: 2;
  flex-shrink: 0;
  transition: all var(--transition);
}

/* Vertical line — navy gradient */
.exp-line {
  flex: 1;
  width: 1.5px;
  background: linear-gradient(to bottom, var(--accent-navy) 30%, var(--border) 100%);
  margin-top: 6px;
  margin-bottom: -6px;
  opacity: 0.4;
}

.exp-card {
  padding: 2rem;
  margin-bottom: 2.5rem;
}

/* Period badge */
.exp-period {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.2rem 0.55rem;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid var(--border);
  margin-bottom: 0.75rem;
}

.calendar-icon { font-size: 0.85rem; }

.current-badge {
  font-size: 0.68rem;
  font-weight: 700;
  padding: 0.1rem 0.4rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-left: 0.5rem;
}

.exp-role {
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

/* Affiliation line: Employer chip → Client chip */
.exp-affiliation {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.exp-employer-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-sm);
}

.exp-affiliation-arrow {
  font-size: 0.8rem;
  color: var(--text-muted);
  opacity: 0.6;
}

.exp-client-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--accent-navy);
  background: var(--accent-navy-subtle);
  border: 1px solid rgba(74, 125, 191, 0.25);
  padding: 0.2rem 0.65rem;
  border-radius: var(--radius-sm);
}

.exp-meta-row {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.25rem;
}

.exp-location {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.exp-responsibilities {
  list-style: none;
  padding: 0;
  margin: 0 0 1.5rem;
}

.exp-responsibilities li {
  position: relative;
  padding-left: 1.2rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 0.55rem;
}

.exp-responsibilities li::before {
  content: '→';
  position: absolute;
  left: 0;
  font-weight: 700;
}

.exp-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

/* ── Navy Experience (default) ── */
.navy-experience .exp-dot {
  border-color: var(--accent-navy);
}

.navy-experience .exp-dot.current {
  background: var(--accent-navy);
  /* Navy ring on current role */
  box-shadow: 0 0 0 4px var(--accent-navy-glow);
  border-color: var(--accent-navy);
}

.navy-experience .exp-period {
  color: var(--accent-navy);
  border-color: rgba(74, 125, 191, 0.2);
}

.navy-experience .current-badge {
  background: var(--accent-navy-subtle);
  color: var(--accent-navy);
  border: 1px solid rgba(74, 125, 191, 0.2);
}

.navy-experience .exp-responsibilities li::before {
  color: var(--accent-navy);
}



@media (max-width: 768px) {
  .exp-entry {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  .exp-connector { display: none; }
  .exp-card { margin-bottom: 1.5rem; }
}
</style>
