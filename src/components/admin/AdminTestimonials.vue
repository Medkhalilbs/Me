<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">💬 Testimonials</h2>
        <p class="panel-sub">Manage recommendations and feedback from colleagues, clients, and partners.</p>
      </div>
      <button @click="showCreateForm = true" class="btn btn-primary">+ Add Testimonial</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading testimonials…</div>

    <!-- Main Content -->
    <div v-else class="testimonials-list">
      <div v-for="t in items" :key="t.id" class="card testimonial-card">
        <div class="t-body">
          <p class="t-text">“{{ t.text }}”</p>
          <div class="t-author-group">
            <div class="t-avatar">{{ t.avatar_initials || getInitials(t.author_name) }}</div>
            <div>
              <h5 class="t-name">{{ t.author_name }}</h5>
              <span class="t-role">{{ t.author_role }} at {{ t.author_company }}</span>
            </div>
          </div>
        </div>

        <div class="card-footer">
          <span class="sort-order">Order: {{ t.sort_order }}</span>
          <div class="card-actions">
            <button @click="editTestimonial(t)" class="btn btn-outline btn-sm">✏️ Edit</button>
            <button @click="deleteTestimonial(t.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        No testimonials added yet. Click "+ Add Testimonial" to create one.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateForm || editingTestimonialId" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingTestimonialId ? 'Edit Testimonial' : 'Add Testimonial' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-row">
            <div class="form-group" style="flex: 2;">
              <label class="form-label">Author Name</label>
              <input v-model="form.author_name" class="form-input" required placeholder="John Doe" />
            </div>
            <div class="form-group" style="flex: 1;">
              <label class="form-label">Initials</label>
              <input v-model="form.avatar_initials" class="form-input" placeholder="JD" maxlength="3" />
            </div>
          </div>

          <div class="form-grid-2">
            <div class="form-group">
              <label class="form-label">Role</label>
              <input v-model="form.author_role" class="form-input" placeholder="Technical Lead" />
            </div>
            <div class="form-group">
              <label class="form-label">Company</label>
              <input v-model="form.author_company" class="form-input" placeholder="Volkswagen" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Testimonial Text</label>
            <textarea v-model="form.text" class="form-input" rows="4" required placeholder="Khalil is an outstanding engineer..."></textarea>
          </div>

          <div class="form-group">
            <label class="form-label">Sort Order</label>
            <input v-model.number="form.sort_order" type="number" class="form-input" />
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Testimonial' }}
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
import type { Testimonial } from '@/types'

const { items, loading, saving, error, load, create, update, remove } = useAdminCrud<Testimonial>('/testimonials')

const showCreateForm = ref(false)
const editingTestimonialId = ref<number | null>(null)

const form = reactive({
  author_name: '',
  author_role: '',
  author_company: '',
  avatar_initials: '',
  text: '',
  sort_order: 0,
})

function getInitials(name: string): string {
  if (!name) return ''
  return name.split(' ').map(n => n[0]).join('').slice(0, 3).toUpperCase()
}

function resetForm() {
  form.author_name = ''
  form.author_role = ''
  form.author_company = ''
  form.avatar_initials = ''
  form.text = ''
  form.sort_order = items.value.length ? Math.max(...items.value.map(c => c.sort_order)) + 10 : 10
}

function editTestimonial(t: Testimonial) {
  editingTestimonialId.value = t.id
  form.author_name = t.author_name
  form.author_role = t.author_role
  form.author_company = t.author_company
  form.avatar_initials = t.avatar_initials
  form.text = t.text
  form.sort_order = t.sort_order
}

function closeForm() {
  showCreateForm.value = false
  editingTestimonialId.value = null
  resetForm()
}

async function submitForm() {
  const payload = {
    author_name: form.author_name,
    author_role: form.author_role,
    author_company: form.author_company,
    avatar_initials: form.avatar_initials || getInitials(form.author_name),
    text: form.text,
    sort_order: form.sort_order,
  }

  if (editingTestimonialId.value) {
    await update(editingTestimonialId.value, payload)
  } else {
    await create(payload)
  }

  if (!error.value) {
    closeForm()
  }
}

async function deleteTestimonial(id: number) {
  if (confirm('Are you sure you want to delete this testimonial?')) {
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

.testimonials-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 1.5rem;
}

.testimonial-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.t-text {
  font-style: italic;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.t-author-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.t-avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: var(--accent-glow);
  color: var(--accent);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.88rem;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.t-name {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
}

.t-role {
  font-size: 0.78rem;
  color: var(--text-muted);
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
