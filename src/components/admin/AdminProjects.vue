<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">🚀 Projects</h2>
        <p class="panel-sub">Manage your portfolio projects, case studies, problems/solutions, and repositories.</p>
      </div>
      <button @click="openCreateForm" class="btn btn-primary">+ Add Project</button>
    </div>

    <!-- Error state -->
    <div v-if="error || fetchError" class="error-banner">
      <span>❌ {{ error || fetchError }}</span>
      <button @click="loadProjects" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading projects…</div>

    <!-- Main Content -->
    <div v-else class="projects-list">
      <div v-for="proj in projects" :key="proj.id" class="card project-card">
        <div class="proj-main-info">
          <div class="proj-header">
            <div>
              <span class="category-badge">{{ proj.category }}</span>
              <h4 class="proj-title">{{ proj.title }}</h4>
            </div>
            <span class="status-badge" :class="proj.status">{{ proj.status }}</span>
          </div>

          <p class="proj-description">{{ proj.description }}</p>

          <div v-if="proj.problem || proj.solution" class="proj-case-study">
            <div v-if="proj.problem" class="case-meta">
              <strong>Problem:</strong> {{ proj.problem }}
            </div>
            <div v-if="proj.solution" class="case-meta">
              <strong>Solution:</strong> {{ proj.solution }}
            </div>
          </div>

          <div class="proj-tech-row">
            <span v-for="t in proj.tech" :key="t" class="tech-tag">{{ t }}</span>
          </div>
        </div>

        <div class="card-footer">
          <div class="proj-links">
            <a v-if="proj.github_url" :href="proj.github_url" target="_blank" class="proj-link">💻 GitHub</a>
            <a v-if="proj.demo_url" :href="proj.demo_url" target="_blank" class="proj-link">🔗 Demo</a>
            <span class="sort-order">Order: {{ proj.sort_order }}</span>
          </div>

          <div class="card-actions">
            <button @click="editProject(proj)" class="btn btn-outline btn-sm">✏️ Edit</button>
            <button @click="deleteProject(proj.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div v-if="projects.length === 0" class="empty-state">
        No projects added yet. Click "+ Add Project" to create one.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showForm" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card large-dialog">
        <h3 class="dialog-title">{{ editingId ? 'Edit Project' : 'Add Project' }}</h3>
        <form @submit.prevent="submitForm" class="dialog-form">
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Project Title</label>
              <input v-model="form.title" class="form-input" required placeholder="Volkswagen POS Upgrade" />
            </div>
            <div class="form-group">
              <label class="form-label">Category</label>
              <select v-model="form.category" class="form-input select-input">
                <option value="mobile">Mobile</option>
                <option value="web">Web</option>
                <option value="security">Security</option>
                <option value="automation">Automation</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Short Description</label>
            <textarea v-model="form.description" class="form-input" rows="2" placeholder="Brief project summary..."></textarea>
          </div>

          <!-- Problem & Solution -->
          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">The Problem</label>
              <textarea v-model="form.problem" class="form-input" rows="3" placeholder="What pain point did this solve?"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">The Solution</label>
              <textarea v-model="form.solution" class="form-input" rows="3" placeholder="How did you implement it?"></textarea>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Business Impact / Results</label>
            <textarea v-model="form.business_impact" class="form-input" rows="2" placeholder="e.g. Saved 40% processing time..."></textarea>
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-input select-input">
                <option value="completed">Completed</option>
                <option value="in-progress">In Progress</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Hero Image URL/Path</label>
              <input v-model="form.hero_image_path" class="form-input" placeholder="/src/assets/images/project.jpg" />
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">GitHub URL</label>
              <input v-model="form.github_url" class="form-input" placeholder="https://github.com/..." />
            </div>
            <div class="form-group">
              <label class="form-label">Demo URL</label>
              <input v-model="form.demo_url" class="form-input" placeholder="https://demo.com/..." />
            </div>
          </div>

          <!-- Project Image Upload (only for existing projects) -->
          <div v-if="editingId" class="form-group section-divider">
            <label class="form-label">Project Cover Image</label>
            <div class="project-image-upload-wrapper">
              <div v-if="form.hero_image_path" class="current-project-image-preview">
                <img :src="form.hero_image_path" alt="Project Cover Preview" class="admin-project-img" />
                <button type="button" @click="deleteProjectImage" class="btn btn-outline btn-sm danger">🗑️ Delete Image</button>
              </div>
              <div v-else class="upload-placeholder">
                <input type="file" @change="handleProjectImageUpload" accept="image/*" class="file-input" id="project-upload" style="display:none" />
                <label for="project-upload" class="btn btn-outline btn-sm">📷 Upload Cover Photo</label>
                <span class="upload-hint">JPEG, PNG, WebP or AVIF (max 5MB)</span>
              </div>
              <div v-if="uploadingImage" class="uploading-spinner">Processing...</div>
            </div>
          </div>

          <!-- Key Features Section -->
          <div class="form-group section-divider">
            <label class="form-label font-bold flex justify-between items-center">
              <span>Key Features</span>
              <button type="button" @click="addFeatureInput" class="btn-text">+ Add Feature</button>
            </label>
            <div v-for="(feat, i) in form.features" :key="i" class="list-input-row">
              <input v-model="form.features[i]" class="form-input" required placeholder="Point of Sale (POS) system..." />
              <button type="button" @click="removeFeatureInput(i)" class="remove-btn">✕</button>
            </div>
            <div v-if="form.features.length === 0" class="no-bullets-msg">No features added. Click "+ Add Feature" to add.</div>
          </div>

          <!-- Tech stack section -->
          <div class="form-group section-divider">
            <label class="form-label">Tech Stack (comma-separated, e.g. Java, React, SQL)</label>
            <input v-model="form.techInput" class="form-input" placeholder="Java, Spring Boot, React.js" />
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Project' }}
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
import type { Project } from '@/types'

