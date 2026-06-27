import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const UPLOAD_DIR = path.resolve(__dirname, '../../data/cvs')

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname)
    const ts = Date.now()
    cb(null, `cv_${ts}${ext}`)
  },
})

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(new Error('Only PDF files are allowed'))
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
})

const router = Router()

// GET /api/cvs — public (list available CVs)
router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT id, language, filename, is_default, uploaded_at FROM cvs ORDER BY uploaded_at DESC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// GET /api/cvs/download/:id — public download
router.get('/download/:id', async (req, res) => {
  const db = getDb()
  const result = await db.execute({ sql: `SELECT * FROM cvs WHERE id = ?`, args: [req.params.id] })
  if (!result.rows[0]) return res.status(404).json({ error: 'CV not found' })

  const cv = result.rows[0] as any
  const filePath = path.join(UPLOAD_DIR, cv.filename)

  if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found on disk' })
  res.download(filePath, cv.filename)
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

  await db.execute({
    sql: `INSERT INTO cvs (language, filename, file_path, is_default) VALUES (?, ?, ?, ?)`,
    args: [language.toUpperCase(), req.file.filename, req.file.path, is_default ? 1 : 0]
  })
  res.status(201).json({ ok: true, filename: req.file.filename })
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
  const result = await db.execute({ sql: `SELECT filename FROM cvs WHERE id = ?`, args: [req.params.id] })

  if (result.rows[0]) {
    const filename = result.rows[0].filename as string
    const filePath = path.join(UPLOAD_DIR, filename)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  }

  await db.execute({ sql: `DELETE FROM cvs WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
