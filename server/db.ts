import initSqlJs, { Database } from 'sql.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import bcrypt from 'bcryptjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.resolve(__dirname, '../data')
const DB_PATH = path.join(DATA_DIR, 'portfolio.db')

let db: Database

export async function getDb(): Promise<Database> {
  if (db) return db

  const SQL = await initSqlJs()

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH)
    db = new SQL.Database(fileBuffer)
  } else {
    db = new SQL.Database()
  }

  initSchema()
  saveDb()

  return db
}

export function saveDb(): void {
  if (!db) return
  const data = db.export()
  fs.writeFileSync(DB_PATH, Buffer.from(data))
}

function initSchema(): void {
  db.run(`PRAGMA foreign_keys = ON;`)

  db.run(`
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
      admin_secret_path TEXT NOT NULL DEFAULT 'admin-mkbs-2026'
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS hero_stats (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      suffix TEXT NOT NULL DEFAULT '',
      is_static INTEGER NOT NULL DEFAULT 0,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS skill_categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'code',
      proficiency INTEGER NOT NULL DEFAULT 80,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS skill_tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (category_id) REFERENCES skill_categories(id) ON DELETE CASCADE
    );
  `)

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS experience_responsibilities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS experience_tech (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      experience_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
    );
  `)

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS project_features (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      text TEXT NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS project_tech (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `)

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS tech_stack (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'code',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS why_work_with_me (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL DEFAULT 'star',
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  db.run(`
    CREATE TABLE IF NOT EXISTS certifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      issuer TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      verified INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `)

  db.run(`
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

  db.run(`
    CREATE TABLE IF NOT EXISTS cvs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      language TEXT NOT NULL,
      filename TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_default INTEGER NOT NULL DEFAULT 0,
      uploaded_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `)

  db.run(`
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

  // Seed if empty
  const count = db.exec(`SELECT COUNT(*) as c FROM profile`)[0]?.values[0][0]
  if (count === 0) {
    seedData()
  }
}

function seedData(): void {
  const hash = bcrypt.hashSync('mkbs@admin2026', 10)

  const aboutParagraphs = JSON.stringify([
    'Passionate Full Stack Software Engineer with nearly five years of experience designing, developing, and maintaining scalable web applications. Experienced in frontend, backend, DevOps, CI/CD, authentication systems, cloud technologies, and enterprise software.',
    'Strong ability to understand business requirements and transform them into reliable software solutions. Interested in remote opportunities, freelance projects, and international positions.',
    'My journey began in embedded systems, where I learned the fundamentals of low-level programming and hardware communication. This foundation shaped my attention to detail and performance-conscious mindset, which I now bring to full-stack web development.',
  ])

  db.run(`INSERT INTO profile (id, name, title, location, email, phone, linkedin_url, github_url, hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text, admin_password_hash, admin_secret_path)
    VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [
    'Mohamed Khalil Ben Sedrine',
    'Full Stack Software Engineer',
    'Tunisia',
    'medkhalilbs@gmail.com',
    '+216 54 037 360',
    'https://linkedin.com/in/mk-bs',
    'https://github.com/Medkhalilbs',
    'Building Reliable Software That Solves Real Business Problems',
    'Full Stack Software Engineer with 5 years of experience building scalable web applications. Based in Tunisia, open to remote and international opportunities.',
    'Available for remote & international opportunities',
    aboutParagraphs,
    'From Embedded Systems to Full-Stack Engineering',
    'My background in embedded systems gave me a unique perspective on performance, optimization, and system-level thinking that I now apply to building scalable web applications.',
    hash,
    'admin-mkbs-2026',
  ])

  // Hero stats
  const stats = [
    ['5', 'Years Experience', '', 0],
    ['20', 'Projects Completed', '+', 0],
    ['10', 'Technologies Mastered', '+', 0],
    ['AWS', 'Certified', '', 1],
  ]
  stats.forEach(([value, label, suffix, isStatic], i) => {
    db.run(`INSERT INTO hero_stats (value, label, suffix, is_static, sort_order) VALUES (?, ?, ?, ?, ?)`,
      [value, label, suffix, isStatic, i])
  })

  // Skill categories
  const skillCategories = [
    ['Frontend', 'monitor', 90, ['Vue.js', 'Nuxt.js', 'React.js', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind CSS', 'Vuetify', 'Vite', 'Webpack']],
    ['Backend', 'server', 85, ['Node.js', 'Express', 'Java', 'Spring Boot', 'REST APIs', 'Spring Security', 'Authentication', 'OAuth2', 'SSO', 'JWT', 'Supabase']],
    ['Database', 'database', 80, ['Oracle', 'PostgreSQL', 'MySQL', 'MongoDB', 'SQL', 'PL/SQL']],
    ['DevOps & CI/CD', 'settings', 75, ['Docker', 'Jenkins', 'Git', 'SonarQube', 'GitHub Actions', 'PM2', 'JFrog', 'CI/CD']],
    ['Cloud & Infrastructure', 'cloud', 70, ['AWS', 'GCP', 'Cloudflare']],
    ['Tools & Integration', 'wrench', 80, ['Git', 'GitLab', 'GitHub', 'Postman', 'Talend', 'n8n', 'AI APIs', 'Jira', 'GLPI', 'Agile/Scrum']],
  ]
  skillCategories.forEach(([name, icon, proficiency, tags], i) => {
    db.run(`INSERT INTO skill_categories (name, icon, proficiency, sort_order) VALUES (?, ?, ?, ?)`,
      [name as string, icon as string, proficiency as number, i])
    const catId = db.exec(`SELECT last_insert_rowid() as id`)[0].values[0][0] as number
    ;(tags as string[]).forEach((tag, j) => {
      db.run(`INSERT INTO skill_tags (category_id, name, sort_order) VALUES (?, ?, ?)`, [catId, tag, j])
    })
  })

  // Experiences
  const experiences = [
    {
      company: 'Teamwill', role: 'Software Engineer / IT Consultant — Cassiopae',
      client: 'Volkswagen Financial Services', start_date: 'Jul 2023', end_date: '', location: 'Tunis, Tunisia', is_current: 1,
      responsibilities: [
        'Developed enterprise financial software for Volkswagen Financial Services',
        'Worked on Cassiopae POS, Middle Office, and Back Office modules',
        'Developed REST APIs and implemented OAuth2 authentication',
        'Performed major upgrades including React 15 to React 16 transition',
        'Conducted validation tests and documented technical configurations',
        'Collaborated in Agile teams and managed client releases',
      ],
      tech: ['Java', 'Spring Framework', 'React.js', 'JavaScript', 'REST APIs', 'Oracle', 'SQL', 'Maven', 'Git', 'Jenkins', 'SonarQube', 'Jira'],
    },
    {
      company: 'Data-Tricks', role: 'IT Consultant — Cassiopae',
      client: 'CALEF / OLINN (Cassup, Talend Migration)', start_date: 'Apr 2022', end_date: 'Jun 2023', location: 'LAC 1, Tunisia', is_current: 0,
      responsibilities: [
        'Designed and developed Cassup: an add-on application for Cassiopae',
        'Implemented SSO and OAuth2 authentication, REST APIs',
        'Created reusable components with NuxtJS for code modularity',
        'Migrated Talend ETL jobs and executed data migration for Olinn/CALEF',
        'Configured CI/CD pipelines and PM2 for instance management',
        'Set up GLPI IT asset management and mentored intern engineers',
      ],
      tech: ['Java', 'Spring Framework', 'Vue.js', 'Nuxt.js', 'JavaScript', 'Talend ETL', 'Docker', 'PM2', 'Jenkins', 'Git', 'GLPI', 'Oracle'],
    },
    {
      company: 'Forsyslab', role: 'Full Stack Developer',
      client: 'Kanopiiis, RASA Chatbot', start_date: 'Mar 2020', end_date: 'Mar 2022', location: 'LAC 2, Tunisia', is_current: 0,
      responsibilities: [
        'Designed, developed, and tested the Kanopiiis solution',
        'Developed and integrated a chatbot module based on RASA',
        'Built frontend modules with Vue.js and created UI/UX mockups',
        'Managed project technically and supervised Git workflows',
        'Documented B2B requirements and tracked progress via JIRA',
        'Provided support and coordination among project stakeholders',
      ],
      tech: ['Java', 'Spring Framework', 'JHipster', 'Vue.js', 'Nuxt.js', 'MongoDB', 'ElasticSearch', 'RASA', 'Docker', 'GCP', 'AWS', 'K8s'],
    },
    {
      company: 'Telnet', role: 'End-of-Studies Internship — Embedded Systems',
      client: '', start_date: 'Jan 2017', end_date: 'May 2017', location: 'Tunisia', is_current: 0,
      responsibilities: [
        'Designed an embedded web server running ERIKA OS on AURIX TC234 LP',
        'Ported and deployed ERIKA OS on the AURIX TC234 platform',
        'Studied bus technology and communication protocols',
        'Developed a graphical interface optimized for embedded systems',
      ],
      tech: ['Embedded C', 'UART', 'CAN Bus', 'GPIO', 'ERIKA OS', 'TCP/IP', 'Git'],
    },
  ]
  experiences.forEach((exp, i) => {
    db.run(`INSERT INTO experiences (company, role, client, start_date, end_date, location, is_current, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [exp.company, exp.role, exp.client, exp.start_date, exp.end_date, exp.location, exp.is_current, i])
    const expId = db.exec(`SELECT last_insert_rowid() as id`)[0].values[0][0] as number
    exp.responsibilities.forEach((r, j) => {
      db.run(`INSERT INTO experience_responsibilities (experience_id, text, sort_order) VALUES (?, ?, ?)`, [expId, r, j])
    })
    exp.tech.forEach(t => {
      db.run(`INSERT INTO experience_tech (experience_id, name) VALUES (?, ?)`, [expId, t])
    })
  })

  // Projects
  const projects = [
    {
      title: 'Volkswagen Financial Services',
      category: 'enterprise',
      description: 'Enterprise financial management platform built on Cassiopae. Worked on POS, Middle Office, and Back Office modules with OAuth2 authentication and large-scale enterprise architecture.',
      problem: 'Complex multi-tier financial operations needed a unified, secure platform.',
      solution: 'Built on Cassiopae with OAuth2 authentication, REST APIs, and modular office systems.',
      business_impact: 'Enabled Volkswagen Financial Services to manage financial operations across multiple office tiers with secure, auditable workflows.',
      status: 'completed',
      github_url: '', demo_url: '',
      features: ['Point of Sale (POS) system', 'Middle Office & Back Office modules', 'OAuth2 secure authentication', 'React 15 to React 16 upgrade'],
      tech: ['Java', 'Spring Boot', 'React.js', 'Oracle', 'OAuth2', 'Docker'],
    },
    {
      title: 'Cassup',
      category: 'web',
      description: 'Equipment leasing management platform built as an add-on for Cassiopae. Developed for CALEF / OLINN with customer management, contracts, workflows, and reporting.',
      problem: 'Manual equipment leasing processes were inefficient and error-prone.',
      solution: 'Built a centralized platform with SSO, automated workflows, and real-time reporting.',
      business_impact: 'Streamlined equipment leasing operations for CALEF/OLINN, replacing manual processes with a centralized, automated platform.',
      status: 'completed',
      github_url: '', demo_url: '',
      features: ['Customer & contract management', 'Workflow automation', 'Reporting & analytics', 'SSO & OAuth2 authentication', 'REST APIs'],
      tech: ['Vue.js', 'Nuxt.js', 'Node.js', 'Express', 'MongoDB', 'SSO', 'PM2'],
    },
    {
      title: 'Talend Migration',
      category: 'data',
      description: 'Migration of ETL processes to modernized Talend Open Studio jobs. Improved maintainability, reduced technical debt, and ensured data compliance across migrated datasets.',
      problem: 'Legacy ETL jobs were unmaintainable and accumulating technical debt.',
      solution: 'Migrated and modernized all ETL jobs with validation and compliance checks.',
      business_impact: 'Reduced technical debt and improved maintainability of data pipelines, ensuring reliable and compliant data migration for Olinn/CALEF.',
      status: 'completed',
      github_url: '', demo_url: '',
      features: ['ETL job migration & optimization', 'Data validation & compliance checks', 'Technical specifications documentation', 'Anomaly analysis & resolution'],
      tech: ['Talend ETL', 'SQL', 'Oracle', 'Data Migration'],
    },
    {
      title: 'Enterprise Authentication System',
      category: 'enterprise',
      description: 'Designed and implemented enterprise-grade authentication with OAuth2, SSO, and JWT. Secured REST APIs across multiple applications with centralized identity management.',
      problem: 'Multiple apps had siloed authentication causing friction and security gaps.',
      solution: 'Centralized identity with OAuth2, SSO, and JWT across all applications.',
      business_impact: 'Centralized authentication reduced login friction across platforms while maintaining enterprise-grade security compliance.',
      status: 'completed',
      github_url: '', demo_url: '',
      features: ['OAuth2 authorization flows', 'Single Sign-On (SSO) across apps', 'JWT token management', 'Secured REST API endpoints'],
      tech: ['OAuth2', 'SSO', 'JWT', 'Spring Security', 'REST APIs'],
    },
    {
      title: 'RASA Chatbot',
      category: 'ai',
      description: 'Conversational assistant integrated into a Vue.js application. Built on RASA NLP framework to handle user queries, provide automated responses, and route complex requests.',
      problem: 'Manual support overhead was high due to repetitive user queries.',
      solution: 'Integrated RASA NLP-powered chatbot with context-aware automated responses.',
      business_impact: 'Reduced manual support overhead by automating common user queries with an intelligent, always-available conversational interface.',
      status: 'completed',
      github_url: '', demo_url: '',
      features: ['Natural language understanding', 'Vue.js chat interface', 'Automated query routing', 'Context-aware responses'],
      tech: ['RASA', 'Vue.js', 'Python', 'NLP', 'REST APIs'],
    },
  ]
  projects.forEach((proj, i) => {
    db.run(`INSERT INTO projects (title, category, description, problem, solution, business_impact, status, github_url, demo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [proj.title, proj.category, proj.description, proj.problem, proj.solution, proj.business_impact, proj.status, proj.github_url, proj.demo_url, i])
    const projId = db.exec(`SELECT last_insert_rowid() as id`)[0].values[0][0] as number
    proj.features.forEach((f, j) => {
      db.run(`INSERT INTO project_features (project_id, text, sort_order) VALUES (?, ?, ?)`, [projId, f, j])
    })
    proj.tech.forEach(t => {
      db.run(`INSERT INTO project_tech (project_id, name) VALUES (?, ?)`, [projId, t])
    })
  })

  // Education
  const education = [
    { school: 'ESPRIT', degree: 'National Diploma in Computer Engineering, Software Engineering — Tunisia', start_year: '2017', end_year: '2020', description: 'Transitioned to software engineering, mastering full-stack development, enterprise architectures, and modern web frameworks.' },
    { school: 'ISTIC', degree: 'Bachelor of Applied Science, Industrial Computing, Embedded Systems — University of Carthage', start_year: '2014', end_year: '2017', description: 'Built a strong foundation in embedded systems, low-level programming, and hardware-software integration before pivoting to web development.' },
  ]
  education.forEach((edu, i) => {
    db.run(`INSERT INTO education (school, degree, start_year, end_year, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [edu.school, edu.degree, edu.start_year, edu.end_year, edu.description, i])
  })

  // Tech stack
  const techStack = [
    ['React', 'atom'], ['Vue.js', 'leaf'], ['Nuxt.js', 'mountain'], ['TypeScript', 'braces'], ['JavaScript', 'code'],
    ['Tailwind CSS', 'wind'], ['Node.js', 'server'], ['Java', 'coffee'], ['Spring Boot', 'leaf'], ['Oracle', 'database'],
    ['PostgreSQL', 'database'], ['MongoDB', 'database'], ['Docker', 'box'], ['Git', 'git-branch'], ['Jenkins', 'circle-dot'],
    ['AWS', 'cloud'], ['GCP', 'cloud'], ['Cloudflare', 'shield'], ['Jira', 'check-square'], ['Talend', 'arrow-right-left'],
  ]
  techStack.forEach(([name, icon], i) => {
    db.run(`INSERT INTO tech_stack (name, icon, sort_order) VALUES (?, ?, ?)`, [name, icon, i])
  })

  // Why Work With Me
  const whyCards = [
    ['Problem Solver', 'I thrive on breaking down complex problems into clean, manageable solutions that deliver real value.', 'puzzle'],
    ['Clean Architecture', 'I design systems with separation of concerns, modularity, and maintainability at the core.', 'layout'],
    ['Scalable Applications', 'I build software that grows with your business — from MVP to enterprise-scale without rewrites.', 'trending-up'],
    ['Fast Learner', 'I quickly absorb new technologies, frameworks, and domain knowledge to hit the ground running.', 'zap'],
    ['Team Player', 'I collaborate effectively in Agile teams, mentor junior developers, and communicate clearly with stakeholders.', 'users'],
    ['Business Understanding', 'I bridge the gap between technical implementation and business goals, ensuring software serves real needs.', 'target'],
    ['Enterprise Experience', '5 years building software for enterprise clients like Volkswagen Financial Services with rigorous standards.', 'building'],
  ]
  whyCards.forEach(([title, description, icon], i) => {
    db.run(`INSERT INTO why_work_with_me (title, description, icon, sort_order) VALUES (?, ?, ?, ?)`, [title, description, icon, i])
  })

  // Certifications
  db.run(`INSERT INTO certifications (name, issuer, description, verified, sort_order) VALUES (?, ?, ?, ?, ?)`,
    ['AWS Certified Cloud Practitioner', 'Amazon Web Services', 'Foundational certification demonstrating cloud knowledge across AWS services, security, architecture, and pricing.', 1, 0])

  // Testimonials (placeholders)
  const testimonials = [
    { author_name: 'Project Stakeholder', author_role: 'Project Manager', author_company: 'Volkswagen Financial Services', avatar_initials: 'PS', text: 'Khalil consistently delivered high-quality solutions on the Cassiopae platform. His ability to understand complex business requirements and translate them into reliable technical implementations made him a valuable asset to our team.' },
    { author_name: 'Team Lead', author_role: 'Technical Lead', author_company: 'Data-Tricks', avatar_initials: 'DT', text: 'A dedicated engineer who takes ownership of his work. Khalil built the Cassup add-on from the ground up, implementing complex authentication flows and creating reusable components that significantly improved our development velocity.' },
    { author_name: 'Colleague', author_role: 'Software Engineer', author_company: 'Forsyslab', avatar_initials: 'FL', text: 'Khalil\'s transition from embedded systems to full-stack development brought a unique perspective to our team. His performance-conscious mindset and attention to detail elevated the quality of everything we shipped.' },
  ]
  testimonials.forEach((t, i) => {
    db.run(`INSERT INTO testimonials (author_name, author_role, author_company, avatar_initials, text, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
      [t.author_name, t.author_role, t.author_company, t.avatar_initials, t.text, i])
  })

  saveDb()
  console.log('✅ Database seeded with portfolio data')
}
