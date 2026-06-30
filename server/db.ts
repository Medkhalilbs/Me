import { createClient, type Client } from '@libsql/client'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

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

  // ─── Seed only on truly fresh/empty DB ────────────────────────────────────
  const profileResult = await db.execute(`SELECT COUNT(*) as c FROM profile`)
  const count = profileResult.rows[0]?.c as number ?? 0

  if (count === 0) {
    console.log('🌱 Fresh database detected — seeding default profile...')
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
    { name: 'Arabic',  code: 'AR', proficiency: 'native',       sort_order: 0, is_visible: 1 },
    { name: 'French',  code: 'FR', proficiency: 'fluent',        sort_order: 1, is_visible: 1 },
    { name: 'English', code: 'EN', proficiency: 'professional',  sort_order: 2, is_visible: 1 },
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
    { key: 'hero',            sort_order: 0  },
    { key: 'about',           sort_order: 1  },
    { key: 'languages',       sort_order: 2  },
    { key: 'skills',          sort_order: 3  },
    { key: 'experience',      sort_order: 4  },
    { key: 'projects',        sort_order: 5  },
    { key: 'education',       sort_order: 6  },
    { key: 'tech-stack',      sort_order: 7  },
    { key: 'certifications',  sort_order: 8  },
    { key: 'why-work-with-me',sort_order: 9  },
    { key: 'contact',         sort_order: 10 },
  ]
  for (const s of sections) {
    await db.execute({
      sql: `INSERT INTO section_settings (section_key, is_visible, sort_order) VALUES (?, 1, ?)`,
      args: [s.key, s.sort_order]
    })
  }
  console.log('✅ Section settings seeded')
}

// ─── seedData — inserts a single blank profile row on first boot ──────────────
async function seedData(): Promise<void> {
  const db = getDb()

  // Task 7: use env var password or generate a random one
  const envPassword = process.env.ADMIN_INITIAL_PASSWORD
  let passwordValue: string
  if (envPassword) {
    passwordValue = envPassword
  } else {
    passwordValue = crypto.randomBytes(12).toString('base64url')
    console.log('========================================')
    console.log(`Generated admin password (save this!): ${passwordValue}`)
    console.log('========================================')
  }
  const hash = bcrypt.hashSync(passwordValue, 10)

  const aboutParagraphs = JSON.stringify([
    'Tell your story here.',
    'Add more about yourself.',
  ])

  await db.execute({
    sql: `INSERT INTO profile (id, name, title, location, email, phone, linkedin_url, github_url,
            hero_heading, hero_subtitle, about_paragraphs, callout_title, callout_text,
            admin_password_hash, admin_secret_path)
          VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      process.env.DEFAULT_NAME     || 'Your Name',
      process.env.DEFAULT_TITLE    || 'Your Job Title',
      process.env.DEFAULT_LOCATION || 'Your City, Country',
      process.env.DEFAULT_EMAIL    || 'your.email@example.com',
      process.env.DEFAULT_PHONE    || '',
      process.env.DEFAULT_LINKEDIN || '',
      process.env.DEFAULT_GITHUB   || '',
      process.env.DEFAULT_HEADING  || 'Your Hero Heading',
      process.env.DEFAULT_SUBTITLE || 'Your hero subtitle goes here.',
      aboutParagraphs,
      process.env.DEFAULT_CALLOUT_TITLE || '',
      process.env.DEFAULT_CALLOUT_TEXT  || '',
      hash,
      process.env.ADMIN_PATH || 'admin',
    ]
  })

  console.log('✅ Default profile seeded — customize via admin panel or env vars')
}

// ─── Safe ALTER helper (ignores duplicate-column errors) ──────────────────────
async function safeAlter(sql: string): Promise<void> {
  const db = getDb()
  try {
    await db.execute(sql)
  } catch (e: any) {
    const msg: string = e?.message ?? ''
    if (msg.includes('duplicate column') || msg.includes('already exists')) return
    throw e
  }
}

// ─── Non-destructive column migrations (run every startup) ────────────────────
export async function runMigrations(): Promise<void> {
  // profile — content fields
  await safeAlter(`ALTER TABLE profile ADD COLUMN contact_heading TEXT DEFAULT NULL`)
  await safeAlter(`ALTER TABLE profile ADD COLUMN contact_subheading TEXT DEFAULT NULL`)
  await safeAlter(`ALTER TABLE profile ADD COLUMN contact_description TEXT DEFAULT NULL`)
  await safeAlter(`ALTER TABLE profile ADD COLUMN about_title TEXT DEFAULT NULL`)
  await safeAlter(`ALTER TABLE profile ADD COLUMN about_subtitle TEXT DEFAULT NULL`)

  // section_settings — editable heading metadata
  await safeAlter(`ALTER TABLE section_settings ADD COLUMN section_title TEXT DEFAULT NULL`)
  await safeAlter(`ALTER TABLE section_settings ADD COLUMN section_subtitle TEXT DEFAULT NULL`)
  await safeAlter(`ALTER TABLE section_settings ADD COLUMN section_badge TEXT DEFAULT NULL`)
}
