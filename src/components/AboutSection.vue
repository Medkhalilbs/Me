<template>
  <section id="about" class="section">
    <div class="container">
      <div class="section-badge reveal">👤 About Me</div>
      <h2 class="section-title reveal">The Mind Behind the Code</h2>
      <p class="section-subtitle reveal">Full-stack engineer with roots in embedded systems</p>

      <div class="about-grid">
        <!-- Text -->
        <div class="about-text">
          <p
            v-for="(para, i) in profile?.about_paragraphs"
            :key="i"
            class="reveal about-para"
            :style="{ animationDelay: `${i * 0.1}s` }"
          >{{ para }}</p>

          <!-- Callout -->
          <div v-if="profile?.callout_title" class="about-callout reveal">
            <div class="callout-icon">💡</div>
            <div>
              <h4 class="callout-title">{{ profile.callout_title }}</h4>
              <p class="callout-text">{{ profile.callout_text }}</p>
            </div>
          </div>
        </div>

        <!-- Timeline: Education -->
        <div class="about-sidebar">
          <h3 class="reveal sidebar-title">Education</h3>
          <div class="timeline reveal">
            <div class="timeline-line"></div>
            <div
              v-for="(edu, i) in education"
              :key="edu.id"
              class="timeline-entry"
              :style="{ animationDelay: `${i * 0.15}s` }"
            >
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <div class="timeline-period">{{ edu.start_year }} – {{ edu.end_year }}</div>
                <h4 class="timeline-school">{{ edu.school }}</h4>
                <p class="timeline-degree">{{ edu.degree }}</p>
                <p class="timeline-desc">{{ edu.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Profile, Education } from '@/types'

defineProps<{
  profile: Profile | null
  education: Education[]
}>()
</script>

<style scoped>
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: start;
}

.about-para {
  color: var(--text-secondary);
  margin-bottom: 1.25rem;
  line-height: 1.8;
}

.about-callout {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
  background: var(--accent-glow);
  border: 1px solid rgba(99, 102, 241, 0.2);
  border-radius: var(--radius);
  padding: 1.5rem;
  margin-top: 2rem;
}

.callout-icon { font-size: 1.8rem; flex-shrink: 0; }
.callout-title { font-size: 1rem; font-weight: 700; margin: 0 0 0.4rem; color: var(--accent); }
.callout-text { font-size: 0.9rem; color: var(--text-secondary); margin: 0; }

.sidebar-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.timeline {
  position: relative;
  padding-left: 2.5rem;
}

.timeline-entry {
  display: flex;
  gap: 1.25rem;
  margin-bottom: 2rem;
  position: relative;
}

.timeline-content { flex: 1; }

.timeline-period {
  font-size: 0.78rem;
  color: var(--accent);
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 0.25rem;
}

.timeline-school {
  font-size: 1rem;
  font-weight: 700;
  margin: 0 0 0.25rem;
}

.timeline-degree {
  font-size: 0.82rem;
  color: var(--text-secondary);
  margin: 0 0 0.5rem;
}

.timeline-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.6;
}

@media (max-width: 900px) {
  .about-grid { grid-template-columns: 1fr; gap: 2rem; }
}
</style>
