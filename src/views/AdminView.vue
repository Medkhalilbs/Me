<template>
  <div class="admin-wrapper">
    <!-- Login Gate -->
    <div v-if="!adminStore.isAuthenticated" class="admin-login-page">
      <div class="login-card card">
        <div class="login-logo gradient-text">MKBS Admin</div>
        <p class="login-sub">Enter your password to access the control panel</p>
        <form @submit.prevent="doLogin">
          <div class="form-group">
            <label class="form-label">Password</label>
            <input
              v-model="password"
              type="password"
              class="form-input"
              placeholder="Enter admin password"
              autofocus
              required
            />
          </div>
          <p v-if="adminStore.loginError" class="form-error">{{ adminStore.loginError }}</p>
          <button type="submit" class="btn btn-primary" style="width:100%;margin-top:0.5rem" :disabled="adminStore.loading">
            {{ adminStore.loading ? 'Verifying…' : 'Sign In' }}
          </button>
        </form>
        <a href="/" class="back-link">← Back to portfolio</a>
      </div>
    </div>

    <!-- Dashboard -->
    <template v-else>
      <aside class="admin-sidebar">
        <div class="sidebar-logo gradient-text">MKBS Admin</div>
        <nav class="sidebar-nav">
          <button
            v-for="item in navItems"
            :key="item.id"
            class="sidebar-link"
            :class="{ active: activePanel === item.id }"
            @click="activePanel = item.id"
          >
            <span>{{ item.icon }}</span> {{ item.label }}
          </button>
        </nav>
        <div class="sidebar-footer">
          <a href="/" class="sidebar-link" style="text-decoration:none;">← View Portfolio</a>
          <button class="sidebar-link" @click="adminStore.logout()">🚪 Logout</button>
        </div>
      </aside>

      <main class="admin-content">
        <Suspense>
          <component :is="activeComponent" />
        </Suspense>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAdminStore } from '@/stores/adminStore'

// Lazy-loaded admin panels
import AdminProfile       from '@/components/admin/AdminProfile.vue'
import AdminHeroStats     from '@/components/admin/AdminHeroStats.vue'
import AdminSkills        from '@/components/admin/AdminSkills.vue'
import AdminExperiences   from '@/components/admin/AdminExperiences.vue'
import AdminProjects      from '@/components/admin/AdminProjects.vue'
import AdminEducation     from '@/components/admin/AdminEducation.vue'
import AdminTechStack     from '@/components/admin/AdminTechStack.vue'
import AdminWhyMe         from '@/components/admin/AdminWhyMe.vue'
import AdminCertifications from '@/components/admin/AdminCertifications.vue'
import AdminTestimonials  from '@/components/admin/AdminTestimonials.vue'
import AdminCVs           from '@/components/admin/AdminCVs.vue'
import AdminMessages      from '@/components/admin/AdminMessages.vue'
import AdminSettings      from '@/components/admin/AdminSettings.vue'

const adminStore = useAdminStore()
const password = ref('')
const activePanel = ref('profile')

async function doLogin() {
  await adminStore.login(password.value)
  password.value = ''
}

const navItems = [
  { id: 'profile',       icon: '👤', label: 'Profile' },
  { id: 'hero-stats',    icon: '📊', label: 'Hero Stats' },
  { id: 'skills',        icon: '⚡', label: 'Skills' },
  { id: 'experiences',   icon: '💼', label: 'Experience' },
  { id: 'projects',      icon: '🚀', label: 'Projects' },
  { id: 'education',     icon: '🎓', label: 'Education' },
  { id: 'tech-stack',    icon: '🛠', label: 'Tech Stack' },
  { id: 'why-me',        icon: '✨', label: 'Why Work With Me' },
  { id: 'certifications',icon: '🏆', label: 'Certifications' },
  { id: 'testimonials',  icon: '💬', label: 'Testimonials' },
  { id: 'cvs',           icon: '📄', label: 'CVs' },
  { id: 'messages',      icon: '📬', label: 'Messages' },
  { id: 'settings',      icon: '⚙️', label: 'Settings' },
]

const panelMap: Record<string, unknown> = {
  'profile':        AdminProfile,
  'hero-stats':     AdminHeroStats,
  'skills':         AdminSkills,
  'experiences':    AdminExperiences,
  'projects':       AdminProjects,
  'education':      AdminEducation,
  'tech-stack':     AdminTechStack,
  'why-me':         AdminWhyMe,
  'certifications': AdminCertifications,
  'testimonials':   AdminTestimonials,
  'cvs':            AdminCVs,
  'messages':       AdminMessages,
  'settings':       AdminSettings,
}

const activeComponent = computed(() => panelMap[activePanel.value] || AdminProfile)
</script>

<style scoped>
.admin-wrapper { min-height: 100vh; position: relative; z-index: 10; }

/* Ensure pointer-events are always active in admin to prevent click blockages */
.admin-sidebar,
.admin-content,
.admin-login-page {
  pointer-events: auto !important;
}

/* Login Page */
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(ellipse at top left, rgba(59, 130, 246, 0.08) 0%, transparent 60%);
}

.login-card {
  width: 100%;
  max-width: 420px;
  padding: 2.5rem;
}

.login-logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 0.5rem;
}

.login-sub {
  text-align: center;
  color: var(--text-secondary);
  font-size: 0.88rem;
  margin-bottom: 2rem;
}

.form-group { margin-bottom: 1rem; }
.form-error { color: var(--danger); font-size: 0.85rem; margin: 0.5rem 0; }

.back-link {
  display: block;
  text-align: center;
  margin-top: 1.5rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color var(--transition);
}
.back-link:hover { color: var(--accent); }

/* Sidebar */
.sidebar-logo {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.25rem;
  font-weight: 800;
  padding: 1.5rem;
  border-bottom: 1px solid var(--border);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  overflow-y: auto;
}

.sidebar-link {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 0.9rem;
  border-radius: 8px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-secondary);
  width: 100%;
  text-align: left;
  transition: all var(--transition);
}

.sidebar-link.active,
.sidebar-link:hover {
  background: var(--accent-glow);
  color: var(--accent);
}

.admin-sidebar {
  display: flex;
  flex-direction: column;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}
</style>
