<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">💼 Experience</h2>
        <p class="panel-sub">Manage your professional journey, roles, responsibilities, and technologies used.</p>
      </div>
      <button @click="openCreateForm" class="btn btn-primary">+ Add Experience</button>
    </div>

    <!-- Error state -->
    <div v-if="error || fetchError" class="error-banner">
      <span>❌ {{ error || fetchError }}</span>
      <button @click="loadExperiences" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading experiences…</div>

    <!-- Main Content -->
    <div v-else class="experiences-list">
      <div v-for="exp in experiences" :key="exp.id" class="card experience-card">
        <div class="exp-header">
          <div class="exp-title-group">
            <h4 class="exp-role">{{ exp.role }}</h4>
            <span class="exp-company">{{ exp.company }} <span v-if="exp.client">({{ exp.client }})</span></span>
          </div>
          <div class="exp-meta">
            <span class="exp-dates">{{ exp.start_date }} – {{ exp.is_current ? 'Present' : exp.end_date }}</span>
            <span class="exp-location">📍 {{ exp.location }}</span>
          </div>
        </div>

        <!-- Responsibilities Preview -->
        <div class="exp-section">
          <div class="section-label">Responsibilities Highlights</div>
          <ul class="resp-list">
            <li v-for="resp in exp.responsibilities" :key="resp.id">{{ resp.text }}</li>
          </ul>
        </div>

        <!-- Tech Stack Tags -->
        <div class="exp-section">
          <div class="section-label">Tech Stack</div>
          <div class="tags-group">
            <span v-for="t in exp.tech" :key="t" class="tech-tag">{{ t }}</span>
          </div>
        </div>

        <div class="card-footer">
          <span class="sort-order">Order: {{ exp.sort_order }}</span>
          <div class="card-actions">
            <button @click="editExperience(exp)" class="btn btn-outline btn-sm">✏️ Edit</button>
            <button @click="deleteExperience(exp.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div v-if="experiences.length === 0" class="empty-state">
        No experiences added yet. Click "+ Add Experience" to create one.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showForm" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card large-dialog">
        <h3 class="dialog-title">{{ editingId ? 'Edit Experience' : 'Add Experience' }}</h3>
        <form @submit.prevent="submitForm" class="dialog-form">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Company Name</label>
              <input v-model="form.company" class="form-input" required placeholder="Teamwill" />
            </div>
            <div class="form-group">
              <label class="form-label">Client / Project (Optional)</label>
              <input v-model="form.client" class="form-input" placeholder="Volkswagen Financial Services" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Role / Job Title</label>
            <input v-model="form.role" class="form-input" required placeholder="Software Engineer" />
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">Start Date</label>
              <input v-model="form.start_date" class="form-input" required placeholder="Jul 2023" />
            </div>
            <div class="form-group">
              <label class="form-label">End Date</label>
              <input v-model="form.end_date" class="form-input" :disabled="form.is_current" placeholder="Jun 2024" />
            </div>
            <div class="form-group current-checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.is_current" /> Is Current Role
              </label>
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Location</label>
              <input v-model="form.location" class="form-input" placeholder="Tunis, Tunisia" />
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" />
            </div>
          </div>

          <!-- Responsibilities Section -->
          <div class="form-group section-divider">
            <label class="form-label font-bold flex justify-between items-center">
              <span>Responsibilities List</span>
              <button type="button" @click="addResponsibilityInput" class="btn-text">+ Add Bullet</button>
            </label>
            <div v-for="(resp, i) in form.responsibilities" :key="i" class="list-input-row">
              <input v-model="form.responsibilities[i]" class="form-input" required placeholder="Developed enterprise financial software..." />
              <button type="button" @click="removeResponsibilityInput(i)" class="remove-btn">✕</button>
            </div>
            <div v-if="form.responsibilities.length === 0" class="no-bullets-msg">No responsibilities added. Click "+ Add Bullet" to add.</div>
          </div>

          <!-- Tech stack section -->
          <div class="form-group section-divider">
            <label class="form-label">Tech Stack (comma-separated, e.g. Java, Spring, React)</label>
            <input v-model="form.techInput" class="form-input" placeholder="Java, React.js, Docker" />
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Experience' }}
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
import type { Experience } from '@/types'

