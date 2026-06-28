import { Router } from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../cloudinary.js'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

import util from 'util'

const profileStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/profile',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  } as any,
})

const profileUpload = multer({ storage: profileStorage })

const router = Router()

// GET /api/profile — public
router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT id, name, title, location, email, phone, linkedin_url, github_url,
    hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text, profile_image_path,
    contact_heading, contact_subheading, contact_description, about_title, about_subtitle FROM profile WHERE id = 1`)
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
    hero_heading, hero_subtitle, hero_badge, about_paragraphs, callout_title, callout_text, admin_secret_path, profile_image_path,
    contact_heading, contact_subheading, contact_description, about_title, about_subtitle FROM profile WHERE id = 1`)
  if (!result.rows[0]) return res.status(404).json({ error: 'Not found' })
  const profile = { ...result.rows[0] } as any
  profile.about_paragraphs = JSON.parse(profile.about_paragraphs as string)
  res.json(profile)
})

// POST /api/profile/upload-image — admin, upload profile photo to Cloudinary
router.post('/upload-image', requireAuth, (req, res, next) => {
  profileUpload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', util.inspect(err, { depth: null }))
      return res.status(500).json({ error: err?.message || String(err) })
    }
    next()
  })
}, async (req, res) => {
  console.log('--- Profile Upload Debug ---')
  console.log('req.file:', req.file ? JSON.stringify(req.file) : 'No file received')

  try {
    if (!req.file) {
      console.log('No file received')
      return res.status(400).json({ error: 'No image file uploaded' })
    }

    const db = getDb()

    // Delete old image from Cloudinary if it exists
    const existing = await db.execute(`SELECT profile_image_path FROM profile WHERE id = 1`)
    const oldUrl = existing.rows[0]?.profile_image_path as string | null
    if (oldUrl) {
      try {
        // Extract public_id from the Cloudinary URL (everything after /upload/vXXX/)
        const match = oldUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
        if (match) await cloudinary.uploader.destroy(match[1])
      } catch (err) {
        console.error('Error destroying old profile image from Cloudinary:', util.inspect(err, { depth: null }))
      }
    }

    // req.file.path = full Cloudinary URL (https://res.cloudinary.com/...)
    await db.execute({ sql: `UPDATE profile SET profile_image_path = ? WHERE id = 1`, args: [req.file.path] })
    res.json({ ok: true, path: req.file.path })
  } catch (err: any) {
    console.error('Profile image upload handler error:', util.inspect(err, { depth: null }))
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    })
  }
})

// DELETE /api/profile/image — admin, remove profile photo from Cloudinary
router.delete('/image', requireAuth, async (_req, res) => {
  const db = getDb()
  const existing = await db.execute(`SELECT profile_image_path FROM profile WHERE id = 1`)
  const url = existing.rows[0]?.profile_image_path as string | null
  if (url) {
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
      if (match) await cloudinary.uploader.destroy(match[1])
    } catch (_) {}
  }
  await db.execute(`UPDATE profile SET profile_image_path = NULL WHERE id = 1`)
  res.json({ ok: true })
})

// PATCH /api/profile — admin only
router.patch('/', requireAuth, async (req, res) => {
  const db = getDb()
  const allowed = ['name', 'title', 'location', 'email', 'phone', 'linkedin_url', 'github_url',
    'hero_heading', 'hero_subtitle', 'hero_badge', 'about_paragraphs', 'callout_title', 'callout_text', 'admin_secret_path',
    'contact_heading', 'contact_subheading', 'contact_description', 'about_title', 'about_subtitle']

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
