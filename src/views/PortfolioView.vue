<template>
  <div>
    <LoadingScreen />

    <!-- Scroll progress bar -->
    <div id="scroll-progress" :style="{ width: scrollPct + '%' }"></div>

    <Navbar :theme="theme" @toggle-theme="toggleTheme" @open-command="commandOpen = true" />
    <CommandPalette :open="commandOpen" @close="commandOpen = false" />

    <main v-if="!store.loading">
      <HeroSection        :profile="store.profile" :hero-stats="store.heroStats" :cvs="store.cvs" />
      <SectionDivider />
      <AboutSection       :profile="store.profile" :education="store.education" />
      <SectionDivider />
      <SkillsSection      :skills="store.skills" />
      <SectionDivider />
      <ExperienceSection  :experiences="store.experiences" />
      <SectionDivider />
      <ProjectsSection    :projects="store.projects" />
      <SectionDivider />
      <TechStackSection   :tech-stack="store.techStack" />
      <SectionDivider />
      <CertificationsSection :certifications="store.certifications" />
      <SectionDivider />
      <TestimonialsSection   :testimonials="store.testimonials" />
      <SectionDivider />
      <WhyWorkWithMe      :why-cards="store.whyCards" />
      <SectionDivider />
      <ContactSection     :profile="store.profile" />
      <FooterComponent    :profile="store.profile" />
    </main>

    <!-- Loading state -->
    <div v-else class="full-page-loader">
      <div class="loading-logo">MKBS</div>
    </div>

    <!-- Error -->
    <div v-if="store.error" class="error-banner">
      ⚠️ Could not reach the API server. Make sure <code>npm run server</code> is running on port 3001.
    </div>

    <!-- Back to top -->
    <Transition name="fade">
      <button v-if="scrollY > 300" class="back-to-top" @click="scrollToTop">↑</button>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'
import { useTheme } from '@/composables/useTheme'
import { useScrollReveal } from '@/composables/useScrollReveal'

import LoadingScreen from '@/components/LoadingScreen.vue'
import Navbar from '@/components/Navbar.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import HeroSection from '@/components/HeroSection.vue'
import AboutSection from '@/components/AboutSection.vue'
import SkillsSection from '@/components/SkillsSection.vue'
import ExperienceSection from '@/components/ExperienceSection.vue'
import ProjectsSection from '@/components/ProjectsSection.vue'
import TechStackSection from '@/components/TechStackSection.vue'
import CertificationsSection from '@/components/CertificationsSection.vue'
import TestimonialsSection from '@/components/TestimonialsSection.vue'
import WhyWorkWithMe from '@/components/WhyWorkWithMe.vue'
import ContactSection from '@/components/ContactSection.vue'
import FooterComponent from '@/components/FooterComponent.vue'
import SectionDivider from '@/components/SectionDivider.vue'

const store = usePortfolioStore()
const { theme, toggle: toggleTheme } = useTheme()

const { initObserver } = useScrollReveal()

// Réinitialiser l'observer quand les données sont chargées
watch(() => store.loading, (loading) => {
  if (!loading) {
    nextTick(() => setTimeout(initObserver, 100))
  }
})

const commandOpen = ref(false)
const scrollY = ref(0)
const scrollPct = ref(0)

function onScroll() {
  scrollY.value = window.scrollY
  const docH = document.documentElement.scrollHeight - window.innerHeight
  scrollPct.value = docH > 0 ? (window.scrollY / docH) * 100 : 0
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// ⌘K shortcut
function onKeydown(e: KeyboardEvent) {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    commandOpen.value = !commandOpen.value
  }
}

onMounted(() => {
  store.fetchAll()
  window.addEventListener('scroll', onScroll)
  window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeydown)
})
</script>

<style scoped>
.full-page-loader {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-banner {
  position: fixed;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius);
  font-size: 0.85rem;
  z-index: 999;
  backdrop-filter: blur(8px);
}

.back-to-top {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 44px; height: 44px;
  background: var(--accent);
  color: #0B0D10;
  border: none;
  border-radius: 50%;
  font-size: 1.1rem;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 4px 20px rgba(59, 130, 246, 0.5);
  transition: all var(--transition);
  z-index: 999;
  font-weight: 700;
}

.back-to-top:hover { transform: translateY(-3px); box-shadow: 0 8px 30px rgba(59, 130, 246, 0.7); }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
