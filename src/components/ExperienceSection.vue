<template>
  <section id="experience" class="section">
    <div class="container">
      <div class="section-badge reveal">💼 Experience</div>
      <h2 class="section-title reveal">Professional Journey</h2>
      <p class="section-subtitle reveal">5 years building enterprise software for global clients</p>

      <div class="exp-timeline">
        <div
          v-for="(exp, i) in experiences"
          :key="exp.id"
          class="exp-entry reveal"
          :style="{ animationDelay: `${i * 0.12}s` }"
        >
          <!-- Connector -->
          <div class="exp-connector">
            <div class="exp-dot" :class="{ current: exp.is_current }"></div>
            <div v-if="i < experiences.length - 1" class="exp-line"></div>
          </div>

          <!-- Card -->
          <div class="card exp-card">
            <div class="exp-header">
              <div>
                <div class="exp-period">
                  {{ exp.start_date }} — {{ exp.is_current ? 'Present' : exp.end_date }}
                  <span v-if="exp.is_current" class="current-badge">Current</span>
                </div>
                <h3 class="exp-role">{{ exp.role }}</h3>
                <div class="exp-company">{{ exp.company }}</div>
                <div v-if="exp.client" class="exp-client">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  Client: {{ exp.client }}
                </div>
                <div v-if="exp.location" class="exp-location">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                  {{ exp.location }}
                </div>
              </div>
            </div>

            <!-- Responsibilities -->
            <ul class="exp-responsibilities">
              <li v-for="resp in exp.responsibilities" :key="resp.id">{{ resp.text }}</li>
            </ul>

            <!-- Tech -->
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
import type { Experience } from '@/types'
defineProps<{ experiences: Experience[] }>()
</script>

<style scoped>
.exp-timeline { display: flex; flex-direction: column; gap: 0; }

.exp-entry {
  display: grid;
  grid-template-columns: 40px 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.exp-connector {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 1.5rem;
}

.exp-dot {
  width: 14px; height: 14px;
  border-radius: 50%;
  background: var(--bg-secondary);
  border: 2px solid var(--border);
  z-index: 1;
  flex-shrink: 0;
  transition: all var(--transition);
}

.exp-dot.current {
  background: var(--accent);
  border-color: var(--accent);
  box-shadow: 0 0 0 4px var(--accent-glow);
}

.exp-line {
  flex: 1;
  width: 2px;
  background: linear-gradient(to bottom, var(--accent), var(--border));
  margin-top: 6px;
}

.exp-card { padding: 1.75rem; }

.exp-header { margin-bottom: 1.25rem; }

.exp-period {
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.4rem;
}

.current-badge {
  background: var(--accent);
  color: #fff;
  padding: 0.15rem 0.5rem;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: 700;
}

.exp-role { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.25rem; }
.exp-company { color: var(--text-secondary); font-weight: 600; font-size: 0.9rem; margin-bottom: 0.4rem; }

.exp-client, .exp-location {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.82rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.exp-responsibilities {
  list-style: none;
  padding: 0;
  margin: 0 0 1.25rem;
}

.exp-responsibilities li {
  position: relative;
  padding-left: 1.2rem;
  color: var(--text-secondary);
  font-size: 0.88rem;
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.exp-responsibilities li::before {
  content: '→';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 700;
}

.exp-tech { display: flex; flex-wrap: wrap; gap: 0.4rem; }
</style>
