<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">🗣️ Languages</h2>
        <p class="panel-sub">Manage the languages you speak and your proficiency levels.</p>
      </div>
      <button @click="openCreateForm" class="btn btn-primary">+ Add Language</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading languages…</div>

    <!-- Main Content -->
    <div v-else class="languages-list">
      <div v-for="lang in items" :key="lang.id" class="card lang-card-admin">
        <div class="lang-info">
          <div class="lang-header-row">
            <span class="lang-code-badge">{{ lang.code }}</span>
            <span v-if="lang.is_visible === 0" class="status-badge hidden-badge">👁️ Hidden</span>
          </div>
          <h4 class="lang-title">{{ lang.name }}</h4>
          <span class="proficiency-badge-text" :class="lang.proficiency">
            {{ formatProficiency(lang.proficiency) }}
          </span>
        </div>

        <div class="card-footer">
          <span class="sort-order">Order: {{ lang.sort_order }}</span>
          <div class="card-actions">
            <button @click="editLang(lang)" class="btn btn-outline btn-sm">✏️ Edit</button>
            <button @click="deleteLang(lang.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        No languages added yet. Click "+ Add Language" to create one.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showForm" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingId ? 'Edit Language' : 'Add Language' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Language Name</label>
              <input v-model="form.name" class="form-input" required placeholder="English" />
            </div>
            <div class="form-group">
              <label class="form-label">Language Code (2 letters)</label>
              <input v-model="form.code" class="form-input" required placeholder="EN" maxlength="3" />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Proficiency</label>
              <select v-model="form.proficiency" class="form-input select-input" style="background-color: var(--bg-secondary);">
                <option value="native">Native Speaker</option>
                <option value="fluent">Fluent</option>
                <option value="professional">Professional Working</option>
                <option value="intermediate">Intermediate</option>
                <option value="basic">Elementary</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" />
            </div>
          </div>

          <div class="form-group check-group" style="margin-top: 0.5rem;">
            <label class="checkbox-label">
              <input type="checkbox" v-model="form.is_visible" /> Show on public portfolio
            </label>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Language' }}
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
import type { Language } from '@/types'

const { items, loading, saving, error, load, create, update, remove } = useAdminCrud<Language>('/languages')

const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = reactive({
  name: '',
  code: '',
  proficiency: 'professional',
  sort_order: 0,
  is_visible: true,
})

function openCreateForm() {
  editingId.value = null
  form.name = ''
  form.code = ''
  form.proficiency = 'professional'
  form.sort_order = items.value.length ? Math.max(...items.value.map(l => l.sort_order)) + 10 : 10
  form.is_visible = true
  showForm.value = true
}

function editLang(lang: Language) {
  editingId.value = lang.id
  form.name = lang.name
  form.code = lang.code
  form.proficiency = lang.proficiency
  form.sort_order = lang.sort_order
  form.is_visible = lang.is_visible === 1
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
}

async function submitForm() {
  const payload = {
    name: form.name,
    code: form.code,
    proficiency: form.proficiency,
    sort_order: form.sort_order,
    is_visible: form.is_visible ? 1 : 0,
  }

  if (editingId.value) {
    await update(editingId.value, payload as any)
  } else {
    await create(payload as any)
  }

  if (!error.value) {
    closeForm()
  }
}

async function deleteLang(id: number) {
  if (confirm('Are you sure you want to delete this language?')) {
    await remove(id)
  }
}

function formatProficiency(prof: string): string {
  switch (prof) {
    case 'native': return 'Native Speaker'
    case 'fluent': return 'Fluent'
    case 'professional': return 'Professional Working'
    case 'intermediate': return 'Intermediate'
    case 'basic': return 'Elementary'
    default: return prof.charAt(0).toUpperCase() + prof.slice(1)
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

.languages-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.lang-card-admin {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.25rem;
}

.lang-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.lang-code-badge {
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  background: var(--accent-glow);
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
}

.hidden-badge {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.lang-title {
  margin: 0 0 0.35rem;
  font-size: 1.2rem;
  font-weight: 700;
}

.proficiency-badge-text {
  font-size: 0.8rem;
  font-weight: 600;
}

.proficiency-badge-text.native { color: var(--success); }
.proficiency-badge-text.fluent { color: var(--accent); }
.proficiency-badge-text.professional { color: var(--accent); }
.proficiency-badge-text.intermediate { color: var(--warning); }
.proficiency-badge-text.basic { color: var(--text-muted); }

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
  grid-column: 1 / -1;
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

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}

.check-group {
  display: flex;
  align-items: center;
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
