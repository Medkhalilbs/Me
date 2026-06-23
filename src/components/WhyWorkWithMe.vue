<template>
  <section id="why-me" class="section" style="background: var(--bg-secondary);">
    <div class="container">
      <div class="section-badge reveal">✨ Why Work With Me</div>
      <h2 class="section-title reveal">What Sets Me Apart</h2>
      <p class="section-subtitle reveal">More than just technical skills — a partner for your engineering goals</p>

      <div class="why-grid">
        <div
          v-for="(card, i) in whyCards"
          :key="card.id"
          class="card why-card reveal"
          :style="{ animationDelay: `${i * 0.08}s` }"
        >
          <div class="why-icon">{{ emojiForIcon(card.icon) }}</div>
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

const iconEmojis: Record<string, string> = {
  puzzle: '🧩',
  layout: '🏗',
  'trending-up': '📈',
  zap: '⚡',
  users: '👥',
  target: '🎯',
  building: '🏢',
  star: '⭐',
}

function emojiForIcon(icon: string): string {
  return iconEmojis[icon] || '⭐'
}
</script>

<style scoped>
.why-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
}

.why-card { padding: 1.75rem; }

.why-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.why-title { font-size: 1rem; font-weight: 700; margin: 0 0 0.5rem; }
.why-desc { color: var(--text-secondary); font-size: 0.88rem; line-height: 1.7; margin: 0; }
</style>
