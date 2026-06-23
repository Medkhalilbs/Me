<template>
  <div class="admin-panel">
    <h2 class="panel-title">👤 Profile</h2>
    <p class="panel-sub">Edit your public profile information shown on the portfolio.</p>

    <div v-if="loading" class="panel-loading">Loading…</div>
    <form v-else @submit.prevent="save" class="profile-form">
      <div class="form-section">
        <h3 class="form-section-title">Basic Info</h3>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Full Name</label>
            <input v-model="form.name" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Title</label>
            <input v-model="form.title" class="form-input" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">Location</label>
            <input v-model="form.location" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">Email</label>
            <input v-model="form.email" class="form-input" type="email" />
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">LinkedIn URL</label>
            <input v-model="form.linkedin_url" class="form-input" />
          </div>
          <div class="form-group">
            <label class="form-label">GitHub URL</label>
            <input v-model="form.github_url" class="form-input" />
          </div>
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section-title">Hero Section</h3>
        <div class="form-group">
          <label class="form-label">Hero Heading</label>
          <input v-model="form.hero_heading" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Hero Subtitle</label>
          <textarea v-model="form.hero_subtitle" class="form-input" rows="3"></textarea>
        </div>
        <div class="form-group">
          <label class="form-label">Hero Badge Text</label>
          <input v-model="form.hero_badge" class="form-input" />
        </div>
      </div>

      <div class="form-section">
        <h3 class="form-section-title">About Paragraphs</h3>
        <div v-for="(para, i) in form.about_paragraphs" :key="i" class="form-group" style="position:relative">
          <label class="form-label">Paragraph {{ i + 1 }}</label>
          <textarea v-model="form.about_paragraphs[i]" class="form-input" rows="3"></textarea>
          <button type="button" class="remove-btn" @click="form.about_paragraphs.splice(i, 1)">✕</button>
        </div>
        <button type="button" class="btn btn-outline" @click="form.about_paragraphs.push('')" style="margin-top:0.5rem;">+ Add Paragraph</button>
      </div>

      <div class="form-section">
        <h3 class="form-section-title">Callout Box</h3>
        <div class="form-group">
          <label class="form-label">Title</label>
          <input v-model="form.callout_title" class="form-input" />
        </div>
        <div class="form-group">
          <label class="form-label">Text</label>
          <textarea v-model="form.callout_text" class="form-input" rows="3"></textarea>
        </div>
      </div>

      <div class="panel-actions">
        <button type="submit" class="btn btn-primary" :disabled="saving">
          {{ saving ? 'Saving…' : '💾 Save Changes' }}
        </button>
        <span v-if="saved" class="saved-msg">✅ Saved!</span>
        <span v-if="error" class="error-msg">❌ {{ error }}</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const loading = ref(true)
const saving = ref(false)
const saved = ref(false)
const error = ref('')

const form = reactive({
  name: '', title: '', location: '', email: '', phone: '',
  linkedin_url: '', github_url: '',
  hero_heading: '', hero_subtitle: '', hero_badge: '',
  about_paragraphs: [] as string[],
  callout_title: '', callout_text: '',
})

onMounted(async () => {
  try {
    const res = await api.get('/profile/admin')
    Object.assign(form, res.data)
    if (!Array.isArray(form.about_paragraphs)) form.about_paragraphs = []
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  saved.value = false
  error.value = ''
  try {
    await api.patch('/profile', { ...form })
    saved.value = true
    setTimeout(() => { saved.value = false }, 3000)
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Save failed'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.admin-panel { max-width: 800px; }
.panel-title { font-size: 1.5rem; font-weight: 700; margin: 0 0 0.25rem; }
.panel-sub { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 2rem; }
.panel-loading { color: var(--text-muted); padding: 2rem; }

.form-section { margin-bottom: 2rem; }
.form-section-title {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--accent);
  font-weight: 700;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.form-group { margin-bottom: 1rem; position: relative; }

.remove-btn {
  position: absolute;
  top: 0.25rem; right: 0;
  background: none; border: none;
  color: var(--danger); cursor: pointer;
  font-size: 0.9rem; padding: 0.2rem 0.4rem;
}

.panel-actions { display: flex; align-items: center; gap: 1rem; margin-top: 1.5rem; }
.saved-msg { color: var(--success); font-size: 0.88rem; }
.error-msg { color: var(--danger); font-size: 0.88rem; }
</style>
