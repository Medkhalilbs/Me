<template>
  <section id="hero" class="hero-section">
    <canvas id="particles-canvas"></canvas>
    <div id="mouse-glow"></div>

    <div class="container hero-content">
      <!-- Badge -->
      <div class="section-badge reveal" style="margin-bottom: 1.5rem;">
        <span class="badge-dot"></span>
        {{ profile?.hero_badge }}
      </div>

      <!-- Heading -->
      <h1 class="hero-heading reveal">
        {{ profile?.hero_heading }}
      </h1>

      <!-- Tunisian Signature Tagline -->
      <p class="signature-tagline reveal">
        Engineered with precision in Tunisia
      </p>

      <!-- Subtitle -->
      <p class="hero-subtitle reveal">
        {{ profile?.hero_subtitle }}
      </p>

      <!-- CTAs -->
      <div class="hero-ctas reveal">
        <a
          v-if="defaultCv"
          ref="cta1"
          :href="`/api/cvs/download/${defaultCv.id}`"
          class="btn btn-primary"
          download
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Download CV
        </a>
        <a ref="cta2" href="#contact" class="btn btn-outline">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
          </svg>
          Get in Touch
        </a>
      </div>

      <!-- Stats -->
      <div class="hero-stats reveal">
        <div v-for="stat in heroStats" :key="stat.id" class="hero-stat">
          <div class="stat-value">
            <template v-if="stat.is_static">{{ stat.value }}</template>
            <template v-else>{{ countUpValues[stat.id] || '0' }}</template>
            <span class="stat-suffix">{{ stat.suffix }}</span>
          </div>
          <div class="stat-label">{{ stat.label }}</div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useParticles } from '@/composables/useParticles'
import { useMouseGlow } from '@/composables/useMouseGlow'
import { useMagneticButton } from '@/composables/useMagneticButton'
import type { Profile, HeroStat, CV } from '@/types'

const props = defineProps<{
  profile: Profile | null
  heroStats: HeroStat[]
  cvs: CV[]
}>()

const defaultCv = computed(() => props.cvs.find(c => c.is_default) || props.cvs[0] || null)
const countUpValues = ref<Record<number, string>>({})

const cta1 = ref<HTMLElement | null>(null)
const cta2 = ref<HTMLElement | null>(null)

const { applyMagneticEffect } = useMagneticButton()

useParticles('particles-canvas')
useMouseGlow()

onMounted(() => {
  // Apply magnetic effect
  applyMagneticEffect(cta1.value)
  applyMagneticEffect(cta2.value)

  // BUG FIX: dispatch resize so canvas picks up correct parent dimensions after flex layout settles
  setTimeout(() => window.dispatchEvent(new Event('resize')), 200)

  // Animate count-up with slot-machine spin ticking for non-static stats
  props.heroStats.forEach(stat => {
    if (stat.is_static) return
    const target = parseInt(stat.value)
    if (isNaN(target)) return

    const duration = 2200
    const start = performance.now()
    
    const update = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)

      if (progress < 0.88) {
        // Fast slot-machine cycling digits
        countUpValues.value[stat.id] = Math.floor(Math.random() * (target * 1.2)).toString()
      } else {
        // Ease and settle on target
        countUpValues.value[stat.id] = target.toString()
      }

      if (progress < 1) {
        requestAnimationFrame(update)
      } else {
        countUpValues.value[stat.id] = target.toString()
      }
    }
    requestAnimationFrame(update)
  })
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
  background: radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.08) 0%, transparent 60%),
              radial-gradient(ellipse at bottom right, rgba(30, 64, 175, 0.06) 0%, transparent 60%);
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100%; /* BUG FIX: flex child must have width:100% to fill container */
  padding-top: 8rem;
  padding-bottom: 4rem;
  text-align: center;
}

.badge-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  box-shadow: 0 0 8px var(--accent);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.hero-heading {
  font-size: clamp(2.5rem, 5vw, 4rem);
  max-width: 900px;
  margin: 0 auto 0.5rem;
  line-height: 1.1;
  animation-delay: 0.1s;
}

.signature-tagline {
  font-family: var(--font-mono);
  color: var(--accent);
  font-style: italic;
  font-size: 0.95rem;
  margin-top: 0;
  margin-bottom: 2rem;
  letter-spacing: 0.05em;
  opacity: 0.85;
}

.hero-subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  color: var(--text-secondary);
  max-width: 650px;
  margin: 0 auto 2.5rem;
  animation-delay: 0.2s;
}

.hero-ctas {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 4rem;
  animation-delay: 0.3s;
  justify-content: center;
}

.hero-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 3rem;
  animation-delay: 0.4s;
  justify-content: center;
}

.hero-stat {
  position: relative;
}

.hero-stat::after {
  content: '';
  position: absolute;
  right: -1.5rem;
  top: 0; bottom: 0;
  width: 1px;
  background: var(--border);
}

.hero-stat:last-child::after { display: none; }

.stat-value {
  font-size: 2.5rem;
  font-weight: 800;
  font-family: 'Space Grotesk', sans-serif;
  background: var(--gradient-hero);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-suffix { font-size: 1.5rem; }

.stat-label {
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  margin-top: 0.25rem;
}
</style>
