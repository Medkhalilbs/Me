<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">✨ Why Work With Me</h2>
        <p class="panel-sub">Manage the value propositions and key selling points shown on the portfolio.</p>
      </div>
      <button @click="showCreateForm = true" class="btn btn-primary">+ Add Card</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading selling points…</div>

    <!-- Main Content -->
    <div v-else class="cards-list">
      <div v-for="card in items" :key="card.id" class="card why-card">
        <div class="why-header">
          <div class="why-title-wrap">
            <span class="why-icon">{{ card.icon }}</span>
            <h4 class="why-title-text">{{ card.title }}</h4>
          </div>
        </div>
        <p class="why-desc">{{ card.description }}</p>

        <div class="card-footer">
          <span class="sort-order">Order: {{ card.sort_order }}</span>
          <div class="card-actions">
            <button @click="editCard(card)" class="btn btn-outline btn-sm">✏️ Edit</button>
            <button @click="deleteCard(card.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        No cards added yet. Click "+ Add Card" to create one.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateForm || editingCardId" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingCardId ? 'Edit Selling Point' : 'Add Selling Point' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label class="form-label">Title</label>
              <input v-model="form.title" class="form-input" required placeholder="Clean Architecture" />
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Icon (e.g. Emoji)</label>
              <input v-model="form.icon" class="form-input" placeholder="✨" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Description</label>
            <textarea v-model="form.description" class="form-input" rows="3" required placeholder="Writing clean, maintainable, and well-tested code..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Sort Order</label>
            <input v-model.number="form.sort_order" type="number" class="form-input" />
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Card' }}
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
import type { WhyCard } from '@/types'

const { items, loading, saving, error, load, create, update, remove } = useAdminCrud<WhyCard>('/why-work-with-me')

const showCreateForm = ref(false)
const editingCardId = ref<number | null>(null)

const form = reactive({
  title: '',
  description: '',
  icon: '✨',
  sort_order: 0,
})

function resetForm() {
  form.title = ''
  form.description = ''
  form.icon = '✨'
  form.sort_order = items.value.length ? Math.max(...items.value.map(c => c.sort_order)) + 10 : 10
}

function editCard(card: WhyCard) {
  editingCardId.value = card.id
  form.title = card.title
  form.description = card.description
  form.icon = card.icon
  form.sort_order = card.sort_order
}

function closeForm() {
  showCreateForm.value = false
  editingCardId.value = null
  resetForm()
}

async function submitForm() {
  const payload = {
    title: form.title,
    description: form.description,
    icon: form.icon,
    sort_order: form.sort_order,
  }

  if (editingCardId.value) {
    await update(editingCardId.value, payload)
  } else {
    await create(payload)
  }

  if (!error.value) {
    closeForm()
  }
}

async function deleteCard(id: number) {
  if (confirm('Are you sure you want to delete this selling point card?')) {
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

.cards-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.why-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.why-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.why-title-wrap {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.why-icon {
  font-size: 1.75rem;
}

.why-title-text {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.why-desc {
  margin: 0;
  font-size: 0.92rem;
  color: var(--text-secondary);
  line-height: 1.6;
  flex: 1;
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
  display: flex;
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
