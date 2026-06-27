<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">📄 CVs / Resumes</h2>
        <p class="panel-sub">Upload your CVs in different languages (PDF) and select the default version for download.</p>
      </div>
      <button @click="showUploadForm = true" class="btn btn-primary">+ Upload New CV</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="loadCVs" class="btn-text">Dismiss</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading CV versions…</div>

    <!-- Main Content -->
    <div v-else class="cvs-list">
      <div v-for="cv in cvs" :key="cv.id" class="card cv-card" :class="{ 'default-cv': cv.is_default }">
        <div class="cv-info">
          <div class="cv-lang-badge">{{ cv.language }}</div>
          <div>
            <h4 class="cv-filename">{{ cv.filename }}</h4>
            <span class="cv-date">Uploaded: {{ formatDate(cv.uploaded_at) }}</span>
          </div>
        </div>

        <div class="cv-actions">
          <span v-if="cv.is_default" class="badge-default-active">🌟 Default</span>
          <button v-else @click="setDefault(cv.id)" class="btn btn-outline btn-sm">Set Default</button>
          <a :href="`/api/cvs/download/${cv.id}`" target="_blank" class="btn btn-outline btn-sm">⬇️ Download</a>
          <button @click="deleteCV(cv.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
        </div>
      </div>

      <div v-if="cvs.length === 0" class="empty-state">
        No CVs uploaded yet. Click "+ Upload New CV" to upload a PDF version.
      </div>
    </div>

    <!-- Upload Modal -->
    <div v-if="showUploadForm" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">Upload New CV</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">Language Code (e.g. EN, FR)</label>
            <input v-model="form.language" class="form-input" required placeholder="EN" />
          </div>

          <div class="form-group">
            <label class="form-label">Select PDF File</label>
            <input type="file" @change="onFileChange" accept="application/pdf" class="form-input" required />
          </div>

          <div class="form-group check-group">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_default" /> Set as default CV
            </label>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="uploading">
              {{ uploading ? 'Uploading…' : 'Upload CV' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'
import type { CV } from '@/types'

const cvs = ref<CV[]>([])
const loading = ref(true)
const uploading = ref(false)
const error = ref('')

const showUploadForm = ref(false)
const selectedFile = ref<File | null>(null)

const form = reactive({
  language: '',
  is_default: false,
})

async function loadCVs() {
  loading.value = true
  try {
    const res = await api.get('/cvs')
    cvs.value = res.data
  } catch (e: any) {
    error.value = 'Failed to load CVs list.'
  } finally {
    loading.value = false
  }
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]
  }
}

function closeForm() {
  showUploadForm.value = false
  selectedFile.value = null
  form.language = ''
  form.is_default = false
}

async function submitForm() {
  if (!selectedFile.value) {
    error.value = 'Please select a file to upload'
    return
  }

  uploading.value = true
  error.value = ''

  const fd = new FormData()
  fd.append('cv', selectedFile.value)
  fd.append('language', form.language)
  fd.append('is_default', form.is_default ? '1' : '0')

  try {
    const token = localStorage.getItem('admin_token')
    const res = await fetch('/api/cvs', {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: fd,
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Upload failed. Check if file is PDF under 10MB.')
    }
    await loadCVs()
    closeForm()
  } catch (e: any) {
    error.value = e.message || 'Upload failed. Check if file is PDF under 10MB.'
  } finally {
    uploading.value = false
  }
}

async function setDefault(id: number) {
  loading.value = true
  try {
    await api.patch(`/cvs/${id}/default`)
    await loadCVs()
  } catch (e: any) {
    error.value = 'Failed to set default CV.'
  } finally {
    loading.value = false
  }
}

async function deleteCV(id: number) {
  if (confirm('Are you sure you want to delete this CV?')) {
    loading.value = true
    try {
      await api.delete(`/cvs/${id}`)
      await loadCVs()
    } catch (e: any) {
      error.value = 'Failed to delete CV.'
    } finally {
      loading.value = false
    }
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadCVs)
</script>

<style scoped>
.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.panel-sub {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0.25rem 0 0;
}

.cvs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cv-card {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.cv-card.default-cv {
  border-color: var(--border-hover);
}

.cv-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.cv-lang-badge {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: var(--accent-glow);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(59, 130, 246, 0.2);
}

.cv-filename {
  margin: 0 0 0.2rem;
  font-size: 1rem;
  font-weight: 700;
  max-width: 320px;
  word-break: break-all;
}

.cv-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cv-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.badge-default-active {
  font-size: 0.8rem;
  font-weight: 700;
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
  padding: 0.25rem 0.6rem;
  border-radius: 4px;
  border: 1px solid rgba(245, 158, 11, 0.2);
}

.btn-sm {
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
}

.btn.danger:hover {
  border-color: var(--danger);
  color: var(--danger);
  background: rgba(239, 68, 68, 0.1);
}

.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 4rem 2rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
}

/* Dialog */
.dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.dialog-card {
  width: 100%;
  max-width: 450px;
  animation: fadeInUp 0.3s ease;
}

.dialog-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.check-group {
  display: flex;
  align-items: center;
  margin-top: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-text {
  background: none;
  border: none;
  color: var(--accent);
  cursor: pointer;
  font-weight: 600;
}
</style>
