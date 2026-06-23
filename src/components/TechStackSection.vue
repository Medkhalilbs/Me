<template>
  <section id="tech-stack" class="section">
    <div class="section-number">05</div>
    <div class="container">
      <div class="section-badge reveal">🛠 Tech Stack</div>
      <h2 class="section-title reveal">Technologies I Use</h2>
      <p class="section-subtitle reveal">Tools and platforms I rely on to build production-grade software</p>

      <div class="tech-grid">
        <div
          v-for="(item, i) in techStack"
          :key="item.id"
          class="tech-item reveal"
          :style="{ animationDelay: `${i * 0.05}s` }"
        >
          <span class="tech-item-name">{{ item.name }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { TechStackItem } from '@/types'
defineProps<{ techStack: TechStackItem[] }>()
</script>

<style scoped>
.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: center;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.25rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  min-width: 100px;
  transition: all var(--transition);
  cursor: default;
}

.tech-item:hover {
  border-color: var(--accent);
  background: var(--accent-glow);
  transform: translateY(-4px);
  box-shadow: var(--shadow-glow);
}

.tech-item-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
  transition: color var(--transition);
}

.tech-item:hover .tech-item-name { color: var(--accent); }
</style>
