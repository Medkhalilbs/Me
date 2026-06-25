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
            <img v-if="profile?.profile_image_path" :src="`/api/images/profile/${profile.profile_image_path}`" alt="Mohamed Khalil" class="about-profile-img" />
            <div v-else class="profile-image-placeholder">
              <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--accent-navy)" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          </div>

          <!-- Available for work badge (bronze) -->
          <div class="status-badge-container">          
            <span class="status-text">{{ profile?.hero_badge  }}</span>
          </div>

 
        </div>

        <!-- Right: Bio & fact cards -->
        <div class="about-right">
          <template v-if="profile?.about_paragraphs?.length">
            <p
              v-for="(para, index) in profile.about_paragraphs"
              :key="index"
              class="reveal about-paragraph"
            >
              {{ para }}
            </p>
          </template>
          <!-- Callout Box -->
          <div v-if="profile?.callout_title || profile?.callout_text" class="callout-box reveal">
            <h4 class="callout-title">{{ profile.callout_title }}</h4>
            <p class="callout-text">{{ profile.callout_text }}</p>
          </div>

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

      <!-- Languages Sub-Section -->
      <div v-if="languages.length" class="languages-sub-section">
        <div class="section-badge reveal">LANGUAGES</div>
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
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { Profile } from '@/types'
import { usePortfolioStore } from '@/stores/portfolioStore'
import {Language} from '@/types'

defineProps<{
  profile: Profile | null,
  languages: Language[]
}>()


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

const store = usePortfolioStore()

const animatedFacts = ref({
  exp: 0, projects: 0, tech: 0, languages: 0, certs: 0, companies: 0
})

const factsRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const triggerCountUp = () => {
  const duration = 1500
  const startTime = performance.now()

  // Get dynamic targets from store arrays/values
  const expTarget = parseInt(store.heroStats.find(s => s.label.toLowerCase().includes('experience'))?.value || '5') || 5
  const projectsTarget = store.projects.length || 20
  const techTarget = store.techStack.length || 15
  const languagesTarget = store.languages.length || 3
  const certsTarget = store.certifications.length || 1
  const companiesTarget = new Set(store.experiences.map(e => e.company)).size || 4

  const update = (now: number) => {
    const elapsed = now - startTime
    const progress = Math.min(elapsed / duration, 1)
    const ease = progress * (2 - progress)
    animatedFacts.value.exp = Math.floor(ease * expTarget)
    animatedFacts.value.projects = Math.floor(ease * projectsTarget)
    animatedFacts.value.tech = Math.floor(ease * techTarget)
    animatedFacts.value.languages = Math.floor(ease * languagesTarget)
    animatedFacts.value.certs = Math.floor(ease * certsTarget)
    animatedFacts.value.companies = Math.floor(ease * companiesTarget)
    if (progress < 1) {
      requestAnimationFrame(update)
    } else {
      animatedFacts.value = {
        exp: expTarget,
        projects: projectsTarget,
        tech: techTarget,
        languages: languagesTarget,
        certs: certsTarget,
        companies: companiesTarget
      }
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

.about-profile-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.callout-box {
  margin-top: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: var(--accent-navy-subtle);
  border-left: 3px solid var(--accent-navy);
  border-radius: var(--radius-sm);
}

.callout-title {
  margin: 0 0 0.5rem;
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--accent-navy);
}

.callout-text {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
  white-space: pre-line;
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
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent-bronze);
  animation: pulse-bronze 1s ease-in-out infinite alternate;
}

@keyframes pulse-navy {
  0% { opacity: 0.5; }
  100% { opacity: 1; }
}

.status-text {
  font-family: var(--font-mono);
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
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

/* Languages sub-section — sits below the about grid with consistent vertical rhythm */
.languages-sub-section {
  margin-top: 4rem;
  padding-top: 3rem;
  border-top: 1px solid var(--border);
}

.languages-sub-section .section-badge {
  margin-bottom: 2rem;
}

.languages-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
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
