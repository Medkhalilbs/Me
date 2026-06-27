import { Router } from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../cloudinary.js'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/cvs',
    allowed_formats: ['pdf'],
    resource_type: 'raw', // required for non-image files like PDF
  } as any,
})

const upload = multer({ storage: cvStorage })

const router = Router()

// GET /api/cvs — public (list available CVs)
router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT id, language, filename, is_default, uploaded_at FROM cvs ORDER BY uploaded_at DESC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// GET /api/cvs/download/:id — public, redirect to Cloudinary URL
router.get('/download/:id', async (req, res) => {
  const db = getDb()
  const result = await db.execute({ sql: `SELECT * FROM cvs WHERE id = ?`, args: [req.params.id] })
  if (!result.rows[0]) return res.status(404).json({ error: 'CV not found' })

  const cv = result.rows[0] as any
  // file_path now stores the full Cloudinary URL
  if (!cv.file_path) return res.status(404).json({ error: 'File not found' })
  res.redirect(cv.file_path)
})

// POST /api/cvs — admin upload
router.post('/', requireAuth, upload.single('cv'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

  const { language, is_default } = req.body
  if (!language) return res.status(400).json({ error: 'language is required (e.g., EN, FR)' })

  const db = getDb()

  if (is_default) {
    await db.execute(`UPDATE cvs SET is_default = 0`)
  }

  // req.file.originalname = original filename, req.file.path = Cloudinary URL
  await db.execute({
    sql: `INSERT INTO cvs (language, filename, file_path, is_default) VALUES (?, ?, ?, ?)`,
    args: [language.toUpperCase(), req.file.originalname, req.file.path, is_default ? 1 : 0]
  })
  res.status(201).json({ ok: true, filename: req.file.originalname, url: req.file.path })
})

// PATCH /api/cvs/:id/default — admin set as default
router.patch('/:id/default', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute(`UPDATE cvs SET is_default = 0`)
  await db.execute({ sql: `UPDATE cvs SET is_default = 1 WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

// DELETE /api/cvs/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  const result = await db.execute({ sql: `SELECT file_path FROM cvs WHERE id = ?`, args: [req.params.id] })

  if (result.rows[0]) {
    const url = result.rows[0].file_path as string
    try {
      // Extract public_id from Cloudinary URL for raw (PDF) resources
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+)$/)
      if (match) await cloudinary.uploader.destroy(match[1], { resource_type: 'raw' })
    } catch (_) {}
  }

  await db.execute({ sql: `DELETE FROM cvs WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
