import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import type {
  Profile, HeroStat, SkillCategory, Experience,
  Project, Education, TechStackItem, WhyCard,
  Certification, Testimonial, CV, Language, SectionSetting
} from '@/types'

export const usePortfolioStore = defineStore('portfolio', () => {
  const profile = ref<Profile | null>(null)
  const heroStats = ref<HeroStat[]>([])
  const skills = ref<SkillCategory[]>([])
  const experiences = ref<Experience[]>([])
  const projects = ref<Project[]>([])
  const education = ref<Education[]>([])
  const techStack = ref<TechStackItem[]>([])
  const whyCards = ref<WhyCard[]>([])
  const certifications = ref<Certification[]>([])
  const testimonials = ref<Testimonial[]>([])
  const cvs = ref<CV[]>([])
  const languages = ref<Language[]>([])
  const sectionSettings = ref<SectionSetting[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [
        profileRes, statsRes, skillsRes, expRes, projRes,
        eduRes, techRes, whyRes, certRes, testRes, cvsRes,
        langRes, sectRes
      ] = await Promise.all([
        api.get('/profile'),
        api.get('/hero-stats'),
        api.get('/skills'),
        api.get('/experiences'),
        api.get('/projects'),
        api.get('/education'),
        api.get('/tech-stack'),
        api.get('/why-work-with-me'),
        api.get('/certifications'),
        api.get('/testimonials'),
        api.get('/cvs'),
        api.get('/languages'),
        api.get('/sections'),
      ])

      profile.value = profileRes.data
      heroStats.value = statsRes.data
      skills.value = skillsRes.data
      experiences.value = expRes.data
      projects.value = projRes.data
      education.value = eduRes.data
      techStack.value = techRes.data
      whyCards.value = whyRes.data
      certifications.value = certRes.data
      testimonials.value = testRes.data
      cvs.value = cvsRes.data
      languages.value = langRes.data
      sectionSettings.value = sectRes.data

      if (profile.value) {
        document.title = `${profile.value.name} — ${profile.value.title}`
      }
    } catch (e: any) {
      error.value = e.message
      console.error('Failed to load portfolio data:', e)
    } finally {
      loading.value = false
    }
  }

  function isSectionVisible(key: string): boolean {
    if (!sectionSettings.value.length) return true // default visible until loaded
    const s = sectionSettings.value.find(s => s.section_key === key)
    return s ? s.is_visible === 1 : true
  }

  return {
    profile, heroStats, skills, experiences, projects,
    education, techStack, whyCards, certifications, testimonials, cvs,
    languages, sectionSettings,
    loading, error,
    fetchAll, isSectionVisible
  }
})
