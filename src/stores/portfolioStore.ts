import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/api'
import type {
  Profile, HeroStat, SkillCategory, Experience,
  Project, Education, TechStackItem, WhyCard,
  Certification, Testimonial, CV
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
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      const [
        profileRes, statsRes, skillsRes, expRes, projRes,
        eduRes, techRes, whyRes, certRes, testRes, cvsRes
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
    } catch (e: any) {
      error.value = e.message
      console.error('Failed to load portfolio data:', e)
    } finally {
      loading.value = false
    }
  }

  return {
    profile, heroStats, skills, experiences, projects,
    education, techStack, whyCards, certifications, testimonials, cvs,
    loading, error, fetchAll
  }
})
