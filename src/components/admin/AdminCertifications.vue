<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">🏆 Certifications</h2>
        <p class="panel-sub">Manage your professional credentials, achievements, and verified certifications.</p>
      </div>
      <button @click="showCreateForm = true" class="btn btn-primary">+ Add Certification</button>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="load" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading certifications…</div>

    <!-- Main Content -->
    <div v-else class="certs-list">
      <div v-for="cert in items" :key="cert.id" class="card cert-card">
        <div class="cert-body">
          <div class="cert-header">
            <div class="cert-title-wrapper">
              <h4 class="cert-title-text">{{ cert.name }}</h4>
              <span v-if="cert.is_hidden === 1" class="status-badge hidden-badge" style="margin-left: 0.5rem;">👁️ Hidden</span>
            </div>
            <div class="badge-row">
              <span class="cert-badge" :class="cert.verified ? 'verified' : 'unverified'">
                {{ cert.verified ? '✓ Verified' : 'Unverified' }}
              </span>
              <span class="status-badge" :class="cert.status || 'active'">
                {{ cert.status || 'active' }}
              </span>
            </div>
          </div>
          <div class="cert-issuer">Issued by: <strong>{{ cert.issuer }}</strong></div>
          <p v-if="cert.description" class="cert-desc">{{ cert.description }}</p>
        </div>

        <div class="card-footer">
          <span class="sort-order">Order: {{ cert.sort_order }}</span>
          <div class="card-actions">
            <button @click="editCert(cert)" class="btn btn-outline btn-sm">✏️ Edit</button>
            <button @click="deleteCert(cert.id)" class="btn btn-outline btn-sm danger">🗑️ Delete</button>
          </div>
        </div>
      </div>

      <div v-if="items.length === 0" class="empty-state">
        No certifications added yet. Click "+ Add Certification" to create one.
      </div>
    </div>

    <!-- Create/Edit Modal -->
    <div v-if="showCreateForm || editingCertId" class="dialog-overlay" @click.self="closeForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingCertId ? 'Edit Certification' : 'Add Certification' }}</h3>
        <form @submit.prevent="submitForm">
          <div class="form-group">
            <label class="form-label">Certification Name</label>
            <input v-model="form.name" class="form-input" required placeholder="AWS Certified Cloud Practitioner" />
          </div>

          <div class="form-group">
            <label class="form-label">Issuer</label>
            <input v-model="form.issuer" class="form-input" required placeholder="Amazon Web Services (AWS)" />
          </div>

          <div class="form-group">
            <label class="form-label">Description (Optional)</label>
            <textarea v-model="form.description" class="form-input" rows="2" placeholder="Validation ID, brief description or link..."></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Status</label>
              <select v-model="form.status" class="form-input select-input" style="background-color: var(--bg-secondary);">
                <option value="active">Active</option>
                <option value="expired">Expired</option>
                <option value="retired">Retired</option>
                <option value="in-progress">In Progress</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Sort Order</label>
              <input v-model.number="form.sort_order" type="number" class="form-input" />
            </div>
          </div>

          <div class="form-row" style="margin-top: 0.5rem;">
            <div class="form-group check-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.verified" /> Verified Certification
              </label>
            </div>
            <div class="form-group check-group">
              <label class="checkbox-label">
                <input type="checkbox" v-model="form.is_hidden" /> Hide from portfolio
              </label>
            </div>
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Certification' }}
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
import type { Certification } from '@/types'

const { items, loading, saving, error, load, create, update, remove } = useAdminCrud<Certification>('/certifications', '/certifications/admin')

const showCreateForm = ref(false)
const editingCertId = ref<number | null>(null)

const form = reactive({
  name: '',
  issuer: '',
  description: '',
  verified: true,
  sort_order: 0,
  status: 'active',
  is_hidden: false,
})

function resetForm() {
  form.name = ''
  form.issuer = ''
  form.description = ''
  form.verified = true
  form.sort_order = items.value.length ? Math.max(...items.value.map(c => c.sort_order)) + 10 : 10
  form.status = 'active'
  form.is_hidden = false
}

function editCert(cert: Certification) {
  editingCertId.value = cert.id
  form.name = cert.name
  form.issuer = cert.issuer
  form.description = cert.description
  form.verified = cert.verified === 1
  form.sort_order = cert.sort_order
  form.status = cert.status || 'active'
  form.is_hidden = cert.is_hidden === 1
}

function closeForm() {
  showCreateForm.value = false
  editingCertId.value = null
  resetForm()
}

async function submitForm() {
  const payload = {
    name: form.name,
    issuer: form.issuer,
    description: form.description,
    verified: form.verified ? 1 : 0,
    sort_order: form.sort_order,
    status: form.status,
    is_hidden: form.is_hidden ? 1 : 0,
  }

  if (editingCertId.value) {
    await update(editingCertId.value, payload as any)
  } else {
    await create(payload as any)
  }

  if (!error.value) {
    closeForm()
  }
}

async function deleteCert(id: number) {
  if (confirm('Are you sure you want to delete this certification?')) {
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

.certs-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.cert-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 1rem;
}

.cert-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.cert-title-wrapper {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
}

.badge-row {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.35rem;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.status-badge.expired, .status-badge.retired {
  background: rgba(239, 68, 68, 0.15);
  color: var(--danger);
}

.status-badge.in-progress {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.hidden-badge {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-secondary);
}

.select-input {
  appearance: none;
  background-image: url("data:image/svg+xml;utf8,<svg fill='white' height='24' viewBox='0 0 24 24' width='24' xmlns='http://www.w3.org/2000/svg'><path d='M7 10l5 5 5-5z'/><path d='M0 0h24v24H0z' fill='none'/></svg>");
  background-repeat: no-repeat;
  background-position: right 10px center;
  padding-right: 30px;
}

.cert-title-text {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.cert-badge {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.cert-badge.verified {
  background: rgba(16, 185, 129, 0.15);
  color: var(--success);
}

.cert-badge.unverified {
  background: rgba(245, 158, 11, 0.15);
  color: var(--warning);
}

.cert-issuer {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}

.cert-desc {
  margin: 0;
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.5;
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
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.check-group {
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
