<template>
  <div class="admin-panel">
    <h2 class="panel-title">⚙️ Settings</h2>
    <p class="panel-sub">Change your admin access credentials and security settings.</p>

    <!-- Error/Success Alerts -->
    <div v-if="successMsg" class="success-banner">
      <span>✅ {{ successMsg }}</span>
    </div>
    <div v-if="errorMsg" class="error-banner">
      <span>❌ {{ errorMsg }}</span>
    </div>

    <!-- Change Password Section -->
    <div class="card settings-section">
      <h3 class="section-title-custom">🔒 Change Password</h3>
      <p class="section-desc">Keep your admin panel secure by updating the access password.</p>
      <form @submit.prevent="updatePassword" class="settings-form">
        <div class="form-group">
          <label class="form-label">Current Password</label>
          <input
            v-model="pwdForm.currentPassword"
            type="password"
            class="form-input"
            required
            placeholder="Enter current password"
          />
        </div>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">New Password</label>
            <input
              v-model="pwdForm.newPassword"
              type="password"
              class="form-input"
              required
              placeholder="Enter new password"
            />
          </div>
          <div class="form-group">
            <label class="form-label">Confirm New Password</label>
            <input
              v-model="pwdForm.confirmPassword"
              type="password"
              class="form-input"
              required
              placeholder="Confirm new password"
            />
          </div>
        </div>
        <button type="submit" class="btn btn-primary" :disabled="savingPwd">
          {{ savingPwd ? 'Updating…' : 'Update Password' }}
        </button>
      </form>
    </div>

    <!-- Change Admin Path Section -->
    <div class="card settings-section danger-zone">
      <h3 class="section-title-custom danger-text">🔗 Admin Access Secret Path</h3>
      <p class="section-desc">
        Change the hidden URL path used to access this dashboard.
        <strong style="color: var(--danger)">Warning:</strong> Changing this will immediately change the entry point URL! Be sure to remember the new path.
      </p>

      <div v-if="loadingPath" class="panel-loading" style="padding: 1rem 0;">Loading current path…</div>
      <form v-else @submit.prevent="updateSecretPath" class="settings-form">
        <div class="form-group">
          <label class="form-label">Secret Path (current: /{{ currentPath }})</label>
          <div class="url-input-group">
            <span class="url-prefix">{{ siteUrl }}/</span>
            <input
              v-model="pathForm.secretPath"
              type="text"
              class="form-input"
              required
              placeholder="admin-mkbs-2026"
            />
          </div>
        </div>
        <button type="submit" class="btn btn-primary btn-danger" :disabled="savingPath">
          {{ savingPath ? 'Updating…' : 'Update Secret Path' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import api from '@/api'

const successMsg = ref('')
const errorMsg = ref('')

const pwdForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

const pathForm = reactive({
  secretPath: '',
})

const currentPath = ref('')
const loadingPath = ref(true)
const savingPwd = ref(false)
const savingPath = ref(false)
const siteUrl = ref('')

onMounted(async () => {
  siteUrl.value = window.location.origin
  await fetchCurrentPath()
})

async function fetchCurrentPath() {
  loadingPath.value = true
  try {
    const res = await api.get('/profile/admin')
    currentPath.value = res.data.admin_secret_path || ''
    pathForm.secretPath = currentPath.value
  } catch (e: any) {
    errorMsg.value = 'Failed to load secret path'
  } finally {
    loadingPath.value = false
  }
}

async function updatePassword() {
  if (pwdForm.newPassword !== pwdForm.confirmPassword) {
    errorMsg.value = 'New passwords do not match'
    return
  }

  savingPwd.value = true
  successMsg.value = ''
  errorMsg.value = ''

  try {
    await api.post('/auth/change-password', {
      currentPassword: pwdForm.currentPassword,
      newPassword: pwdForm.newPassword,
    })
    successMsg.value = 'Password updated successfully'
    pwdForm.currentPassword = ''
    pwdForm.newPassword = ''
    pwdForm.confirmPassword = ''
    setTimeout(() => { successMsg.value = '' }, 3000)
  } catch (e: any) {
    errorMsg.value = e.response?.data?.error || 'Password update failed'
  } finally {
    savingPwd.value = false
  }
}

async function updateSecretPath() {
  if (!pathForm.secretPath.trim()) {
    errorMsg.value = 'Secret path cannot be empty'
    return
  }

  const cleanPath = pathForm.secretPath.trim().replace(/^\/+|\/+$/g, '') // remove leading/trailing slashes

  if (confirm(`Are you sure you want to change the admin path to "/${cleanPath}"?\n\nYou will need to access the admin panel at this new URL.`)) {
    savingPath.value = true
    successMsg.value = ''
    errorMsg.value = ''

    try {
      await api.patch('/profile', {
        admin_secret_path: cleanPath,
      })
      successMsg.value = `Secret path updated to "/${cleanPath}" successfully`
      currentPath.value = cleanPath
      pathForm.secretPath = cleanPath
      setTimeout(() => { successMsg.value = '' }, 5000)
    } catch (e: any) {
      errorMsg.value = e.response?.data?.error || 'Failed to update secret path'
    } finally {
      savingPath.value = false
    }
  }
}
</script>

<style scoped>
.panel-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.panel-sub {
  color: var(--text-secondary);
  font-size: 0.9rem;
  margin: 0.25rem 0 2rem;
}

.settings-section {
  padding: 2rem;
  margin-bottom: 2rem;
  max-width: 700px;
}

.section-title-custom {
  font-size: 1.2rem;
  margin-top: 0;
  margin-bottom: 0.5rem;
}

.section-desc {
  font-size: 0.88rem;
  color: var(--text-secondary);
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.url-input-group {
  display: flex;
  align-items: center;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg-secondary);
  overflow: hidden;
}

.url-prefix {
  padding: 0.75rem 0 0.75rem 1rem;
  color: var(--text-muted);
  font-size: 0.95rem;
  user-select: none;
}

.url-input-group .form-input {
  border: none;
  background: transparent;
  padding-left: 0.25rem;
}

.url-input-group .form-input:focus {
  box-shadow: none;
}

.danger-zone {
  border-color: rgba(239, 68, 68, 0.3);
}

.danger-text {
  color: var(--danger);
}

.btn-danger {
  background: var(--danger);
  box-shadow: 0 4px 20px rgba(239, 68, 68, 0.2);
  align-self: flex-start;
}

.btn-danger:hover {
  background: #dc2626;
  box-shadow: 0 8px 30px rgba(239, 68, 68, 0.4);
}

.success-banner {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--success);
  color: var(--success);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  max-width: 700px;
}

.error-banner {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--danger);
  color: var(--danger);
  padding: 1rem;
  border-radius: var(--radius);
  margin-bottom: 1.5rem;
  max-width: 700px;
}
</style>
