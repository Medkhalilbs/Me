// ─── Profile ──────────────────────────────────────────────────────────────────
export interface Profile {
  id: number
  name: string
  title: string
  location: string
  email: string
  phone: string
  linkedin_url: string
  github_url: string
  hero_heading: string
  hero_subtitle: string
  hero_badge: string
  about_paragraphs: string[]
  callout_title: string
  callout_text: string
  admin_secret_path?: string
}

// ─── Hero Stats ───────────────────────────────────────────────────────────────
export interface HeroStat {
  id: number
  label: string
  value: string
  suffix: string
  is_static: 0 | 1
  sort_order: number
}

// ─── Skills ───────────────────────────────────────────────────────────────────
export interface SkillTag {
  id: number
  category_id: number
  name: string
  sort_order: number
}

export interface SkillCategory {
  id: number
  name: string
  icon: string
  proficiency: number
  sort_order: number
  tags: SkillTag[]
}

// ─── Experience ───────────────────────────────────────────────────────────────
export interface ExperienceResponsibility {
  id: number
  experience_id: number
  text: string
  sort_order: number
}

export interface Experience {
  id: number
  company: string
  role: string
  client: string
  start_date: string
  end_date: string
  location: string
  is_current: 0 | 1
  logo_path: string
  sort_order: number
  responsibilities: ExperienceResponsibility[]
  tech: string[]
}

// ─── Projects ─────────────────────────────────────────────────────────────────
export interface ProjectFeature {
  id: number
  project_id: number
  text: string
  sort_order: number
}

export interface Project {
  id: number
  title: string
  category: string
  description: string
  problem: string
  solution: string
  business_impact: string
  status: string
  github_url: string
  demo_url: string
  hero_image_path: string
  sort_order: number
  features: ProjectFeature[]
  tech: string[]
}

// ─── Education ────────────────────────────────────────────────────────────────
export interface Education {
  id: number
  school: string
  degree: string
  start_year: string
  end_year: string
  description: string
  sort_order: number
}

// ─── Tech Stack ───────────────────────────────────────────────────────────────
export interface TechStackItem {
  id: number
  name: string
  icon: string
  sort_order: number
}

// ─── Why Work With Me ─────────────────────────────────────────────────────────
export interface WhyCard {
  id: number
  title: string
  description: string
  icon: string
  sort_order: number
}

// ─── Certification ────────────────────────────────────────────────────────────
export interface Certification {
  id: number
  name: string
  issuer: string
  description: string
  verified: 0 | 1
  sort_order: number
}

// ─── Testimonial ──────────────────────────────────────────────────────────────
export interface Testimonial {
  id: number
  author_name: string
  author_role: string
  author_company: string
  avatar_initials: string
  text: string
  sort_order: number
}

// ─── CV ───────────────────────────────────────────────────────────────────────
export interface CV {
  id: number
  language: string
  filename: string
  is_default: 0 | 1
  uploaded_at: string
}

// ─── Contact Message ──────────────────────────────────────────────────────────
export interface ContactMessage {
  id: number
  name: string
  email: string
  subject: string
  message: string
  received_at: string
  is_read: 0 | 1
}
