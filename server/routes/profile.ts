import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/profile — public
router.get('/', async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT id, name, title, location, email, phone, linkedin_url, github_url,
    hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text FROM profile WHERE id = 1`)
  if (!result[0]) return res.status(404).json({ error: 'Not found' })
  const cols = result[0].columns
  const vals = result[0].values[0]
  const profile = Object.fromEntries(cols.map((c, i) => [c, vals[i]]))
  profile.about_paragraphs = JSON.parse(profile.about_paragraphs as string)
  res.json(profile)
})

// GET /api/profile/check-path/:path — public check
router.get('/check-path/:path', async (req, res) => {
  const { path } = req.params
  const db = await getDb()
  const result = db.exec(`SELECT admin_secret_path FROM profile WHERE id = 1`)
  if (!result[0] || !result[0].values[0]) return res.json({ valid: false })
  const actualPath = result[0].values[0][0] as string
  res.json({ valid: path === actualPath })
})

// GET /api/profile/admin — includes secret path (admin only)
router.get('/admin', requireAuth, async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT id, name, title, location, email, phone, linkedin_url, github_url,
    hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text, admin_secret_path FROM profile WHERE id = 1`)
  if (!result[0]) return res.status(404).json({ error: 'Not found' })
  const cols = result[0].columns
  const vals = result[0].values[0]
  const profile = Object.fromEntries(cols.map((c, i) => [c, vals[i]]))
  profile.about_paragraphs = JSON.parse(profile.about_paragraphs as string)
  res.json(profile)
})

// PATCH /api/profile — admin only
router.patch('/', requireAuth, async (req, res) => {
  const db = await getDb()
  const allowed = ['name', 'title', 'location', 'email', 'phone', 'linkedin_url', 'github_url',
    'hero_heading', 'hero_subtitle', 'hero_badge', 'about_paragraphs', 'callout_title', 'callout_text', 'admin_secret_path']

  const updates: string[] = []
  const values: any[] = []

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = ?`)
      values.push(key === 'about_paragraphs' ? JSON.stringify(req.body[key]) : req.body[key])
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields' })
  values.push(1)
  db.run(`UPDATE profile SET ${updates.join(', ')} WHERE id = ?`, values)
  saveDb()
  res.json({ ok: true })
})

export default router
