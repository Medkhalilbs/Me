<template>
  <section id="certifications" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">{{ meta.badge || '// 07 — CERTIFICATIONS' }}</div>
      <h2 class="section-title reveal">{{ meta.title || 'Credentials & Achievements' }}</h2>
      <p class="section-subtitle reveal">{{ meta.subtitle || 'Verified cloud computing and enterprise consulting qualifications' }}</p>

      <div class="cert-card-wrapper reveal">
        <!-- Render the single primary certification -->
        <div
          v-for="cert in certifications"
          :key="cert.id"
          class="card cert-digital-card"
        >
          <!-- Certificate Header -->
          <div class="cert-top">
            <div class="aws-logo-area">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-bronze)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
                <path d="M12 10v4"/>
                <path d="m14 12-2 2-2-2"/>
              </svg>
            </div>
            
            <div v-if="cert.verified === 1" class="verified-badge">
              <span class="lock-icon">🔒</span> Verified Credential
            </div>
          </div>

          <!-- Certificate Content -->
          <div class="cert-body">
            <span class="cert-code-label">Credential ID: {{ cert.id }}</span>
            <h3 class="cert-title-name">{{ cert.name }}</h3>
            <div class="cert-authority">{{ cert.issuer }}</div>
            <p class="cert-explanation">{{ cert.description }}</p>
          </div>

          <!-- Certificate Footer -->
          <div class="cert-footer">
            <div class="cert-signature-block">
              <span class="sig-label">ISSUING ORGANIZATION</span>
              <span class="sig-value">{{ cert.issuer }}</span>
            </div>
            <div class="cert-status-block" :class="cert.status || 'active'">
              <span class="status-indicator-dot"></span> {{ formatStatus(cert.status) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { usePortfolioStore } from '@/stores/portfolioStore'

const store = usePortfolioStore()
const certifications = computed(() => store.certifications)
const meta = computed(() => store.getSectionMeta('certifications'))


function formatStatus(status?: string) {
  if (!status) return 'Active'
  if (status === 'in-progress') return 'In Progress'
  return status.charAt(0).toUpperCase() + status.slice(1)
}
</script>

<style scoped>
.cert-card-wrapper {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  justify-content: center;
  align-items: start;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.cert-digital-card {
  width: 100%;
  max-width: 550px;
  background: var(--bg-card);
  border: 1px solid var(--accent-navy) !important;
  border-radius: var(--radius-lg);
  padding: 2.25rem;
  box-shadow: var(--shadow-navy) !important;
  transition: all var(--transition);
  position: relative;
}

.cert-digital-card::after {
  background: var(--accent-navy) !important;
}

.cert-digital-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0 40px rgba(74, 125, 191, 0.10) !important;
}

/* Header Area */
.cert-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.75rem;
}

.aws-logo-area {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  background: rgba(74, 125, 191, 0.05);
  border: 1px solid rgba(74, 125, 191, 0.2);
  border-radius: 8px;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--accent-navy);
  background: var(--accent-navy-subtle);
  border: 1px solid rgba(74, 125, 191, 0.25);
  padding: 0.3rem 0.85rem;
  border-radius: 4px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lock-icon {
  font-size: 0.8rem;
}

/* Body Content */
.cert-body {
  margin-bottom: 2rem;
}

.cert-code-label {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
}

.cert-title-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.4rem;
  letter-spacing: -0.01em;
}

.cert-authority {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--accent-navy);
  margin-bottom: 1rem;
}

.cert-explanation {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* Footer Section */
.cert-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  border-top: 1px solid var(--border);
  padding-top: 1.25rem;
}

.cert-signature-block {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.sig-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  color: var(--text-muted);
  letter-spacing: 0.05em;
}

.sig-value {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary);
}

.cert-status-block {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-family: var(--font-mono);
  font-size: 0.75rem;
  font-weight: 600;
}

.cert-status-block.active {
  color: var(--success);
}
.cert-status-block.active .status-indicator-dot {
  background-color: var(--success);
  box-shadow: 0 0 6px var(--success);
}

.cert-status-block.expired, .cert-status-block.retired {
  color: var(--danger);
}
.cert-status-block.expired .status-indicator-dot, .cert-status-block.retired .status-indicator-dot {
  background-color: var(--danger);
  box-shadow: 0 0 6px var(--danger);
}

.cert-status-block.in-progress {
  color: var(--warning);
}
.cert-status-block.in-progress .status-indicator-dot {
  background-color: var(--warning);
  box-shadow: 0 0 6px var(--warning);
}

.status-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
</style>
