<template>
  <section id="contact" class="section">
    <div class="container">
      <div class="section-badge reveal">📬 Contact</div>
      <h2 class="section-title reveal">Let's Work Together</h2>
      <p class="section-subtitle reveal">Open to remote roles, freelance projects, and international opportunities</p>

      <div class="contact-grid">
        <!-- Info -->
        <div class="contact-info reveal">
          <h3 class="info-title">Get in Touch</h3>
          <p class="info-text">Have a project in mind or want to discuss an opportunity? I'd love to hear from you. Let's build something great together.</p>

          <div class="contact-links">
            <a :href="`mailto:${profile?.email}`" class="contact-link">
              <div class="contact-link-icon">✉️</div>
              <div>
                <div class="contact-link-label">Email</div>
                <div class="contact-link-value">{{ profile?.email }}</div>
              </div>
            </a>
            <a :href="profile?.linkedin_url" target="_blank" rel="noopener" class="contact-link">
              <div class="contact-link-icon">💼</div>
              <div>
                <div class="contact-link-label">LinkedIn</div>
                <div class="contact-link-value">linkedin.com/in/mk-bs</div>
              </div>
            </a>
            <a :href="profile?.github_url" target="_blank" rel="noopener" class="contact-link">
              <div class="contact-link-icon">🐙</div>
              <div>
                <div class="contact-link-label">GitHub</div>
                <div class="contact-link-value">github.com/Medkhalilbs</div>
              </div>
            </a>
          </div>
        </div>

        <!-- Form -->
        <div class="card contact-form-card reveal">
          <form @submit.prevent="submit">
            <div class="form-row">
              <div class="form-group">
                <label class="form-label">Name</label>
                <input v-model="form.name" class="form-input" placeholder="Your name" required />
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input v-model="form.email" class="form-input" type="email" placeholder="your@email.com" required />
              </div>
            </div>
            <div class="form-group">
              <label class="form-label">Subject</label>
              <input v-model="form.subject" class="form-input" placeholder="Project inquiry, collaboration..." required />
            </div>
            <div class="form-group">
              <label class="form-label">Message</label>
              <textarea v-model="form.message" class="form-input" rows="5" placeholder="Tell me about your project..." required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width: 100%;" :disabled="loading">
              <span v-if="loading">Sending…</span>
              <span v-else>Send Message →</span>
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
  try {
    await api.post('/contact', { ...form })
    successMsg.value = '✅ Message sent! I\'ll get back to you soon.'
    form.name = ''; form.email = ''; form.subject = ''; form.message = ''
  } catch (e: any) {
    errorMsg.value = e.response?.data?.error || 'Failed to send message. Please try again.'
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
}

.info-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.75rem; }
.info-text { color: var(--text-secondary); line-height: 1.8; margin-bottom: 2rem; }

.contact-links { display: flex; flex-direction: column; gap: 1rem; }

.contact-link {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  padding: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  transition: all var(--transition);
}

.contact-link:hover {
  border-color: var(--accent);
  background: var(--accent-glow);
  transform: translateX(4px);
}

.contact-link-icon { font-size: 1.5rem; }
.contact-link-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; margin-bottom: 0.1rem; }
.contact-link-value { font-size: 0.88rem; color: var(--text-primary); font-weight: 500; }

.contact-form-card { padding: 2rem; }

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1.25rem; }

.form-success { color: var(--success); font-size: 0.88rem; margin-top: 0.75rem; text-align: center; }
.form-error { color: var(--danger); font-size: 0.88rem; margin-top: 0.75rem; text-align: center; }

@media (max-width: 900px) {
  .contact-grid { grid-template-columns: 1fr; gap: 2rem; }
  .form-row { grid-template-columns: 1fr; }
}
</style>