const experiences = ref<Experience[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const fetchError = ref('')

const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  company: '',
  role: '',
  client: '',
  start_date: '',
  end_date: '',
  location: '',
  is_current: false,
  sort_order: 0,
  responsibilities: [] as string[],
  techInput: '',
})

async function loadExperiences() {
  loading.value = true
  fetchError.value = ''
  try {
    const res = await api.get('/experiences')
    experiences.value = res.data
  } catch (e: any) {
    fetchError.value = 'Failed to load experiences.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingId.value = null
  form.company = ''
  form.role = ''
  form.client = ''
  form.start_date = ''
  form.end_date = ''
  form.location = ''
  form.is_current = false
  form.sort_order = experiences.value.length ? Math.max(...experiences.value.map(e => e.sort_order)) + 10 : 10
  form.responsibilities = ['']
  form.techInput = ''
  showForm.value = true
}

function editExperience(exp: Experience) {
  editingId.value = exp.id
  form.company = exp.company
  form.role = exp.role
  form.client = exp.client
  form.start_date = exp.start_date
  form.end_date = exp.end_date
  form.location = exp.location
  form.is_current = exp.is_current === 1
  form.sort_order = exp.sort_order
  form.responsibilities = exp.responsibilities.map(r => r.text)
  form.techInput = exp.tech.join(', ')
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
}

function addResponsibilityInput() {
  form.responsibilities.push('')
}

function removeResponsibilityInput(index: number) {
  form.responsibilities.splice(index, 1)
}

async function submitForm() {
  saving.value = true
  error.value = ''

  const techArray = form.techInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)

  const payload = {
    company: form.company,
    role: form.role,
    client: form.client,
    start_date: form.start_date,
    end_date: form.is_current ? '' : form.end_date,
    location: form.location,
    is_current: form.is_current ? 1 : 0,
    sort_order: form.sort_order,
    responsibilities: form.responsibilities.filter(r => r.trim().length > 0),
    tech: techArray,
  }

  try {
    if (editingId.value) {
      await api.patch(`/experiences/${editingId.value}`, payload)
    } else {
      await api.post('/experiences', payload)
    }
    await loadExperiences()
    closeForm()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Save experience failed'
  } finally {
    saving.value = false
  }
}

async function deleteExperience(id: number) {
  if (confirm('Are you sure you want to delete this experience entry?')) {
    loading.value = true
    try {
      await api.delete(`/experiences/${id}`)
      await loadExperiences()
    } catch (e: any) {
      error.value = 'Failed to delete experience.'
    } finally {
      loading.value = false
    }
  }
}

onMounted(loadExperiences)
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

.experiences-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.experience-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
}

.exp-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
}

.exp-role {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.exp-company {
  font-size: 0.95rem;
  color: var(--accent);
  font-weight: 600;
  display: block;
  margin-top: 0.2rem;
}

.exp-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  font-size: 0.88rem;
}

.exp-dates {
  font-weight: 600;
}

.exp-location {
  color: var(--text-secondary);
}

.exp-section {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  font-weight: 600;
}

.resp-list {
  margin: 0;
  padding-left: 1.25rem;
  font-size: 0.92rem;
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.tags-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
}

.card-footer {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
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

/* Dialog Forms */
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

.dialog-card.large-dialog {
  max-width: 700px;
  max-height: calc(100vh - 3rem);
  overflow-y: auto;
}

.dialog-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.dialog-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

.current-checkbox-group {
  display: flex;
  align-items: flex-end;
  padding-bottom: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
}

.section-divider {
  border-top: 1px solid var(--border);
  padding-top: 1rem;
  margin-top: 0.5rem;
}

.list-input-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  position: relative;
}

.remove-btn {
  background: none;
  border: none;
  color: var(--danger);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
}

.no-bullets-msg {
  font-size: 0.85rem;
  color: var(--text-muted);
  font-style: italic;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 1.5rem;
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
  font-size: 0.88rem;
}
</style>
