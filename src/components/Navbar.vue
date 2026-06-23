<template>
  <nav class="navbar" :class="{ scrolled: isScrolled }">
    <div class="container" style="display: flex; align-items: center; justify-content: space-between;">
      <!-- Logo -->
      <a href="#hero" class="gradient-text" style="font-family: 'Space Grotesk', sans-serif; font-size: 1.5rem; font-weight: 800; text-decoration: none;">
        MKBS
      </a>

      <!-- Desktop Nav Links -->
      <ul class="nav-links">
        <li v-for="link in navLinks" :key="link.href">
          <a :href="link.href" class="nav-link">{{ link.label }}</a>
        </li>
      </ul>

      <!-- Actions -->
      <div style="display: flex; align-items: center; gap: 0.75rem;">
        <button class="btn btn-outline" style="padding: 0.5rem 1rem; font-size: 0.85rem;" @click="$emit('open-command')">
          <span style="font-family: monospace; opacity: 0.7;">⌘K</span>
        </button>
        <button class="theme-toggle" @click="$emit('toggle-theme')">
          <span v-if="theme === 'dark'">☀️</span>
          <span v-else>🌙</span>
        </button>
        <button class="mobile-menu-btn" @click="mobileOpen = !mobileOpen">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition name="slide-down">
      <div v-if="mobileOpen" class="mobile-menu">
        <a
          v-for="link in navLinks"
          :key="link.href"
          :href="link.href"
          class="mobile-link"
          @click="mobileOpen = false"
        >{{ link.label }}</a>
      </div>
    </Transition>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{ theme: string }>()
defineEmits(['toggle-theme', 'open-command'])

const isScrolled = ref(false)
const mobileOpen = ref(false)

const navLinks = [
  { href: '#about',          label: 'About' },
  { href: '#skills',         label: 'Skills' },
  { href: '#experience',     label: 'Experience' },
  { href: '#projects',       label: 'Projects' },
  { href: '#tech-stack',     label: 'Tech Stack' },
  { href: '#certifications', label: 'Certifications' },
  { href: '#contact',        label: 'Contact' },
]

function onScroll() { isScrolled.value = window.scrollY > 50 }
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))
</script>

<style scoped>
.nav-links {
  display: flex;
  list-style: none;
  margin: 0; padding: 0;
  gap: 0.25rem;
}

.nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 0.4rem 0.75rem;
  border-radius: 8px;
  transition: all var(--transition);
}
.nav-link:hover { color: var(--accent); background: var(--accent-glow); }

.theme-toggle {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 50%;
  width: 40px; height: 40px;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  font-size: 1.1rem;
  transition: all var(--transition);
}
.theme-toggle:hover { border-color: var(--accent); }

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
}
.mobile-menu-btn span {
  display: block;
  width: 22px; height: 2px;
  background: var(--text-primary);
  border-radius: 1px;
  transition: all var(--transition);
}

.mobile-menu {
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  padding: 1rem;
  gap: 0.25rem;
}

.mobile-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  transition: all var(--transition);
}
.mobile-link:hover { color: var(--accent); background: var(--accent-glow); }

.slide-down-enter-active, .slide-down-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}
.slide-down-enter-from, .slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
.slide-down-enter-to, .slide-down-leave-from {
  max-height: 400px;
  opacity: 1;
}

@media (max-width: 768px) {
  .nav-links { display: none; }
  .mobile-menu-btn { display: flex; }
}
</style>
