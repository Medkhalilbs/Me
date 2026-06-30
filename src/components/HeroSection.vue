<template>
  <section id="hero" class="hero-section">
    <!-- Particle field background -->
    <canvas id="particles-canvas"></canvas>
    <!-- Subtle mouse tracking glow — navy steel -->
    <div id="mouse-glow"></div>

    <div class="container hero-content">
      <!-- Terminal annotation prefix -->
      <div class="terminal-prefix reveal">&gt; whoami</div>

      <!-- Large Name — signature gradient on first line -->
      <h1 class="hero-name reveal">
        <span class="gradient-name gradient-signature-text">{{ firstName }}</span>
        <span class="sub-name">{{ lastName }}</span>
      </h1>

      <!-- Role title with blinking cursor -->
      <p class="hero-title reveal" v-if="profile?.title">
        <span>{{ profile.title }}</span><span class="terminal-cursor">_</span>
      </p>

      <!-- Tagline -->
      <p class="hero-subtitle reveal" v-if="profile?.hero_subtitle">
        {{ profile.hero_subtitle }}
      </p>

      <!-- CTA buttons -->
      <div class="hero-ctas reveal">
        <a href="#projects" class="btn btn-primary">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          View My Work
        </a>
        <a
          v-if="defaultCv"
          :href="`/api/cvs/download/${defaultCv.id}`"
          class="btn btn-outline"
          download
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download CV
        </a>
      </div>

      <!-- Social links -->
      <div class="social-row reveal">
        <a v-if="profile?.github_url" :href="profile.github_url" target="_blank" rel="noopener" aria-label="GitHub" class="social-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
          </svg>
        </a>
        <a v-if="profile?.linkedin_url" :href="profile.linkedin_url" target="_blank" rel="noopener" aria-label="LinkedIn" class="social-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
            <rect x="2" y="9" width="4" height="12" />
            <circle cx="4" cy="4" r="2" />
          </svg>
        </a>
        <a v-if="profile?.email" :href="`mailto:${profile.email}`" aria-label="Email" class="social-link">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </a>
      </div>

      <!-- Scroll indicator -->
      <div class="scroll-indicator">
        <span class="scroll-text">scroll_down</span>
        <div class="scroll-chevron-container">
          <svg class="scroll-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useParticles } from '@/composables/useParticles'
import { useMouseGlow } from '@/composables/useMouseGlow'
import { usePortfolioStore } from '@/stores/portfolioStore'

const store = usePortfolioStore()
const profile = computed(() => store.profile)
const defaultCv = computed(() => store.cvs.find(c => c.is_default) || store.cvs[0] || null)

const firstName = computed(() => {
  if (!profile.value?.name) return ''
  const parts = profile.value.name.trim().split(/\s+/)
  return parts.length > 2 ? parts.slice(0, 2).join(' ') : parts[0] || ''
})

const lastName = computed(() => {
  if (!profile.value?.name) return ''
  const parts = profile.value.name.trim().split(/\s+/)
  return parts.length > 2 ? parts.slice(2).join(' ') : parts.slice(1).join(' ') || ''
})

useParticles('particles-canvas')
useMouseGlow()

onMounted(() => {
  setTimeout(() => window.dispatchEvent(new Event('resize')), 150)
})
</script>

<style scoped>
.hero-section {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: var(--bg-primary);
  background-image:
    radial-gradient(circle at 20% 20%, rgba(74, 125, 191, 0.05) 0%, transparent 50%),
    radial-gradient(circle at 80% 80%, rgba(74, 125, 191, 0.02) 0%, transparent 50%);
}

#particles-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

#mouse-glow {
  pointer-events: none;
  position: fixed;
  width: 500px; height: 500px;
  border-radius: 50%;
  /* Very subtle navy steel glow */
  background: radial-gradient(circle, rgba(74, 125, 191, 0.03) 0%, transparent 70%);
  transform: translate(-50%, -50%);
  z-index: 0;
  transition: opacity 0.15s ease-out;
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%;
  padding-top: 7rem;
  padding-bottom: 5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

/* Terminal Prefix */
.terminal-prefix {
  font-family: var(--font-mono);
  color: var(--accent-navy);
  font-size: 0.9rem;
  letter-spacing: 0.08em;
  margin-bottom: 1rem;
  opacity: 0.7;
}

/* Name */
.hero-name {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  margin: 0 0 1rem;
  line-height: 1.05;
}

/* Signature gradient on "Mohamed Khalil" */
.gradient-name {
  font-size: clamp(2.5rem, 6vw, 4.8rem);
  font-weight: 800;
  letter-spacing: -0.03em;
}

.sub-name {
  font-size: clamp(1.8rem, 4vw, 3rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--text-primary);
}

/* Role Title */
.hero-title {
  font-family: var(--font-mono);
  font-size: clamp(0.9rem, 1.8vw, 1.15rem);
  color: var(--text-secondary);
  margin: 0 0 1.75rem;
  font-weight: 500;
}

.terminal-cursor {
  color: var(--accent-navy);
  font-weight: bold;
  animation: cursor-blink 1.2s infinite;
}

@keyframes cursor-blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}

/* Subtitle */
.hero-subtitle {
  font-size: clamp(1rem, 1.8vw, 1.12rem);
  color: var(--text-secondary);
  max-width: 560px;
  margin: 0 auto 2.5rem;
  line-height: 1.65;
}

/* CTAs */
.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 1.25rem;
  margin-bottom: 3rem;
  justify-content: center;
}

/* Social Row */
.social-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 5rem;
}

.social-link {
  color: var(--text-secondary);
  transition: all var(--transition);
}

.social-link:hover {
  color: var(--accent-navy);
  transform: translateY(-2px);
}

/* Scroll indicator */
.scroll-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.scroll-text {
  font-family: var(--font-mono);
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
}

.scroll-chevron-container {
  display: flex;
  align-items: center;
  justify-content: center;
  animation: bounce 1.8s infinite ease-in-out;
  color: var(--accent-navy);
  opacity: 0.6;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(6px); }
}
</style>
