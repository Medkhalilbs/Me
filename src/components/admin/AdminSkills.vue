<template>
  <div class="admin-panel">
    <div class="panel-header">
      <div>
        <h2 class="panel-title">⚡ Skills</h2>
        <p class="panel-sub">Manage your skill categories, proficiency levels, and tech tags.</p>
      </div>
      <button @click="openCreateCategory" class="btn btn-primary">+ Add Category</button>
    </div>

    <div v-if="error || fetchError" class="error-banner">
      <span>❌ {{ error || fetchError }}</span>
      <button @click="loadCategories" class="btn-text">Retry</button>
    </div>

    <div v-if="loading" class="panel-loading">Loading skills dashboard…</div>

    <div v-else class="categories-grid">
      <div v-for="cat in categories" :key="cat.id" class="card category-card">
        <div class="category-header">
          <div class="category-title-wrap">
            <span class="category-icon">{{ getIconEmoji(cat.icon) }}</span>
            <div>
              <h4 class="category-name">{{ cat.name }}</h4>
              <span class="category-prof">{{ cat.proficiency }}% Proficiency</span>
            </div>
          </div>
          <div class="category-actions">
            <button @click="editCategory(cat)" class="btn-icon" title="Edit Category">✏️</button>
            <button @click="deleteCategory(cat.id)" class="btn-icon danger" title="Delete Category">🗑️</button>
          </div>
        </div>

        <!-- Proficiency Progress Bar -->
        <div class="proficiency-track">
          <div class="proficiency-fill" :style="{ width: cat.proficiency + '%' }"></div>
        </div>

        <!-- Tags Area -->
        <div class="tags-section">
          <label class="section-label">Tags / Sub-skills</label>
          <div class="tags-list">
            <span v-for="tag in cat.tags" :key="tag.id" class="tech-tag admin-tag">
              {{ tag.name }}
              <button @click="deleteTag(tag.id)" class="remove-tag-btn">✕</button>
            </span>
            <span v-if="!cat.tags || cat.tags.length === 0" class="no-tags">No tags added yet.</span>
          </div>

          <!-- Add Tag Quick Form -->
          <form @submit.prevent="addTag(cat.id)" class="add-tag-form">
            <input
              v-model="newTagNames[cat.id]"
              placeholder="Add tag (e.g. Vue 3)"
              class="form-input tag-input"
              required
            />
            <button type="submit" class="btn btn-outline btn-tag-add" :disabled="savingTag === cat.id">
              {{ savingTag === cat.id ? '…' : '+' }}
            </button>
          </form>
        </div>

        <div class="category-footer">
          <span class="sort-order">Sort order: {{ cat.sort_order }}</span>
        </div>
      </div>

      <div v-if="categories.length === 0" class="empty-state">
        No skill categories created yet. Click "+ Add Category" to start.
      </div>
    </div>

    <!-- Category Modal -->
    <div v-if="showCategoryForm" class="dialog-overlay" @click.self="closeCategoryForm">
      <div class="dialog-card card">
        <h3 class="dialog-title">{{ editingCategoryId ? 'Edit Skill Category' : 'Create Skill Category' }}</h3>
        <form @submit.prevent="submitCategoryForm">
          <div class="form-group">
            <label class="form-label">Category Name</label>
            <input v-model="catForm.name" class="form-input" required placeholder="Frontend, Backend, DevOps, etc." />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Icon (lucide name or keyword)</label>
              <select v-model="catForm.icon" class="form-input select-input">
                <option value="monitor">🖥️ Monitor (Frontend)</option>
                <option value="server">⚙️ Server (Backend)</option>
                <option value="database">🗄️ Database</option>
                <option value="settings">🛠️ Settings (DevOps)</option>
                <option value="cloud">☁️ Cloud / Infra</option>
                <option value="wrench">🔧 Wrench / Tools</option>
                <option value="code">💻 Code</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Proficiency (%)</label>
              <div class="slider-group">
                <input v-model.number="catForm.proficiency" type="range" min="10" max="100" class="slider-input" />
                <span class="slider-val">{{ catForm.proficiency }}%</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Sort Order</label>
            <input v-model.number="catForm.sort_order" type="number" class="form-input" />
          </div>

          <div class="dialog-actions">
            <button type="button" @click="closeCategoryForm" class="btn btn-outline">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="saving">
              {{ saving ? 'Saving…' : 'Save Category' }}
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
import type { SkillCategory } from '@/types'

