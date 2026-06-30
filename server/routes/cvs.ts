import { Router } from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../cloudinary.js'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

import util from 'util'

const cvStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/cvs',
    allowed_formats: ['pdf'],
    resource_type: 'raw', // required for non-image files like PDF
  } as any,
})

const upload = multer({
  storage: cvStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB max for PDFs
})

const router = Router()

// GET /api/cvs — public (list available CVs)
router.get('/', async (_req, res) => {
  try {
    const db = getDb()
    const result = await db.execute(`SELECT id, language, filename, is_default, uploaded_at FROM cvs ORDER BY uploaded_at DESC`)
    res.json(result.rows.map(r => ({ ...r })))
  } catch (err: any) {
    console.error('Error fetching CVs:', err)
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    })
  }
})

// GET /api/cvs/download/:id — public, redirect to Cloudinary URL
router.get('/download/:id', async (req, res) => {
  try {
    const db = getDb()
    const result = await db.execute({ sql: `SELECT * FROM cvs WHERE id = ?`, args: [req.params.id] })
    if (!result.rows[0]) return res.status(404).json({ error: 'CV not found' })

    const cv = result.rows[0] as any
    // file_path now stores the full Cloudinary URL
    if (!cv.file_path) return res.status(404).json({ error: 'File not found' })
    res.redirect(cv.file_path)
  } catch (err: any) {
    console.error('Error downloading CV:', err)
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    })
  }
})

// POST /api/cvs — admin upload
router.post('/', requireAuth, (req, res, next) => {
  upload.single('cv')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', util.inspect(err, { depth: null }))
      return res.status(500).json({ error: err?.message || String(err) })
    }
    next()
  })
}, async (req, res) => {
  console.log('--- CV Upload Debug ---')
  console.log('req.file:', req.file ? JSON.stringify(req.file) : 'No file received')
  console.log('req.body:', JSON.stringify(req.body))

  try {
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
  } catch (err: any) {
    console.error('CV upload error:', util.inspect(err, { depth: null }))
    res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : String(err)
    })
  }
})

// PATCH /api/cvs/:id/default — admin set as default
router.patch('/:id/default', requireAuth, async (req, res) => {
  try {
    const db = getDb()
    await db.execute(`UPDATE cvs SET is_default = 0`)
    await db.execute({ sql: `UPDATE cvs SET is_default = 1 WHERE id = ?`, args: [req.params.id] })
    res.json({ ok: true })
  } catch (err: any) {
    console.error('Error setting default CV:', err)
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    })
  }
})

// DELETE /api/cvs/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  try {
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
  } catch (err: any) {
    console.error('Error deleting CV:', err)
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    })
  }
})

export default router
