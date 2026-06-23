<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">🎓 Education</h2>
        <p class="panel-sub">Manage your academic credentials and degrees.</p>
      </div>
      <button @click="showCreateForm = true" class="btn btn-primary">+ Add Education</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading education details…</div>

    <!-- Main Content -->
    <div v-else class="education-list">
      <div v-for="edu in items" :key="edu.id" class="card edu-card">
        <div class="edu-card-content">
          <div class="edu-header">
            <h4 class="edu-school">{{ edu.school }}</h4>
            <span class="edu-years">{{ edu.start_year }} – {{ edu.end_year }}</span>
          </div>
          <div class="edu-degree">{{ edu.degree }}</div>
          <p v-if="edu.description" class="edu-desc">{{ edu.description }}</p>
        </div>

        <div class="card-footer">
          <span class="sort-order">Order: {{ edu.sort_order }}</span>
          <div class="card-actions">
            <button @click="editEdu(edu)" class="btn btn-outline btn-sm">✏️ Edit</button>
            <button @click="deleteEdu(edu.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        No education details added yet. Click "+ Add Education" to create one.
      </div>
    </div>

    <!-- Dialog Modal -->
    <div v-if="showCreateForm || editingEduId" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingEduId ? 'Edit Education' : 'Add Education' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">School / Institution</label>
            <input v-model="form.school" class="form-input" required placeholder="ESPRIT" />
          </div>
          <div class="form-group">
            <label class="form-label">Degree / Field of Study</label>
            <input v-model="form.degree" class="form-input" required placeholder="Engineering Degree in Computer Science" />
          </div>

          <div class="form-grid-3">
            <div class="form-group">
              <label class="form-label">Start Year</label>
              <input v-model="form.start_year" class="form-input" placeholder="2012" />
            </div>
            <div class="form-group">
              <label class="form-label">End Year</label>
              <input v-model="form.end_year" class="form-input" placeholder="2017" />
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description / Achievements</label>
            <textarea v-model="form.description" class="form-input" rows="3" placeholder="Specialization, honors, relevant coursework..."></textarea>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Education' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAdminCrud } from '@/composables/useAdminCrud'
import type { Education } from '@/types'

const { items, loading, saving, error, load, create, update, remove } = useAdminCrud<Education>('/education')

const showCreateForm = ref(false)
const editingEduId = ref<number | null>(null)

const form = reactive({
  school: '',
  degree: '',
  start_year: '',
  end_year: '',
  description: '',
  sort_order: 0,
})

function resetForm() {
  form.school = ''
  form.degree = ''
  form.start_year = ''
  form.end_year = ''
  form.description = ''
  form.sort_order = items.value.length ? Math.max(...items.value.map(e => e.sort_order)) + 10 : 10
}

function editEdu(edu: Education) {
  editingEduId.value = edu.id
  form.school = edu.school
  form.degree = edu.degree
  form.start_year = edu.start_year
  form.end_year = edu.end_year
  form.description = edu.description
  form.sort_order = edu.sort_order
}

function closeForm() {
  showCreateForm.value = false
  editingEduId.value = null
  resetForm()
}

async function submitForm() {
  const payload = {
    school: form.school,
    degree: form.degree,
    start_year: form.start_year,
    end_year: form.end_year,
    description: form.description,
    sort_order: form.sort_order,
  }

  if (editingEduId.value) {
    await update(editingEduId.value, payload)
  } else {
    await create(payload)
  }

  if (!error.value) {
    closeForm()
  }
}

async function deleteEdu(id: number) {
  if (confirm('Are you sure you want to delete this education entry?')) {
    await remove(id)
  }
}
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

.education-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.edu-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.edu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.25rem;
}

.edu-school {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 700;
}

.edu-years {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--accent);
}

.edu-degree {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
}

.edu-desc {
  margin: 0;
  font-size: 0.9rem;
  color: var(--text-secondary);
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
  max-width: 500px;
  animation: fadeInUp 0.3s ease;
}

.dialog-title {
  margin-top: 0;
  margin-bottom: 1.5rem;
  font-size: 1.25rem;
}

.form-grid-3 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
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