const categories = ref<SkillCategory[]>([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')
const fetchError = ref('')
const savingTag = ref<number | null>(null)

// For adding quick tags inside each category card
const newTagNames = reactive<Record<number, string>>({})

// Form state for category dialog
const showCategoryForm = ref(false)
const editingCategoryId = ref<number | null>(null)
const catForm = reactive({
  name: '',
  icon: 'code',
  proficiency: 80,
  sort_order: 0,
})

async function loadCategories() {
  loading.value = true
  fetchError.value = ''
  try {
    const res = await api.get('/skills')
    categories.value = res.data
  } catch (e: any) {
    fetchError.value = 'Failed to load skills.'
  } finally {
    loading.value = false
  }
}

function openCreateCategory() {
  editingCategoryId.value = null
  catForm.name = ''
  catForm.icon = 'code'
  catForm.proficiency = 80
  catForm.sort_order = categories.value.length ? Math.max(...categories.value.map(c => c.sort_order)) + 10 : 10
  showCategoryForm.value = true
}

function editCategory(cat: SkillCategory) {
  editingCategoryId.value = cat.id
  catForm.name = cat.name
  catForm.icon = cat.icon
  catForm.proficiency = cat.proficiency
  catForm.sort_order = cat.sort_order
  showCategoryForm.value = true
}

function closeCategoryForm() {
  showCategoryForm.value = false
  editingCategoryId.value = null
}

async function submitCategoryForm() {
  saving.value = true
  error.value = ''
  try {
    if (editingCategoryId.value) {
      await api.patch(`/skills/categories/${editingCategoryId.value}`, catForm)
    } else {
      await api.post('/skills/categories', catForm)
    }
    await loadCategories()
    closeCategoryForm()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Save category failed'
  } finally {
    saving.value = false
  }
}

async function deleteCategory(id: number) {
  if (confirm('Are you sure you want to delete this category? All its tags will be deleted too!')) {
    loading.value = true
    try {
      await api.delete(`/skills/categories/${id}`)
      await loadCategories()
    } catch (e: any) {
      error.value = 'Delete failed.'
    } finally {
      loading.value = false
    }
  }
}

async function addTag(categoryId: number) {
  const tagName = newTagNames[categoryId]?.trim()
  if (!tagName) return

  savingTag.value = categoryId
  error.value = ''
  try {
    const cat = categories.value.find(c => c.id === categoryId)
    const nextSort = cat?.tags && cat.tags.length ? Math.max(...cat.tags.map(t => t.sort_order)) + 10 : 10
    await api.post('/skills/tags', {
      category_id: categoryId,
      name: tagName,
      sort_order: nextSort,
    })
    newTagNames[categoryId] = ''
    await loadCategories()
  } catch (e: any) {
    error.value = e.response?.data?.error || 'Failed to add tag'
  } finally {
    savingTag.value = null
  }
}

async function deleteTag(tagId: number) {
  try {
    await api.delete(`/skills/tags/${tagId}`)
    await loadCategories()
  } catch (e: any) {
    error.value = 'Failed to delete tag'
  }
}

function getIconEmoji(icon: string): string {
  switch (icon) {
    case 'monitor': return '🖥️'
    case 'server': return '⚙️'
    case 'database': return '🗄️'
    case 'settings': return '🛠️'
    case 'cloud': return '☁️'
    case 'wrench': return '🔧'
    default: return '💻'
  }
}

onMounted(loadCategories)
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 1.5rem;
}

.category-card {
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 1.25rem;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.category-title-wrap {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.category-icon {
  font-size: 1.75rem;
}

.category-name {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
}

.category-prof {
  font-size: 0.8rem;
  color: var(--accent);
  font-weight: 600;
}

.category-actions {
  display: flex;
  gap: 0.25rem;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.4rem;
  font-size: 0.95rem;
  border-radius: 6px;
  transition: background var(--transition);
}

.btn-icon:hover {
  background: var(--border);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.15);
}

.proficiency-track {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.proficiency-fill {
  height: 100%;
  background: var(--gradient-hero);
  border-radius: 3px;
}

.tags-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-secondary);
  font-weight: 600;
}

.tags-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  min-height: 40px;
  align-content: flex-start;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  border: 1px solid var(--border);
}

.admin-tag {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.2rem 0.5rem;
}

.remove-tag-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 0.75rem;
  padding: 0 0.1rem;
  transition: color var(--transition);
}

.remove-tag-btn:hover {
  color: var(--danger);
}

.no-tags {
  font-size: 0.8rem;
  color: var(--text-muted);
  align-self: center;
}

.add-tag-form {
  display: flex;
  gap: 0.4rem;
  margin-top: 0.5rem;
}

.tag-input {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  flex: 1;
}

.btn-tag-add {
  padding: 0.4rem 0.75rem;
  border-radius: var(--radius);
}

.category-footer {
  border-top: 1px solid var(--border);
  padding-top: 0.75rem;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-muted);
  padding: 4rem 2rem;
  border: 1px dashed var(--border);
  border-radius: var(--radius-lg);
}

/* Dialog & Sliders */
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

.slider-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.slider-input {
  flex: 1;
  accent-color: var(--accent);
}

.slider-val {
  font-size: 0.9rem;
  font-weight: 600;
  min-width: 45px;
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
