<template>
  <section id="contact" class="section">
    <div class="section-number"></div>
    <div class="container">
      <div class="section-badge reveal">// 09 — CONTACT</div>
      <h2 class="section-title reveal">Get In Touch</h2>
      <p class="section-subtitle reveal">Available for remote contracts, IT consulting, and full-stack positions</p>

      <div class="contact-grid">
        <!-- Technical details and links -->
        <div class="contact-info reveal">
          <h3 class="info-title">System Connect</h3>
          <p class="info-text">
            Have a project requirement or looking to hire a full-stack developer who understands both embedded silicon and cloud orchestration? Send me a line.
          </p>

          <div class="contact-links">
            <a :href="`mailto:${profile?.email}`" class="contact-link navy-hover">
              <div class="contact-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
              </div>
              <div>
                <div class="contact-link-label">Email</div>
                <div class="contact-link-value">{{ profile?.email || 'medkhalilbs@gmail.com' }}</div>
              </div>
            </a>
            <a :href="profile?.linkedin_url || 'https://linkedin.com/in/mk-bs'" target="_blank" rel="noopener" class="contact-link navy-hover">
              <div class="contact-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
              </div>
              <div>
                <div class="contact-link-label">LinkedIn</div>
                <div class="contact-link-value">linkedin.com/in/mk-bs</div>
              </div>
            </a>
            <a :href="profile?.github_url || 'https://github.com/Medkhalilbs'" target="_blank" rel="noopener" class="contact-link navy-hover">
              <div class="contact-link-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </div>
              <div>
                <div class="contact-link-label">GitHub</div>
                <div class="contact-link-value">github.com/Medkhalilbs</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Form Card -->
        <div class="card contact-form-card reveal">
          <form @submit.prevent="submit">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input v-model="form.name" class="form-input" placeholder="> enter name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input v-model="form.email" class="form-input" type="email" placeholder="> enter email" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Subject</label>
              <input v-model="form.subject" class="form-input" placeholder="> enter subject" required />
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea v-model="form.message" class="form-input" rows="5" placeholder="> enter message details..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
              <span v-if="loading">Sending Command…</span>
              <span v-else>Send Message // submit</span>
            </button>
            <p v-if="successMsg" class="form-success">{{ successMsg }}</p>
            <p v-if="errorMsg" class="form-error">{{ errorMsg }}</p>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import api from '@/api'
import type { Profile } from '@/types'

defineProps<{ profile: Profile | null }>()

const form = reactive({ name: '', email: '', subject: '', message: '' })
const loading = ref(false)
const successMsg = ref('')
const errorMsg = ref('')

async function submit() {
  loading.value = true
  successMsg.value = ''
  errorMsg.value = ''

  const payload = { ...form }

  try {
    await api.post('/contact', payload)
    successMsg.value = '✅ Message sent successfully!'
    form.name = ''; form.email = ''; form.subject = ''; form.message = ''
  } catch (e: any) {
    console.warn('API error, backing up message in local storage:', e)
    try {
      // Save locally
      const offlineMessages = JSON.parse(localStorage.getItem('contact_messages') || '[]')
      offlineMessages.push({
        ...payload,
        received_at: new Date().toISOString(),
        id: Date.now()
      })
      localStorage.setItem('contact_messages', JSON.stringify(offlineMessages))
      successMsg.value = '✅ Message queued locally! (offline storage backup saved)'
      form.name = ''; form.email = ''; form.subject = ''; form.message = ''
    } catch (err) {
      errorMsg.value = 'Error submitting message. Please check connection.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 4rem;
  align-items: start;
  position: relative;
  z-index: 1;
}

.info-title {
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
}

.info-text {
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.75;
  margin-bottom: 2rem;
}

.contact-links {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.contact-link {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  text-decoration: none;
  padding: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--transition);
}

.contact-link-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--text-secondary);
  transition: all var(--transition);
}

.contact-link-label {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  margin-bottom: 0.15rem;
}

.contact-link-value {
  font-size: 0.9rem;
  color: var(--text-primary);
  font-weight: 500;
  transition: color var(--transition);
}

/* Hover Accent — unified navy */
.contact-link.navy-hover:hover {
  border-color: rgba(74, 125, 191, 0.4);
  background: var(--accent-navy-subtle);
  transform: translateX(4px);
}
.contact-link.navy-hover:hover .contact-link-icon {
  border-color: rgba(74, 125, 191, 0.4);
  color: var(--accent-navy);
}
.contact-link.navy-hover:hover .contact-link-value {
  color: var(--accent-navy);
}

.contact-form-card {
  padding: 2.25rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-success {
  color: var(--success);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  margin-top: 1rem;
  text-align: center;
}

.form-error {
  color: var(--danger);
  font-family: var(--font-mono);
  font-size: 0.8rem;
  margin-top: 1rem;
  text-align: center;
}

@media (max-width: 900px) {
  .contact-grid {
    grid-template-columns: 1fr;
    gap: 2.5rem;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
