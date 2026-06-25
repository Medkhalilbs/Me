<template>
  <section id="why-me" class="section" style="background: var(--bg-secondary);">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 08 — WHY ME</div>
      <h2 class="section-title reveal">Why Work With Me</h2>
      <p class="section-subtitle reveal">Combining engineering precision with enterprise execution capability</p>

      <div class="why-grid">
        <div
          v-for="(card, i) in whyCards"
          :key="card.id"
          class="card why-card reveal"
          :style="{ animationDelay: `${i * 0.08}s` }"
        >
          <!-- Custom Icon representation -->
          <div class="why-icon">
            <svg v-if="card.icon === 'cpu'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3"/></svg>
            <svg v-else-if="card.icon === 'building'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><line x1="9" y1="22" x2="9" y2="16"/><line x1="15" y1="22" x2="15" y2="16"/><line x1="9" y1="16" x2="15" y2="16"/><path d="M8 6h.01M16 6h.01M8 10h.01M16 10h.01M12 6h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>
            <svg v-else-if="card.icon === 'shield'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <svg v-else-if="card.icon === 'globe'" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20M2 12h20"/></svg>
            <svg v-else width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-navy)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          
          <h3 class="why-title">{{ card.title }}</h3>
          <p class="why-desc">{{ card.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { WhyCard } from '@/types'

defineProps<{ whyCards: WhyCard[] }>()
</script>

<style scoped>
.why-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  position: relative;
  z-index: 1;
}

.why-card {
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  transition: all var(--transition);
}

.why-icon {
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: var(--accent-navy-subtle);
  border: 1px solid rgba(74, 125, 191, 0.2);
  border-radius: 8px;
}

.why-title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
}

.why-desc {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.6;
  margin: 0;
}

.why-card:hover {
  border-color: rgba(74, 125, 191, 0.35) !important;
}

@media (max-width: 768px) {
  .why-grid {
    grid-template-columns: 1fr;
    gap: 1.25rem;
  }
}
</style>
