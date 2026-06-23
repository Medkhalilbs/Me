<template>
  <footer class="footer">
    <div class="container footer-inner">
      <div class="footer-logo">
        <span class="gradient-text">MKBS</span>
        <span class="footer-tagline">Full Stack Software Engineer</span>
      </div>

      <div class="footer-links">
        <a v-for="link in navLinks" :key="link.href" :href="link.href" class="footer-link">{{ link.label }}</a>
      </div>

      <div class="footer-social">
        <a :href="profile?.linkedin_url" target="_blank" rel="noopener" class="social-btn" title="LinkedIn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
        </a>
        <a :href="profile?.github_url" target="_blank" rel="noopener" class="social-btn" title="GitHub">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg>
        </a>
        <a :href="`mailto:${profile?.email}`" class="social-btn" title="Email">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
        </a>
      </div>

      <div class="footer-copy">
        © {{ new Date().getFullYear() }} Mohamed Khalil Ben Sedrine. Built with Vue 3 + Express.
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import type { Profile } from '@/types'
defineProps<{ profile: Profile | null }>()

const navLinks = [
  { href: '#about',      label: 'About' },
  { href: '#skills',     label: 'Skills' },
  { href: '#experience', label: 'Experience' },
  { href: '#projects',   label: 'Projects' },
  { href: '#contact',    label: 'Contact' },
]
</script>

<style scoped>
.footer {
  background: var(--bg-secondary);
  border-top: 1px solid var(--border);
  padding: 3rem 0 2rem;
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  text-align: center;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
}

.footer-logo .gradient-text {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  font-weight: 800;
}

.footer-tagline { color: var(--text-muted); font-size: 0.82rem; }

.footer-links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  justify-content: center;
}

.footer-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  transition: all var(--transition);
}
.footer-link:hover { color: var(--accent); background: var(--accent-glow); }

.footer-social { display: flex; gap: 0.75rem; }

.social-btn {
  width: 40px; height: 40px;
  display: flex; align-items: center; justify-content: center;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 50%;
  color: var(--text-secondary);
  text-decoration: none;
  transition: all var(--transition);
}

.social-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-glow);
  transform: translateY(-2px);
}

.footer-copy { color: var(--text-muted); font-size: 0.8rem; }
</style>
