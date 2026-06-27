import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PROFILE_IMG_DIR = path.resolve(__dirname, '../../data/images/profile')

if (!fs.existsSync(PROFILE_IMG_DIR)) {
  fs.mkdirSync(PROFILE_IMG_DIR, { recursive: true })
}

const profileStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, PROFILE_IMG_DIR),
  filename: (_req, _file, cb) => {
    const ext = path.extname(_file.originalname)
    cb(null, `profile_${Date.now()}${ext}`)
  },
})

const profileUpload = multer({
  storage: profileStorage,
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only JPEG, PNG, WebP, AVIF allowed'))
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
})

const router = Router()

// GET /api/profile — public
router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT id, name, title, location, email, phone, linkedin_url, github_url,
    hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text, profile_image_path FROM profile WHERE id = 1`)
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
  const profile = { ...result.rows[0] } as any
  profile.about_paragraphs = JSON.parse(profile.about_paragraphs as string)
  res.json(profile)
})

// GET /api/profile/check-path/:path — public check
router.get('/check-path/:path', async (req, res) => {
  const { path } = req.params
  const db = getDb()
  const result = await db.execute(`SELECT admin_secret_path FROM profile WHERE id = 1`)
  if (!result.rows[0]) return res.json({ valid: false })
  const actualPath = result.rows[0].admin_secret_path as string
  res.json({ valid: path === actualPath })
})

// GET /api/profile/admin — includes secret path + image path (admin only)
router.get('/admin', requireAuth, async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT id, name, title, location, email, phone, linkedin_url, github_url,
    hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text, admin_secret_path, profile_image_path FROM profile WHERE id = 1`)
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
  const profile = { ...result.rows[0] } as any
  profile.about_paragraphs = JSON.parse(profile.about_paragraphs as string)
  res.json(profile)
})

// POST /api/profile/upload-image — admin, upload profile photo
router.post('/upload-image', requireAuth, profileUpload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file uploaded' })

  const db = getDb()

  // Delete old image if it exists
  const existing = await db.execute(`SELECT profile_image_path FROM profile WHERE id = 1`)
  const oldFilename = existing.rows[0]?.profile_image_path as string | null
  if (oldFilename) {
    const oldPath = path.join(PROFILE_IMG_DIR, oldFilename)
    if (fs.existsSync(oldPath)) {
      try { fs.unlinkSync(oldPath) } catch (_) {}
    }
  }

  await db.execute({ sql: `UPDATE profile SET profile_image_path = ? WHERE id = 1`, args: [req.file.filename] })
  res.json({ ok: true, path: req.file.filename })
})

// DELETE /api/profile/image — admin, remove profile photo
router.delete('/image', requireAuth, async (_req, res) => {
  const db = getDb()
  const existing = await db.execute(`SELECT profile_image_path FROM profile WHERE id = 1`)
  const filename = existing.rows[0]?.profile_image_path as string | null
  if (filename) {
    const filePath = path.join(PROFILE_IMG_DIR, filename)
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath) } catch (_) {}
    }
  }
  await db.execute(`UPDATE profile SET profile_image_path = NULL WHERE id = 1`)
  res.json({ ok: true })
})

// PATCH /api/profile — admin only
router.patch('/', requireAuth, async (req, res) => {
  const db = getDb()
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
  await db.execute({ sql: `UPDATE profile SET ${updates.join(', ')} WHERE id = ?`, args: values })
  res.json({ ok: true })
})

export default router
