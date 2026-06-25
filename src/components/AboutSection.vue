<template>
  <section id="about" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 01 — ABOUT</div>
      <h2 class="section-title reveal">The Mind Behind the Code</h2>
      <p class="section-subtitle reveal">Full-stack software engineer with roots in hardware systems</p>

      <div class="about-layout-grid">
        <!-- Left: Profile card & status & languages -->
        <div class="about-left reveal">
          <!-- Profile image card -->
          <div class="profile-image-card">
            <div class="profile-image-placeholder">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent-navy)" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          <!-- Available for work badge (bronze) -->
          <div class="status-badge-container">
            <span class="status-pulse-dot"></span>
            <span class="status-text">Available for Remote &amp; International Work</span>
          </div>

          <!-- Segmented Languages bar -->
          <div class="languages-section">
            <div class="lang-header">// languages</div>
            <div class="lang-bar">
              <div class="lang-segment arabic" style="width: 45%;">
                <span>AR (Native)</span>
              </div>
              <div class="lang-segment french" style="width: 35%;">
                <span>FR (Fluent)</span>
              </div>
              <div class="lang-segment english" style="width: 20%;">
                <span>EN (Prof.)</span>
              </div>
            </div>
            <div class="lang-labels">
              <span>Arabic</span>
              <span>French</span>
              <span>English</span>
            </div>
          </div>
        </div>

        <!-- Right: Bio & fact cards -->
        <div class="about-right">
          <p class="reveal about-paragraph">
            Software engineer with 5 years of experience in full-stack development, IT consulting, and system integration. Skilled in designing and building scalable web applications using modern front-end and back-end technologies.
          </p>
          <p class="reveal about-paragraph">
            My journey began in embedded systems — programming ERIKA OS on AURIX microcontrollers, working with CAN bus and GPIO. Today I architect cloud-native applications with Vue.js, Spring Boot, and AWS. This rare combination gives me a deep understanding of systems at every level, from silicon to cloud.
          </p>

          <!-- Fact counter grid -->
          <div class="facts-grid reveal" ref="factsRef">
            <div class="fact-card card">
              <span class="fact-num">{{ animatedFacts.exp }}+</span>
              <span class="fact-label">Years Experience</span>
            </div>
            <div class="fact-card card">
              <span class="fact-num">{{ animatedFacts.projects }}+</span>
              <span class="fact-label">Projects Shipped</span>
            </div>
            <div class="fact-card card">
              <span class="fact-num">{{ animatedFacts.tech }}+</span>
              <span class="fact-label">Technologies</span>
            </div>
            <div class="fact-card card">
              <span class="fact-num">{{ animatedFacts.languages }}</span>
              <span class="fact-label">Languages Spoken</span>
            </div>
            <div class="fact-card card">
              <span class="fact-num">{{ animatedFacts.certs }}</span>
              <span class="fact-label">Certification</span>
            </div>
            <div class="fact-card card">
              <span class="fact-num">{{ animatedFacts.companies }}</span>
              <span class="fact-label">Companies Worked With</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Profile } from '@/types'

defineProps<{
  profile: Profile | null
}>()

const animatedFacts = ref({
  exp: 0, projects: 0, tech: 0, languages: 0, certs: 0, companies: 0
})

const factsRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const triggerCountUp = () => {
  const duration = 1500
  const startTime = performance.now()
  const update = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = progress * (2 - progress)
    animatedFacts.value.exp = Math.floor(ease * 5)
    animatedFacts.value.projects = Math.floor(ease * 20)
    animatedFacts.value.tech = Math.floor(ease * 15)
    animatedFacts.value.languages = Math.floor(ease * 3)
    animatedFacts.value.certs = Math.floor(ease * 1)
    animatedFacts.value.companies = Math.floor(ease * 4)
    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      animatedFacts.value = { exp: 5, projects: 20, tech: 15, languages: 3, certs: 1, companies: 4 }
    }
  }
  requestAnimationFrame(update)
}

onMounted(() => {
  observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      triggerCountUp()
      observer?.disconnect()
    }
  }, { threshold: 0.15 })
  if (factsRef.value) observer.observe(factsRef.value)
})

onUnmounted(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
.about-layout-grid {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 4rem;
  align-items: start;
  position: relative;
  z-index: 1;
}

/* Left Column */
.about-left {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-image-card {
  width: 100%;
  aspect-ratio: 1 / 1;
  background: var(--bg-card);
  /* 1px navy border on profile card */
  border: 1px solid rgba(74, 125, 191, 0.25);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all var(--transition);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.profile-image-card:hover {
  border-color: rgba(74, 125, 191, 0.5);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.profile-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(74, 125, 191, 0.04), rgba(74, 125, 191, 0.01));
}

/* Available for work badge — muted navy accent */
.status-badge-container {
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.4rem 0.9rem;
  border-radius: var(--radius-sm);
  background: var(--accent-navy-subtle);
  border: 1px solid rgba(74, 125, 191, 0.2);
  margin-bottom: 2rem;
}

.status-pulse-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--accent-navy);
  animation: pulse-navy 2s ease-in-out infinite alternate;
}

@keyframes pulse-navy {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-text {
  font-family: var(--font-mono);
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--accent-bronze);
}

/* Languages bar */
.languages-section {
  width: 100%;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem;
}

.lang-header {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--accent-navy);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}

.lang-bar {
  display: flex;
  height: 20px;
  background: var(--bg-secondary);
  border-radius: 3px;
  overflow: hidden;
  border: 1px solid var(--border);
  margin-bottom: 0.5rem;
}

.lang-segment {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.62rem;
  font-weight: 600;
  height: 100%;
}

.arabic {
  background: rgba(74, 125, 191, 0.15);
  color: var(--accent-navy);
  border-right: 1px solid var(--border);
}

.french {
  background: rgba(74, 125, 191, 0.08);
  color: var(--accent-navy);
  opacity: 0.75;
  border-right: 1px solid var(--border);
}

.english {
  background: rgba(255, 255, 255, 0.02);
  color: var(--text-muted);
}

.lang-labels {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 500;
}

/* Right Column */
.about-right {
  display: flex;
  flex-direction: column;
}

.about-paragraph {
  font-size: 1.02rem;
  color: var(--text-secondary);
  line-height: 1.75;
  margin: 0 0 1.5rem;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.1rem;
  margin-top: 1.5rem;
}

.fact-card {
  padding: 1.1rem 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  border-radius: var(--radius);
}

/* Fact numbers in accent-navy */
.fact-num {
  font-family: var(--font-mono);
  font-size: 1.65rem;
  font-weight: 700;
  color: var(--accent-navy);
  line-height: 1;
}

.fact-label {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.3;
  margin-top: 0.2rem;
}

@media (max-width: 1024px) {
  .about-layout-grid {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
  .about-left {
    max-width: 340px;
    margin: 0 auto;
    width: 100%;
  }
}

@media (max-width: 600px) {
  .facts-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
}
</style>
