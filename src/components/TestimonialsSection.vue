<template>
  <section id="testimonials" class="section">
    <div class="section-number">07</div>
    <div class="container">
      <div class="section-badge reveal">💬 Testimonials</div>
      <h2 class="section-title reveal">What Colleagues Say</h2>
      <p class="section-subtitle reveal">Feedback from peers and stakeholders I've worked with</p>

      <div class="testimonials-grid">
        <div
          v-for="(t, i) in testimonials"
          :key="t.id"
          class="card testimonial-card reveal"
          :style="{ animationDelay: `${i * 0.1}s` }"
        >
          <div class="quote-icon">"</div>
          <p class="testimonial-text">{{ t.text }}</p>
          <div class="testimonial-author">
            <div class="author-avatar">{{ t.avatar_initials }}</div>
            <div>
              <div class="author-name">{{ t.author_name }}</div>
              <div class="author-role">{{ t.author_role }}, {{ t.author_company }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Testimonial } from '@/types'
defineProps<{ testimonials: Testimonial[] }>()
</script>

<style scoped>
.testimonials-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.testimonial-card { padding: 2rem; }

.quote-icon {
  font-size: 4rem;
  line-height: 1;
  background: var(--gradient-hero);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-family: serif;
  margin-bottom: 0.5rem;
}

.testimonial-text {
  color: var(--text-secondary);
  font-size: 0.9rem;
  line-height: 1.8;
  margin: 0 0 1.5rem;
  font-style: italic;
}

.testimonial-author { display: flex; align-items: center; gap: 0.75rem; }

.author-avatar {
  width: 40px; height: 40px;
  border-radius: 50%;
  background: var(--gradient-hero);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 0.85rem;
  flex-shrink: 0;
}

.author-name { font-weight: 700; font-size: 0.88rem; }
.author-role { font-size: 0.78rem; color: var(--text-muted); }
</style>
