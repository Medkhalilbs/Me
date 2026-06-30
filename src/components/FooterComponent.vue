<template>
  <footer class="footer">
    <!-- Thin navy line divider above footer -->
    <div class="footer-top-divider"></div>

    <div class="container footer-inner">
      <div class="footer-top-row">
        <!-- Logo and tagline -->
        <div class="footer-brand">
          <span class="logo-text">
            {{ logoInitials.first }}<span class="bs-accent">{{ logoInitials.second }}</span>
          </span>
          <span class="footer-tagline">{{ profile?.hero_badge || profile?.title }}</span>
        </div>

        <!-- Quick Links -->
        <div class="footer-nav">
          <a v-for="link in navLinks" :key="link.href" :href="link.href" class="footer-nav-link">
            {{ link.label }}
          </a>
        </div>

        <!-- Social Icons -->
        <div class="footer-social-links">
          <a v-if="profile?.github_url" :href="profile.github_url" target="_blank" rel="noopener" class="social-icon-btn" aria-label="GitHub">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          </a>
          <a v-if="profile?.linkedin_url" :href="profile.linkedin_url" target="_blank" rel="noopener" class="social-icon-btn" aria-label="LinkedIn">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
          </a>
          <a v-if="profile?.email" :href="`mailto:${profile.email}`" class="social-icon-btn" aria-label="Email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          </a>
        </div>
      </div>

      <!-- Bottom Copyright line -->
      <div class="footer-bottom-row">
        <span class="copyright-text">
          &copy; {{ new Date().getFullYear() }} <span v-if="profile?.name"> {{ profile.name }}</span>
        </span>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'

const store = usePortfolioStore()
const profile = computed(() => store.profile)

const logoInitials = computed(() => {
  const name = profile.value?.name || ''
  const parts = name.trim().split(/\s+/)
  if (parts.length >= 4) {
    return { first: (parts[0]?.[0] || '') + (parts[1]?.[0] || ''), second: (parts[2]?.[0] || '') + (parts[3]?.[0] || '') }
  } else if (parts.length === 3) {
    return { first: (parts[0]?.[0] || '') + (parts[1]?.[0] || ''), second: parts[2]?.[0] || '' }
  } else if (parts.length === 2) {
    return { first: parts[0]?.[0] || '', second: parts[1]?.[0] || '' }
  }
  return { first: 'MK', second: 'BS' }
})

const navLinks = [
  { href: '#hero',       label: 'Home' },
  { href: '#about',      label: 'About' },
  { href: '#skills',     label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects',   label: 'Projects' },
  { href: '#contact',    label: 'Contact' },
]
</script>

<style scoped>
.footer {
  background: var(--bg-primary);
  padding: 1.5rem 0 3rem;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* Thin navy line above footer content */
.footer-top-divider {
  width: 100%;
  height: 1px;
  background: var(--border);
  opacity: 0.3;
  margin-bottom: 2.5rem;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
}

.footer-top-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 2rem;
}

.footer-brand {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.25rem;
}

.logo-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.45rem;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.01em;
}

.bs-accent {
  color: var(--accent-navy);
}

.footer-tagline {
  font-family: var(--font-mono);
  color: var(--text-muted);
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* Nav links */
.footer-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.25rem;
}

.footer-nav-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.88rem;
  font-weight: 500;
  transition: color var(--transition);
}

.footer-nav-link:hover {
  color: var(--accent-navy);
}

/* Social Buttons */
.footer-social-links {
  display: flex;
  gap: 0.75rem;
}

.social-icon-btn {
  width: 38px;
  height: 38px;
  border-radius: var(--radius-sm);
  background: var(--bg-card);
  border: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-secondary);
  transition: all var(--transition);
}

.social-icon-btn:hover {
  border-color: var(--accent-navy);
  color: var(--accent-navy);
  background: var(--accent-navy-subtle);
  transform: translateY(-2px);
}

/* Copyright Row */
.footer-bottom-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.copyright-text {
  font-family: var(--font-mono);
  font-size: 0.75rem;
  color: var(--text-muted);
  text-align: center;
}

@media (max-width: 768px) {
  .footer-top-row {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }
  .footer-brand {
    align-items: center;
  }
  .footer-nav {
    justify-content: center;
  }
}
</style>
