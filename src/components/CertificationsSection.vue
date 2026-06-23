<template>
  <section id="certifications" class="section" style="background: var(--bg-secondary);">
    <div class="section-number">06</div>
    <div class="container">
      <div class="section-badge reveal">🎓 Certifications</div>
      <h2 class="section-title reveal">Credentials & Achievements</h2>
      <p class="section-subtitle reveal">Verified certifications from leading technology organizations</p>

      <div class="certs-grid">
        <div
          v-for="(cert, i) in certifications"
          :key="cert.id"
          class="card cert-card reveal"
          :style="{ animationDelay: `${i * 0.12}s` }"
        >
          <div class="cert-header">
            <div class="cert-icon">🏆</div>
            <div v-if="cert.verified" class="verified-badge">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              Verified
            </div>
          </div>
          <h3 class="cert-name">{{ cert.name }}</h3>
          <div class="cert-issuer">{{ cert.issuer }}</div>
          <p class="cert-desc">{{ cert.description }}</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import type { Certification } from '@/types'
defineProps<{ certifications: Certification[] }>()
</script>

<style scoped>
.certs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.cert-card { padding: 2rem; }

.cert-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.cert-icon { font-size: 2rem; }

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(16, 185, 129, 0.1);
  color: var(--success);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: 50px;
  padding: 0.25rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 700;
}

.cert-name { font-size: 1rem; font-weight: 700; margin: 0 0 0.3rem; }
.cert-issuer { color: var(--accent); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.75rem; }
.cert-desc { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; margin: 0; }
</style>
