<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">📊 Hero Stats</h2>
        <p class="panel-sub">Manage the counter and status metrics shown in the Hero section.</p>
      </div>
      <button @click="showCreateForm = true" class="btn btn-primary">+ Add New Stat</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading stats…</div>

    <!-- Main Content -->
    <div v-else class="stats-list">
      <div v-for="stat in items" :key="stat.id" class="card stat-card">
        <div class="stat-main">
          <div class="stat-value-badge">{{ stat.value }}{{ stat.suffix }}</div>
          <div class="stat-info">
            <h4 class="stat-label">{{ stat.label }}</h4>
            <div class="stat-meta">
              <span class="badge" :class="stat.is_static ? 'static' : 'animated'">
                {{ stat.is_static ? 'Static' : 'Animated' }}
              </span>
              <span class="sort-order">Order: {{ stat.sort_order }}</span>
            </div>
          </div>
        </div>

        <div class="card-actions">
          <button @click="editStat(stat)" class="btn btn-outline btn-sm">✏️ Edit</button>
          <button @click="deleteStat(stat.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        No stats added yet. Click "+ Add New Stat" to create one.
      </div>
    </div>

    <!-- Create/Edit Dialog Overlay -->
    <div v-if="showCreateForm || editingStatId" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingStatId ? 'Edit Stat' : 'Add New Stat' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">Value (e.g. 5, 20, AWS)</label>
            <input v-model="form.value" class="form-input" required placeholder="5" />
          </div>
          <div class="form-group">
            <label class="form-label">Suffix (e.g. +, %)</label>
            <input v-model="form.suffix" class="form-input" placeholder="+" />
          </div>
          <div class="form-group">
            <label class="form-label">Label (e.g. Years Experience)</label>
            <input v-model="form.label" class="form-input" required placeholder="Years Experience" />
          </div>
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Type</label>
              <select v-model="form.is_static" class="form-input select-input">
                <option :value="0">Animated Counter</option>
                <option :value="1">Static Badge (No counter animation)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" />
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Stat' }}
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
import type { HeroStat } from '@/types'

const { items, loading, saving, error, load, create, update, remove } = useAdminCrud<HeroStat>('/hero-stats')

const showCreateForm = ref(false)
const editingStatId = ref<number | null>(null)

const form = reactive({
  value: '',
  suffix: '',
  label: '',
  is_static: 0 as 0 | 1,
  sort_order: 0,
})

function resetForm() {
  form.value = ''
  form.suffix = ''
  form.label = ''
  form.is_static = 0
  form.sort_order = items.value.length ? Math.max(...items.value.map(s => s.sort_order)) + 10 : 10
}

function editStat(stat: HeroStat) {
  editingStatId.value = stat.id
  form.value = stat.value
  form.suffix = stat.suffix
  form.label = stat.label
  form.is_static = stat.is_static
  form.sort_order = stat.sort_order
}

function closeForm() {
  showCreateForm.value = false
  editingStatId.value = null
  resetForm()
}

async function submitForm() {
  const payload = {
    value: form.value,
    suffix: form.suffix,
    label: form.label,
    is_static: form.is_static,
    sort_order: form.sort_order,
  }

  if (editingStatId.value) {
    await update(editingStatId.value, payload)
  } else {
    await create(payload)
  }

  if (!error.value) {
    closeForm()
  }
}

async function deleteStat(id: number) {
  if (confirm('Are you sure you want to delete this stat?')) {
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

.stats-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.5rem;
}

.stat-main {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-value-badge {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.25rem;
  font-weight: 800;
  background: var(--gradient-hero);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-width: 80px;
}

.stat-label {
  margin: 0 0 0.25rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.stat-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
}

.badge {
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  font-weight: 600;
}

.badge.static {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.badge.animated {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.sort-order {
  color: var(--text-muted);
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
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

/* Dialog Overlay */
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

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
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
