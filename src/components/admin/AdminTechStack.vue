<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">🛠️ Tech Stack Grid</h2>
        <p class="panel-sub">Manage the individual technology pills displayed in the Tech Stack section.</p>
      </div>
      <button @click="showCreateForm = true" class="btn btn-primary">+ Add Tech Item</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading tech stack items…</div>

    <!-- Main Content -->
    <div v-else class="tech-grid">
      <div v-for="tech in items" :key="tech.id" class="card tech-card">
        <div class="tech-info">
          <span class="tech-icon-fallback">🛠️</span>
          <span class="tech-name">{{ tech.name }}</span>
        </div>
        <div class="tech-actions">
          <span class="sort-order" title="Sort Order">#{{ tech.sort_order }}</span>
          <button @click="editTech(tech)" class="btn-icon" title="Edit">✏️</button>
          <button @click="deleteTech(tech.id)" class="btn-icon danger" title="Delete">🗑️</button>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        No tech stack items created yet. Click "+ Add Tech Item" to start.
      </div>
    </div>

    <!-- Modal Form -->
    <div v-if="showCreateForm || editingTechId" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingTechId ? 'Edit Tech Item' : 'Add Tech Item' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">Technology Name</label>
            <input v-model="form.name" class="form-input" required placeholder="Vue.js" />
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Icon Class/Name</label>
              <input v-model="form.icon" class="form-input" placeholder="vuejs" />
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" />
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Item' }}
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
import type { TechStackItem } from '@/types'

const { items, loading, saving, error, load, create, update, remove } = useAdminCrud<TechStackItem>('/tech-stack')

const showCreateForm = ref(false)
const editingTechId = ref<number | null>(null)

const form = reactive({
  name: '',
  icon: '',
  sort_order: 0,
})

function resetForm() {
  form.name = ''
  form.icon = ''
  form.sort_order = items.value.length ? Math.max(...items.value.map(t => t.sort_order)) + 10 : 10
}

function editTech(tech: TechStackItem) {
  editingTechId.value = tech.id
  form.name = tech.name
  form.icon = tech.icon
  form.sort_order = tech.sort_order
}

function closeForm() {
  showCreateForm.value = false
  editingTechId.value = null
  resetForm()
}

async function submitForm() {
  const payload = {
    name: form.name,
    icon: form.icon,
    sort_order: form.sort_order,
  }

  if (editingTechId.value) {
    await update(editingTechId.value, payload)
  } else {
    await create(payload)
  }

  if (!error.value) {
    closeForm()
  }
}

async function deleteTech(id: number) {
  if (confirm('Are you sure you want to delete this tech stack item?')) {
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

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.tech-card {
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tech-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tech-icon-fallback {
  font-size: 1.25rem;
}

.tech-name {
  font-weight: 600;
  font-size: 0.95rem;
}

.tech-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sort-order {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-right: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.35rem;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: background var(--transition);
}

.btn-icon:hover {
  background: var(--border);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.empty-state {
  grid-column: 1 / -1;
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

.form-grid-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
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
