<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container nav-container">
      <!-- Logo: MK (text-primary) + BS (accent-navy) -->
      <a href="#hero" class="logo-wrap">
        <span class="logo-text">
          {{ logoInitials.first }}<span class="bs-accent">{{ logoInitials.second }}</span>
        </span>
      </a>

      <!-- Desktop Nav Links -->
      <ul class="nav-links">
        <li v-for="link in navLinks" :key="link.href">
          <a
            :href="link.href"
            class="nav-link"
            :class="{ active: activeSection === link.href }"
          >
            <span class="active-dot" v-if="activeSection === link.href"></span>
            {{ link.label }}
          </a>
        </li>
      </ul>

      <!-- Nav Actions -->
      <div class="nav-actions">
        <!-- Command Palette Badge -->
        <button class="cmd-palette-btn" @click="$emit('open-command')">
          <span class="cmd-badge">⌘K</span>
        </button>
        <!-- Theme Toggle -->
        <button class="theme-toggle" @click="$emit('toggle-theme')">
          <span v-if="theme === 'dark'">☀️</span>
          <span v-else>🌙</span>
        </button>
        <!-- Hamburger button -->
        <button class="mobile-menu-btn" :class="{ open: mobileOpen }" @click="mobileOpen = !mobileOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Slide-In Menu -->
    <Transition name="slide-menu">
      <div v-if="mobileOpen" class="mobile-menu-panel bg-glass">
        <div class="mobile-menu-header">
          <span class="logo-text">
            {{ logoInitials.first }}<span class="bs-accent">{{ logoInitials.second }}</span>
          </span>
          <button class="mobile-close" @click="mobileOpen = false">✕</button>
        </div>
        <nav class="mobile-nav-links">
          <a
            v-for="link in navLinks"
            :key="link.href"
            :href="link.href"
            class="mobile-link"
            :class="{ active: activeSection === link.href }"
            @click="mobileOpen = false"
          >
            <span class="active-dot" v-if="activeSection === link.href"></span>
            {{ link.label }}
          </a>
        </nav>
      </div>
    </Transition>
    <!-- Mobile overlay -->
    <div v-if="mobileOpen" class="mobile-menu-overlay" @click="mobileOpen = false"></div>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { Profile } from '@/types'

const props = defineProps<{
  theme: string
  profile: Profile | null
}>()
defineEmits(['toggle-theme', 'open-command'])

const logoInitials = computed(() => {
  const name = props.profile?.name || 'Mohamed Khalil Ben Sedrine'
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 4) {
    return {
      first: (parts[0]?.[0] || '') + (parts[1]?.[0] || ''),
      second: (parts[2]?.[0] || '') + (parts[3]?.[0] || '')
    }
  } else if (parts.length === 3) {
    return {
      first: (parts[0]?.[0] || '') + (parts[1]?.[0] || ''),
      second: parts[2]?.[0] || ''
    }
  } else if (parts.length === 2) {
    return {
      first: parts[0]?.[0] || '',
      second: parts[1]?.[0] || ''
    }
  }
  return { first: 'MK', second: 'BS' }
})

const isScrolled = ref(false)
const mobileOpen = ref(false)
const activeSection = ref('#hero')

const navLinks = [
  { href: '#hero',       label: 'Home' },
  { href: '#about',      label: 'About' },
  { href: '#skills',     label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects',   label: 'Projects' },
  { href: '#contact',    label: 'Contact' },
]

function onScroll() {
  isScrolled.value = window.scrollY > 40
}

let sectionObserver: IntersectionObserver | null = null

onMounted(() => {
  window.addEventListener('scroll', onScroll)

  const observerOptions = {
    root: null,
    rootMargin: '-40% 0px -50% 0px',
    threshold: 0
  }

  sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = '#' + entry.target.id
      }
    })
  }, observerOptions)

  const sections = ['hero', 'about', 'skills', 'experience', 'projects', 'contact']
  sections.forEach((id) => {
    const el = document.getElementById(id)
    if (el) sectionObserver?.observe(el)
  })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  if (sectionObserver) {
    sectionObserver.disconnect()
  }
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 1.25rem 0;
  transition: all var(--transition-slow);
}

.navbar.scrolled {
  background: var(--bg-glass);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 0.85rem 0;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo */
.logo-wrap {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.bs-accent {
  color: var(--accent-navy);
}

/* Nav links */
.nav-links {
  display: flex;
  list-style: none;
  margin: 0; padding: 0;
  gap: 1.5rem;
  align-items: center;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 500;
  font-size: 0.9rem;
  padding: 0.4rem 0.5rem;
  position: relative;
  transition: color var(--transition);
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
}

/* Navy underline slides in on hover */
.nav-link::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0.5rem;
  right: 0.5rem;
  height: 1.5px;
  background-color: var(--accent-navy);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.nav-link:hover {
  color: var(--text-primary);
}

.nav-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

.nav-link.active {
  color: var(--accent-navy);
  font-weight: 600;
}

/* 4px navy dot indicator for active link */
.active-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background-color: var(--accent-navy);
  flex-shrink: 0;
}

/* Nav Actions */
.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.cmd-palette-btn {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-sm);
  padding: 0.4rem 0.75rem;
  cursor: pointer;
  transition: all var(--transition);
}

.cmd-palette-btn:hover {
  border-color: var(--accent-navy);
}

.cmd-badge {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.theme-toggle {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 34px; height: 34px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.95rem;
  transition: all var(--transition);
}

.theme-toggle:hover {
  border-color: var(--accent-navy);
  transform: scale(1.05);
}

/* Hamburger */
.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  z-index: 1002;
}

.mobile-menu-btn span {
  display: block;
  width: 22px; height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: all var(--transition);
}

.mobile-menu-btn.open span:nth-child(1) {
  transform: translateY(7px) rotate(45deg);
}

.mobile-menu-btn.open span:nth-child(2) {
  opacity: 0;
}

.mobile-menu-btn.open span:nth-child(3) {
  transform: translateY(-7px) rotate(-45deg);
}

/* Mobile panel */
.mobile-menu-panel {
  position: fixed;
  top: 0; right: 0; bottom: 0;
  width: 280px;
  background: var(--bg-card);
  border-left: 1px solid var(--border);
  z-index: 1001;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.3);
}

.mobile-menu-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
}

.mobile-close {
  background: none;
  border: none;
  color: var(--text-primary);
  font-size: 1.25rem;
  cursor: pointer;
}

.mobile-nav-links {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.mobile-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  transition: color var(--transition);
}

.mobile-link:hover,
.mobile-link.active {
  color: var(--accent-navy);
}

.mobile-menu-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  z-index: 1000;
}

/* Slide Transition */
.slide-menu-enter-active,
.slide-menu-leave-active {
  transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-menu-enter-from,
.slide-menu-leave-to {
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-menu-btn { display: flex; }
}
</style>
