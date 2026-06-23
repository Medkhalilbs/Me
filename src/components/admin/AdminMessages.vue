<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">📬 Contact Messages</h2>
        <p class="panel-sub">Review inquiries sent from the contact form on your portfolio.</p>
      </div>
      <div v-if="unreadCount > 0" class="unread-badge-total">
        {{ unreadCount }} Unread
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-banner">
      <span>❌ {{ error }}</span>
      <button @click="loadMessages" class="btn-text">Retry</button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="panel-loading">Loading messages…</div>

    <!-- Main Content -->
    <div v-else class="messages-container">
      <!-- Filter Tabs -->
      <div class="filter-tabs">
        <button
          @click="activeFilter = 'all'"
          class="tab-btn"
          :class="{ active: activeFilter === 'all' }"
        >
          All ({{ messages.length }})
        </button>
        <button
          @click="activeFilter = 'unread'"
          class="tab-btn"
          :class="{ active: activeFilter === 'unread' }"
        >
          Unread ({{ unreadCount }})
        </button>
      </div>

      <!-- Messages List -->
      <div class="messages-list">
        <div
          v-for="msg in filteredMessages"
          :key="msg.id"
          class="card message-card"
          :class="{ 'unread-card': !msg.is_read }"
        >
          <div class="msg-header">
            <div class="msg-sender-info">
              <span class="unread-dot" v-if="!msg.is_read"></span>
              <div>
                <h4 class="msg-sender-name">{{ msg.name }}</h4>
                <a :href="`mailto:${msg.email}`" class="msg-sender-email">{{ msg.email }}</a>
              </div>
            </div>
            <div class="msg-meta">
              <span class="msg-date">{{ formatDate(msg.received_at) }}</span>
            </div>
          </div>

          <div class="msg-subject-row">
            <strong>Subject:</strong> {{ msg.subject }}
          </div>

          <p class="msg-body">{{ msg.message }}</p>

          <div class="card-footer-actions">
            <div class="status-labels">
              <span v-if="!msg.is_read" class="badge-unread">Unread</span>
              <span v-else class="badge-read">Read</span>
            </div>
            <div class="msg-actions">
              <button
                v-if="!msg.is_read"
                @click="markAsRead(msg.id)"
                class="btn btn-outline btn-sm"
              >
                Mark Read
              </button>
              <button
                @click="deleteMessage(msg.id)"
                class="btn btn-outline btn-sm danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

        <div v-if="filteredMessages.length === 0" class="empty-state">
          No messages found for this filter.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import api from '@/api'
import type { ContactMessage } from '@/types'

const messages = ref<ContactMessage[]>([])
const loading = ref(true)
const error = ref('')
const activeFilter = ref<'all' | 'unread'>('all')

const unreadCount = computed(() => messages.value.filter(m => !m.is_read).length)

const filteredMessages = computed(() => {
  if (activeFilter.value === 'unread') {
    return messages.value.filter(m => !m.is_read)
  }
  return messages.value
})

async function loadMessages() {
  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/contact')
    messages.value = res.data
  } catch (e: any) {
    error.value = 'Failed to load contact messages.'
  } finally {
    loading.value = false
  }
}

async function markAsRead(id: number) {
  try {
    await api.patch(`/contact/${id}/read`)
    // Update local state
    const msg = messages.value.find(m => m.id === id)
    if (msg) msg.is_read = 1
  } catch (e: any) {
    error.value = 'Failed to mark message as read.'
  }
}

async function deleteMessage(id: number) {
  if (confirm('Are you sure you want to delete this message permanently?')) {
    try {
      await api.delete(`/contact/${id}`)
      messages.value = messages.value.filter(m => m.id !== id)
    } catch (e: any) {
      error.value = 'Failed to delete message.'
    }
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

onMounted(loadMessages)
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

.unread-badge-total {
  background: var(--danger);
  color: white;
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
}

.messages-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.filter-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0.5rem;
}

.tab-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 600;
  border-bottom: 2px solid transparent;
  transition: all var(--transition);
}

.tab-btn:hover {
  color: var(--text-primary);
}

.tab-btn.active {
  color: var(--accent);
  border-bottom-color: var(--accent);
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.message-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  transition: all var(--transition);
}

.message-card.unread-card {
  border-color: var(--border-hover);
  background: rgba(99, 102, 241, 0.02);
}

.msg-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.msg-sender-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.unread-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--danger);
  display: block;
}

.msg-sender-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
}

.msg-sender-email {
  font-size: 0.85rem;
  color: var(--accent);
  text-decoration: none;
}

.msg-sender-email:hover {
  text-decoration: underline;
}

.msg-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.msg-subject-row {
  font-size: 0.9rem;
  color: var(--text-primary);
}

.msg-body {
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--text-secondary);
  white-space: pre-wrap;
  background: rgba(0, 0, 0, 0.1);
  padding: 1rem;
  border-radius: var(--radius);
  border: 1px solid var(--border);
}

.card-footer-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--border);
  padding-top: 1rem;
}

.status-labels {
  font-size: 0.78rem;
  font-weight: 600;
}

.badge-unread {
  color: var(--danger);
}

.badge-read {
  color: var(--text-muted);
}

.msg-actions {
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