const projects = ref<Project[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const fetchError = ref('')
const uploadingImage = ref(false)

const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  title: '',
  category: 'web',
  description: '',
  problem: '',
  solution: '',
  business_impact: '',
  status: 'completed',
  github_url: '',
  demo_url: '',
  hero_image_path: '',
  sort_order: 0,
  features: [] as string[],
  techInput: '',
})

async function loadProjects() {
  loading.value = true
  fetchError.value = ''
  try {
    const res = await api.get('/projects')
    projects.value = res.data
  } catch (e: any) {
    fetchError.value = 'Failed to load projects.'
  } finally {
    loading.value = false
  }
}

function openCreateForm() {
  editingId.value = null
  form.title = ''
  form.category = 'web'
  form.description = ''
  form.problem = ''
  form.solution = ''
  form.business_impact = ''
  form.status = 'completed'
  form.github_url = ''
  form.demo_url = ''
  form.hero_image_path = ''
  form.sort_order = projects.value.length ? Math.max(...projects.value.map(p => p.sort_order)) + 10 : 10
  form.features = ['']
  form.techInput = ''
  showForm.value = true
}

function editProject(proj: Project) {
  editingId.value = proj.id
  form.title = proj.title
  form.category = proj.category
  form.description = proj.description
  form.problem = proj.problem
  form.solution = proj.solution
  form.business_impact = proj.business_impact
  form.status = proj.status
  form.github_url = proj.github_url
  form.demo_url = proj.demo_url
  form.hero_image_path = proj.hero_image_path
  form.sort_order = proj.sort_order
  form.features = proj.features.map(f => f.text)
  form.techInput = proj.tech.join(', ')
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
}

function addFeatureInput() {
  form.features.push('')
}

function removeFeatureInput(index: number) {
  form.features.splice(index, 1)
}

async function submitForm() {
  saving.value = true
  error.value = ''

  const techArray = form.techInput
    .split(',')
    .map(t => t.trim())
    .filter(t => t.length > 0)

  const payload = {
    title: form.title,
    category: form.category,
    description: form.description,
    problem: form.problem,
    solution: form.solution,
    business_impact: form.business_impact,
    status: form.status,
    github_url: form.github_url,
    demo_url: form.demo_url,
    hero_image_path: form.hero_image_path,
    sort_order: form.sort_order,
    features: form.features.filter(f => f.trim().length > 0),
    tech: techArray,
  }

  try {
    if (editingId.value) {
      await api.patch(`/projects/${editingId.value}`, payload)
    } else {
      await api.post('/projects', payload)
    }
    await loadProjects()
    closeForm()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Save project failed'
  } finally {
    saving.value = false
  }
}

async function deleteProject(id: number) {
  if (confirm('Are you sure you want to delete this project?')) {
    loading.value = true
    try {
      await api.delete(`/projects/${id}`)
      await loadProjects()
    } catch (e: any) {
      error.value = 'Failed to delete project.'
    } finally {
      loading.value = false
    }
  }
}

async function handleProjectImageUpload(e: Event) {
  if (!editingId.value) return
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploadingImage.value = true
  error.value = ''
  
  const formData = new FormData()
  formData.append('image', file)

  try {
    const token = localStorage.getItem('admin_token')
    const res = await fetch(`/api/projects/${editingId.value}/upload-image`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
      credentials: 'include',
    })
    const data = await res.json()
    if (!res.ok) {
      throw new Error(data.error || 'Cover image upload failed')
    }
    form.hero_image_path = data.path
  } catch (err: any) {
    error.value = err.message || 'Cover image upload failed'
  } finally {
    uploadingImage.value = false
  }
}

async function deleteProjectImage() {
  if (!editingId.value) return
  if (!confirm('Are you sure you want to delete the cover image for this project?')) return
  
  uploadingImage.value = true
  error.value = ''

  try {
    await api.delete(`/projects/${editingId.value}/image`)
    form.hero_image_path = ''
  } catch (err: any) {
    error.value = 'Failed to delete cover image'
  } finally {
    uploadingImage.value = false
  }
}

onMounted(loadProjects)
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

.projects-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.75rem;
}

.proj-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.category-badge {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--accent);
  margin-bottom: 0.25rem;
}

.proj-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
}

.status-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.completed {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.status-badge.in-progress {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.proj-description {
  margin: 0;
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.proj-case-study {
  background: rgba(0, 0, 0, 0.15);
  border: 1px solid var(--border);
  padding: 1rem;
  border-radius: var(--radius);
  font-size: 0.88rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.case-meta {
  line-height: 1.5;
}

.proj-tech-row {
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
  flex-wrap: wrap;
  gap: 1rem;
}

.proj-links {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 0.88rem;
}

.proj-link {
  color: var(--text-secondary);
  text-decoration: none;
  font-weight: 600;
  transition: color var(--transition);
}

.proj-link:hover {
  color: var(--accent);
}

.sort-order {
  color: var(--text-muted);
  font-size: 0.8rem;
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

/* Dialog & Form */
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
  max-width: 750px;
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

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
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

.project-image-upload-wrapper {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 1.25rem;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-top: 0.5rem;
}

.current-project-image-preview {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.admin-project-img {
  width: 120px;
  height: 70px;
  border-radius: var(--radius-sm);
  object-fit: cover;
  border: 1px solid var(--border);
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.upload-hint {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.uploading-spinner {
  font-size: 0.88rem;
  color: var(--accent);
  font-weight: 600;
}
</style>
