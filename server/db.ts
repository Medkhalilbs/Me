import { createClient, type Client } from '@libsql/client'
import bcrypt from 'bcryptjs'

let client: Client

export function getDb(): Client {
  if (client) return client

  client = createClient({
    url: process.env.TURSO_URL || 'file:local.db',
    authToken: process.env.TURSO_TOKEN,
  })

  return client
}

export async function initSchema(): Promise<void> {
  const db = getDb()

  await db.execute(`PRAGMA foreign_keys = ON;`)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      email TEXT NOT NULL DEFAULT '',
      phone TEXT NOT NULL DEFAULT '',
      linkedin_url TEXT NOT NULL DEFAULT '',
      github_url TEXT NOT NULL DEFAULT '',
      hero_heading TEXT NOT NULL DEFAULT '',
      hero_subtitle TEXT NOT NULL DEFAULT '',
      hero_badge TEXT NOT NULL DEFAULT 'Available for remote & international opportunities',
      about_paragraphs TEXT NOT NULL DEFAULT '[]',
      callout_title TEXT NOT NULL DEFAULT '',
      callout_text TEXT NOT NULL DEFAULT '',
      admin_password_hash TEXT NOT NULL DEFAULT '',
      admin_secret_path TEXT NOT NULL DEFAULT 'admin',
      profile_image_path TEXT DEFAULT NULL
    );
  `)

  // Add profile_image_path to existing DBs that don't have it yet
  try {
    await db.execute(`ALTER TABLE profile ADD COLUMN profile_image_path TEXT DEFAULT NULL;`)
  } catch (_) { /* column already exists */ }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS hero_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      suffix TEXT NOT NULL DEFAULT '',
      is_static INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS skill_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'code',
      proficiency INTEGER NOT NULL DEFAULT 80,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS skill_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS experiences (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company TEXT NOT NULL,
      role TEXT NOT NULL,
      client TEXT NOT NULL DEFAULT '',
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      is_current INTEGER NOT NULL DEFAULT 0,
      logo_path TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS experience_responsibilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS experience_tech (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'web',
      description TEXT NOT NULL DEFAULT '',
      problem TEXT NOT NULL DEFAULT '',
      solution TEXT NOT NULL DEFAULT '',
      business_impact TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'completed',
      github_url TEXT NOT NULL DEFAULT '',
      demo_url TEXT NOT NULL DEFAULT '',
      hero_image_path TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS project_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS project_tech (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS education (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      school TEXT NOT NULL,
      degree TEXT NOT NULL,
      start_year TEXT NOT NULL,
      end_year TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tech_stack (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'code',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS why_work_with_me (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'star',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      issuer TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      verified INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'active',
      is_hidden INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Add new columns to existing certifications table (no-op if already present)
  try { await db.execute(`ALTER TABLE certifications ADD COLUMN status TEXT NOT NULL DEFAULT 'active';`) } catch (_) { }
  try { await db.execute(`ALTER TABLE certifications ADD COLUMN is_hidden INTEGER NOT NULL DEFAULT 0;`) } catch (_) { }

  await db.execute(`
    CREATE TABLE IF NOT EXISTS testimonials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      author_name TEXT NOT NULL,
      author_role TEXT NOT NULL,
      author_company TEXT NOT NULL,
      avatar_initials TEXT NOT NULL DEFAULT '',
      text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  await db.execute(`
    CREATE TABLE IF NOT EXISTS contact_messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT NOT NULL,
      message TEXT NOT NULL,
      received_at TEXT NOT NULL DEFAULT (datetime('now')),
      is_read INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Languages table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS languages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      code TEXT NOT NULL DEFAULT '',
      proficiency TEXT NOT NULL DEFAULT 'intermediate',
      sort_order INTEGER NOT NULL DEFAULT 0,
      is_visible INTEGER NOT NULL DEFAULT 1
    );
  `)

  // Section settings table
  await db.execute(`
    CREATE TABLE IF NOT EXISTS section_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      section_key TEXT NOT NULL UNIQUE,
      is_visible INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  // Seed or re-seed if needed
  const profileResult = await db.execute(`SELECT COUNT(*) as c FROM profile`)
  const skillCatResult = await db.execute(`SELECT COUNT(*) as c FROM skill_categories`)
  const projectResult = await db.execute(`SELECT COUNT(*) as c FROM projects`)

  const count = profileResult.rows[0]?.c as number ?? 0
  const skillCategoryCount = skillCatResult.rows[0]?.c as number ?? 0
  const projectCount = projectResult.rows[0]?.c as number ?? 0

  if (count === 0 || skillCategoryCount !== 7 || projectCount !== 4) {
    console.log('🔄 Old database format detected or empty DB. Performing migration/re-seeding...')
    const tables = [
      'profile', 'hero_stats', 'skill_categories', 'skill_tags', 'experiences',
      'experience_responsibilities', 'experience_tech', 'projects', 'project_features',
      'project_tech', 'education', 'tech_stack', 'why_work_with_me', 'certifications',
      'testimonials', 'cvs', 'contact_messages'
    ]
    for (const t of tables) {
      try { await db.execute(`DELETE FROM ${t};`) } catch (_) { }
    }
    try { await db.execute(`DELETE FROM sqlite_sequence;`) } catch (_) { }
    await seedData()
  }

  // Seed languages if empty
  try {
    const langResult = await db.execute(`SELECT COUNT(*) as c FROM languages`)
    const langCount = langResult.rows[0]?.c as number ?? 0
    if (langCount === 0) {
      await seedLanguages()
    }
  } catch (_) { }

  // Seed section_settings if empty
  try {
    const secResult = await db.execute(`SELECT COUNT(*) as c FROM section_settings`)
    const secCount = secResult.rows[0]?.c as number ?? 0
    if (secCount === 0) {
      await seedSectionSettings()
    }
  } catch (_) { }
}

async function seedLanguages(): Promise<void> {
  const db = getDb()
  const languages = [
    { name: 'Arabic', code: 'AR', proficiency: 'native', sort_order: 0, is_visible: 1 },
    { name: 'French', code: 'FR', proficiency: 'fluent', sort_order: 1, is_visible: 1 },
    { name: 'English', code: 'EN', proficiency: 'professional', sort_order: 2, is_visible: 1 },
  ]
  for (const lang of languages) {
    await db.execute({
      sql: `INSERT INTO languages (name, code, proficiency, sort_order, is_visible) VALUES (?, ?, ?, ?, ?)`,
      args: [lang.name, lang.code, lang.proficiency, lang.sort_order, lang.is_visible]
    })
  }
  console.log('✅ Languages seeded')
}

async function seedSectionSettings(): Promise<void> {
  const db = getDb()
  const sections = [
    { key: 'hero', sort_order: 0 },
    { key: 'about', sort_order: 1 },
    { key: 'languages', sort_order: 2 },
    { key: 'skills', sort_order: 3 },
    { key: 'experience', sort_order: 4 },
    { key: 'projects', sort_order: 5 },
    { key: 'education', sort_order: 6 },
    { key: 'tech-stack', sort_order: 7 },
    { key: 'certifications', sort_order: 8 },
    { key: 'why-work-with-me', sort_order: 9 },
    { key: 'contact', sort_order: 10 },
  ]
  for (const s of sections) {
    await db.execute({
      sql: `INSERT INTO section_settings (section_key, is_visible, sort_order) VALUES (?, 1, ?)`,
      args: [s.key, s.sort_order]
    })
  }
  console.log('✅ Section settings seeded')
}

async function seedData(): Promise<void> {
  const db = getDb()
  const hash = bcrypt.hashSync('admin2026', 10)

  const aboutParagraphs = JSON.stringify([
    'Software engineer with 5 years of experience in full-stack development, IT consulting, and system integration. Skilled in building scalable web applications using modern front-end and back-end technologies.',
    'My journey began in embedded systems — programming ERIKA OS on AURIX microcontrollers, working with CAN bus and GPIO. Today I architect cloud-native applications with Vue.js, Spring Boot, and AWS. This rare combination gives me a deep understanding of systems at every level, from silicon to cloud.'
  ])

  await db.execute({
    sql: `INSERT INTO profile (id, name, title, location, email, phone, linkedin_url, github_url, hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text, admin_password_hash, admin_secret_path)
      VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      'Mohamed Khalil Ben Sedrine',
      'Full Stack Software Engineer',
      'Tunis, Tunisia',
      'medkhalilbs@gmail.com',
      '+216 54 037 360',
      'https://linkedin.com/in/mk-bs',
      'https://github.com/Medkhalilbs',
      'From Silicon to Cloud',
      'From embedded systems to cloud architecture — building software at every layer.',
      'Available for remote & international opportunities',
      aboutParagraphs,
      'From Embedded Systems to Full-Stack Engineering',
      'My background in embedded systems gave me a unique perspective on performance, optimization, and system-level thinking that I now apply to building scalable web applications.',
      hash,
      'admin',
    ]
  })

  // Hero stats
  const stats = [
    ['5', 'Years Experience', '', 0, 0],
    ['20', 'Projects Completed', '+', 0, 1],
    ['15', 'Technologies', '+', 0, 2],
    ['AWS', 'Certified', '', 1, 3],
  ]
  for (const [value, label, suffix, isStatic, sortOrder] of stats) {
    await db.execute({
      sql: `INSERT INTO hero_stats (value, label, suffix, is_static, sort_order) VALUES (?, ?, ?, ?, ?)`,
      args: [value, label, suffix, isStatic, sortOrder]
    })
  }

  // Skill categories
  const skillCategories = [
    {
      name: 'Frontend',
      icon: 'monitor',
      proficiency: 90,
      tags: ['Vue.js', 'Nuxt.js', 'React.js', 'JavaScript (ES6+)', 'TypeScript', 'Vuetify', 'Vite', 'Webpack']
    },
    {
      name: 'Backend',
      icon: 'server',
      proficiency: 85,
      tags: ['Java', 'Spring Boot', 'Spring Web (REST APIs)', 'Spring Data JPA', 'Spring Security', 'Node.js', 'RESTful APIs', 'Supabase']
    },
    {
      name: 'Database',
      icon: 'database',
      proficiency: 80,
      tags: ['Oracle Database', 'PostgreSQL', 'MySQL', 'MongoDB', 'SQL', 'PL/SQL']
    },
    {
      name: 'DevOps & CI/CD',
      icon: 'settings',
      proficiency: 75,
      tags: ['Docker', 'Jenkins', 'Git', 'SonarQube', 'GitHub Actions', 'PM2', 'JFrog', 'CI/CD pipelines']
    },
    {
      name: 'Integration & Automation',
      icon: 'wrench',
      proficiency: 80,
      tags: ['n8n', 'Postman', 'Talend TOS', 'AI API integration (LLMs)']
    },
    {
      name: 'Cloud & Infrastructure',
      icon: 'cloud',
      proficiency: 70,
      tags: ['AWS', 'GCP', 'Cloudflare (CDN, DNS, Security)']
    },
    {
      name: 'Project & IT Management',
      icon: 'users',
      proficiency: 80,
      tags: ['Jira', 'GLPI', 'Agile / Scrum']
    }
  ]

  for (let i = 0; i < skillCategories.length; i++) {
    const cat = skillCategories[i]
    await db.execute({
      sql: `INSERT INTO skill_categories (name, icon, proficiency, sort_order) VALUES (?, ?, ?, ?)`,
      args: [cat.name, cat.icon, cat.proficiency, i]
    })
    const catIdResult = await db.execute(`SELECT last_insert_rowid() as id`)
    const catId = catIdResult.rows[0]?.id as number
    for (let j = 0; j < cat.tags.length; j++) {
      await db.execute({
        sql: `INSERT INTO skill_tags (category_id, name, sort_order) VALUES (?, ?, ?)`,
        args: [catId, cat.tags[j], j]
      })
    }
  }

  // Experiences
  const experiences = [
    {
      company: 'TEAMWILL',
      role: 'IT Consultant (Cassiopae)',
      client: 'Volkswagen Financial Services',
      start_date: '07/2023',
      end_date: 'Present',
      location: 'Tunis, Tunisia',
      is_current: 1,
      responsibilities: [
        'Analyzed client needs on Cassiopae POS/MO/BO',
        'Designed technical and functional solutions',
        'Conducted quality analysis with SonarQube and security testing (PENTEST)',
        'Managed major upgrade: Cassiopae POS React 15 → React 16',
        'Managed client releases and built deliverables'
      ],
      tech: ['Java 8', 'Spring Framework', 'React.js', 'JavaScript', 'REST APIs', 'Oracle DB', 'SQL', 'Maven', 'Git', 'Jenkins', 'SonarQube', 'Jira']
    },
    {
      company: 'DATA-TRICKS',
      role: 'IT Consultant (Cassiopae)',
      client: 'Olinn/CALEF (Talend Migration)',
      start_date: '04/2022',
      end_date: '06/2023',
      location: 'LAC 1, Tunisia',
      is_current: 0,
      responsibilities: [
        'Developed Cassup: add-on application for Cassiopae',
        'Project Olinn/CALEF: Data migration with Talend ETL',
        'Built reusable NuxtJS components, implemented SSO/OAuth2',
        'Managed app state with Vuex, deployed via CI/CD, monitored with PM2',
        'Mentored intern engineers'
      ],
      tech: ['Java', 'Spring', 'Vue.js', 'Nuxt.js', 'JavaScript', 'Talend ETL', 'SQL', 'Docker', 'PM2', 'Jenkins', 'SonarQube', 'Git', 'GLPI', 'REST APIs', 'Oracle DB']
    },
    {
      company: 'FORSYSLAB',
      role: 'Full Stack Developer',
      client: 'Kanopiiis, RASA Chatbot',
      start_date: '03/2020',
      end_date: '03/2022',
      location: 'LAC 2, Tunisia',
      is_current: 0,
      responsibilities: [
        'Developed and integrated RASA chatbot module',
        'Designed and tested Kanopiiis solution',
        'Built frontend modules with Vue.js, created UI/UX mockups',
        'Managed project technically and supervised Git workflows'
      ],
      tech: ['Java', 'Spring', 'Jhipster', 'Nuxt.js', 'Vue.js', 'JavaScript', 'Vuetify', 'REST APIs', 'Git', 'MongoDB', 'ElasticSearch', 'RASA Chatbot', 'Docker', 'GCP', 'AWS', 'K8S']
    },
    {
      company: 'TELNET',
      role: 'End-of-Studies Internship',
      client: '',
      start_date: '01/2017',
      end_date: '05/2017',
      location: 'Tunisia',
      is_current: 0,
      responsibilities: [
        'Designed embedded web server on ERIKA OS (AURIX TC234 LP)',
        'Ported and deployed ERIKA OS on AURIX TC234 platform',
        'Developed graphical interface for embedded systems'
      ],
      tech: ['Embedded C', 'UART', 'CAN Bus', 'GPIO', 'Git', 'TCP/IP', 'ERIKA OS']
    }
  ]

  for (let i = 0; i < experiences.length; i++) {
    const exp = experiences[i]
    await db.execute({
      sql: `INSERT INTO experiences (company, role, client, start_date, end_date, location, is_current, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [exp.company, exp.role, exp.client, exp.start_date, exp.end_date, exp.location, exp.is_current, i]
    })
    const expIdResult = await db.execute(`SELECT last_insert_rowid() as id`)
    const expId = expIdResult.rows[0]?.id as number
    for (let j = 0; j < exp.responsibilities.length; j++) {
      await db.execute({
        sql: `INSERT INTO experience_responsibilities (experience_id, text, sort_order) VALUES (?, ?, ?)`,
        args: [expId, exp.responsibilities[j], j]
      })
    }
    for (const t of exp.tech) {
      await db.execute({
        sql: `INSERT INTO experience_tech (experience_id, name) VALUES (?, ?)`,
        args: [expId, t]
      })
    }
  }

  // Projects
  const projects = [
    {
      title: 'Khazinti',
      category: 'mobile',
      description: 'Personal finance management app built with Expo/React Native/TypeScript',
      problem: 'Managing personal budgets across multiple accounts was manual and error-prone.',
      solution: 'Cross-platform mobile app with real-time expense tracking and category analytics.',
      business_impact: 'Streamlined budget management and eliminated manual spreadsheets for users.',
      status: 'completed',
      github_url: 'https://github.com/Medkhalilbs',
      demo_url: '',
      features: ['Real-time expense tracking', 'Category analytics & visualization', 'Multi-account management', 'Offline SQLite storage'],
      tech: ['React Native', 'Expo', 'TypeScript', 'SQLite']
    },
    {
      title: 'MX-Sentinel',
      category: 'security',
      description: 'Security monitoring and vulnerability tracking tool',
      problem: 'Security hotspots in codebases needed systematic tracking and prioritization.',
      solution: 'Dashboard for vulnerability assessment with severity scoring and review workflows.',
      business_impact: 'Empowered engineering teams to address security vulnerabilities before deployments.',
      status: 'in-progress',
      github_url: 'https://github.com/Medkhalilbs',
      demo_url: '',
      features: ['Vulnerability hotspot scanning', 'Severity scoring matrices', 'Review and approval workflows', 'Centralized dashboard metrics'],
      tech: ['Vue.js', 'Node.js', 'Express', 'SQL']
    },
    {
      title: 'Artemis II FAQ',
      category: 'web',
      description: 'Interactive FAQ web application for Artemis II mission',
      problem: 'Complex space mission information needed an engaging, accessible presentation.',
      solution: 'Interactive web experience with 3D elements and structured FAQ navigation.',
      business_impact: 'Engaged public and space enthusiasts with immersive digital experiences.',
      status: 'completed',
      github_url: 'https://github.com/Medkhalilbs',
      demo_url: '',
      features: ['Interactive FAQ navigation map', '3D scene integration (Three.js)', 'Responsive search index', 'Modern visual interfaces'],
      tech: ['React', 'Three.js', 'TypeScript', 'WebGL']
    },
    {
      title: 'n8n Automation',
      category: 'automation',
      description: 'Workflow automation and API integration system',
      problem: 'Manual API integrations between services were time-consuming and fragile.',
      solution: 'Automated workflow pipelines using n8n for API orchestration and data sync.',
      business_impact: 'Eliminated 90% of manual data sync overhead between SaaS products.',
      status: 'completed',
      github_url: '',
      demo_url: '',
      features: ['n8n workflow pipelines', 'API orchestration layer', 'Data synchronization workflows', 'AI API integration (LLMs)'],
      tech: ['n8n', 'REST APIs', 'AI/LLM APIs']
    }
  ]

  for (let i = 0; i < projects.length; i++) {
    const proj = projects[i]
    await db.execute({
      sql: `INSERT INTO projects (title, category, description, problem, solution, business_impact, status, github_url, demo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [proj.title, proj.category, proj.description, proj.problem, proj.solution, proj.business_impact, proj.status, proj.github_url, proj.demo_url, i]
    })
    const projIdResult = await db.execute(`SELECT last_insert_rowid() as id`)
    const projId = projIdResult.rows[0]?.id as number
    for (let j = 0; j < proj.features.length; j++) {
      await db.execute({
        sql: `INSERT INTO project_features (project_id, text, sort_order) VALUES (?, ?, ?)`,
        args: [projId, proj.features[j], j]
      })
    }
    for (const t of proj.tech) {
      await db.execute({
        sql: `INSERT INTO project_tech (project_id, name) VALUES (?, ?)`,
        args: [projId, t]
      })
    }
  }

  // Education
  const education = [
    {
      school: 'ESPRIT',
      degree: 'National Diploma in Computer Engineering, Software Engineering',
      start_year: '2017',
      end_year: '2020',
      description: 'Transitioned to software engineering, mastering full-stack development, enterprise architectures, and modern web frameworks.'
    },
    {
      school: 'ISTIC',
      degree: 'Bachelor of Applied Science in Industrial Computing, Embedded Systems',
      start_year: '2014',
      end_year: '2017',
      description: 'Built a strong foundation in embedded systems, low-level programming, and hardware-software integration before pivoting to web development.'
    }
  ]

  for (let i = 0; i < education.length; i++) {
    const edu = education[i]
    await db.execute({
      sql: `INSERT INTO education (school, degree, start_year, end_year, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      args: [edu.school, edu.degree, edu.start_year, edu.end_year, edu.description, i]
    })
  }

  // Tech stack
  const techStack = [
    ['Vue.js', 'leaf'], ['Nuxt.js', 'mountain'], ['React.js', 'atom'], ['TypeScript', 'braces'], ['JavaScript', 'code'],
    ['Java', 'coffee'], ['Spring Boot', 'leaf'], ['Docker', 'box'], ['Jenkins', 'circle-dot'], ['Git', 'git-branch'],
    ['n8n', 'arrow-right-left'], ['AWS', 'cloud'], ['GCP', 'cloud'], ['Cloudflare', 'shield'], ['Oracle Database', 'database'],
    ['PostgreSQL', 'database'], ['MongoDB', 'database'], ['SonarQube', 'shield'], ['Jira', 'check-square'], ['Talend TOS', 'arrow-right-left']
  ]
  for (let i = 0; i < techStack.length; i++) {
    const [name, icon] = techStack[i]
    await db.execute({
      sql: `INSERT INTO tech_stack (name, icon, sort_order) VALUES (?, ?, ?)`,
      args: [name, icon, i]
    })
  }

  // Why Work With Me
  const whyCards = [
    ['Full-Stack Depth', 'From embedded C to cloud architecture, I understand systems at every layer.', 'cpu'],
    ['Enterprise Experience', '5 years building and maintaining software for Volkswagen Financial Services and other enterprise clients.', 'building'],
    ['Quality-First Mindset', 'SonarQube analysis, PENTEST security testing, and CI/CD pipelines built into every delivery.', 'shield'],
    ['Bilingual & Global', 'Arabic (native), French (fluent), English (proficient) — bridging teams across cultures.', 'globe']
  ]
  for (let i = 0; i < whyCards.length; i++) {
    const [title, description, icon] = whyCards[i]
    await db.execute({
      sql: `INSERT INTO why_work_with_me (title, description, icon, sort_order) VALUES (?, ?, ?, ?)`,
      args: [title, description, icon, i]
    })
  }

  // Certifications
  await db.execute({
    sql: `INSERT INTO certifications (name, issuer, description, verified, sort_order, status, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: ['AWS Certified Cloud Practitioner', 'Amazon Web Services', 'Foundational certification demonstrating cloud knowledge across AWS services, security, architecture, and pricing.', 1, 0, 'active', 0]
  })

  console.log('✅ Database seeded with new portfolio data')
}
