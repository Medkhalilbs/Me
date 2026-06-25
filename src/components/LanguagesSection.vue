<template>
  <section id="languages" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 02b — LANGUAGES</div>
      <h2 class="section-title reveal">Linguistic Fluency</h2>
      <p class="section-subtitle reveal">Bridging communication across international teams and cultures</p>

      <div class="languages-grid">
        <div
          v-for="(lang, i) in languages"
          :key="lang.id"
          class="card lang-card reveal"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          <div class="lang-card-content">
            <!-- Language circular badge -->
            <div class="lang-badge-wrapper">
              <div class="lang-circle-progress" :class="lang.proficiency">
                <svg viewBox="0 0 36 36" class="circular-chart">
                  <path class="circle-bg"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path class="circle"
                    :stroke-dasharray="`${getProficiencyPct(lang.proficiency)}, 100`"
                    d="M18 2.0845
                      a 15.9155 15.9155 0 0 1 0 31.831
                      a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div class="lang-code">{{ lang.code }}</div>
              </div>
            </div>

            <!-- Language details -->
            <div class="lang-details">
              <h3 class="lang-name">{{ lang.name }}</h3>
              <span class="proficiency-badge" :class="lang.proficiency">
                {{ formatProficiency(lang.proficiency) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Language } from '@/types'

defineProps<{ languages: Language[] }>()

function getProficiencyPct(prof: string): number {
  switch (prof) {
    case 'native': return 100
    case 'fluent': return 90
    case 'professional': return 75
    case 'intermediate': return 55
    case 'basic': return 35
    default: return 50
  }
}

function formatProficiency(prof: string): string {
  switch (prof) {
    case 'native': return 'Native Speaker'
    case 'fluent': return 'Fluent'
    case 'professional': return 'Professional Working'
    case 'intermediate': return 'Intermediate'
    case 'basic': return 'Elementary'
    default: return prof.charAt(0).toUpperCase() + prof.slice(1)
  }
}
</script>

<style scoped>
.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.75rem;
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.lang-card {
  padding: 1.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all var(--transition);
}

.lang-card-content {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  width: 100%;
}

.lang-badge-wrapper {
  flex-shrink: 0;
}

.lang-circle-progress {
  position: relative;
  width: 72px;
  height: 72px;
}

.circular-chart {
  display: block;
  width: 100%;
  height: 100%;
}

.circle-bg {
  fill: none;
  stroke: var(--border);
  stroke-width: 2.8;
}

.circle {
  fill: none;
  stroke-width: 2.8;
  stroke-linecap: round;
  transition: stroke-dasharray 1s ease-in-out;
}

/* Colors based on proficiency */
.lang-circle-progress.native .circle {
  stroke: var(--success);
}
.lang-circle-progress.fluent .circle {
  stroke: var(--accent-navy);
}
.lang-circle-progress.professional .circle {
  stroke: var(--accent-bronze);
}
.lang-circle-progress.intermediate .circle {
  stroke: var(--warning);
}
.lang-circle-progress.basic .circle {
  stroke: var(--text-muted);
}

.lang-code {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-family: var(--font-mono);
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  text-transform: uppercase;
}

.lang-details {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.lang-name {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.proficiency-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.6rem;
  border-radius: 4px;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.proficiency-badge.native {
  background: rgba(16, 185, 129, 0.12);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.proficiency-badge.fluent {
  background: var(--accent-navy-subtle);
  color: var(--accent-navy);
  border: 1px solid rgba(74, 125, 191, 0.25);
}

.proficiency-badge.professional {
  background: var(--accent-navy-subtle);
  color: var(--accent-navy);
  border: 1px solid rgba(74, 125, 191, 0.2);
}

.proficiency-badge.intermediate {
  background: rgba(245, 158, 11, 0.12);
  color: var(--warning);
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.proficiency-badge.basic {
  background: rgba(255, 255, 255, 0.05);
  color: var(--text-muted);
  border: 1px solid var(--border);
}
</style>
