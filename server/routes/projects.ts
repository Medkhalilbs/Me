import { Router } from 'express'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../cloudinary.js'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

import util from 'util'

const projectStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'portfolio/projects',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  } as any,
})

const projectUpload = multer({
  storage: projectStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max for images
})

const router = Router()

// Helper: delete a Cloudinary image by its stored URL
async function deleteCloudinaryImage(url: string | null): Promise<void> {
  if (!url) return
  try {
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^.]+$/)
    if (match) await cloudinary.uploader.destroy(match[1])
  } catch (_) {}
}

// GET /api/projects — public
router.get('/', async (_req, res) => {
  const db = getDb()
  const projs = await db.execute(`SELECT * FROM projects ORDER BY sort_order ASC`)
  const feats = await db.execute(`SELECT * FROM project_features ORDER BY project_id, sort_order ASC`)
  const techs = await db.execute(`SELECT * FROM project_tech ORDER BY project_id ASC`)

  const result = projs.rows.map(proj => {
    const p = { ...proj } as any
    p.features = feats.rows
      .filter(f => f.project_id === proj.id)
      .map(f => ({ ...f }))
    p.tech = techs.rows
      .filter(t => t.project_id === proj.id)
      .map(t => t.name)
    return p
  })

  res.json(result)
})

// POST /api/projects — admin
router.post('/', requireAuth, async (req, res) => {
  const { title, category, description, problem, solution, business_impact, status, github_url, demo_url, sort_order, features, tech } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })

  const db = getDb()
  await db.execute({
    sql: `INSERT INTO projects (title, category, description, problem, solution, business_impact, status, github_url, demo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [title, category || 'web', description || '', problem || '', solution || '', business_impact || '', status || 'completed', github_url || '', demo_url || '', sort_order || 0]
  })
  const idResult = await db.execute(`SELECT last_insert_rowid() as id`)
  const projId = idResult.rows[0].id as number

  if (Array.isArray(features)) {
    for (let j = 0; j < features.length; j++) {
      await db.execute({
        sql: `INSERT INTO project_features (project_id, text, sort_order) VALUES (?, ?, ?)`,
        args: [projId, features[j], j]
      })
    }
  }
  if (Array.isArray(tech)) {
    for (const t of tech) {
      await db.execute({
        sql: `INSERT INTO project_tech (project_id, name) VALUES (?, ?)`,
        args: [projId, t]
      })
    }
  }

  res.status(201).json({ ok: true, id: projId })
})

// PATCH /api/projects/:id — admin
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const allowed = ['title', 'category', 'description', 'problem', 'solution', 'business_impact', 'status', 'github_url', 'demo_url', 'sort_order']
  const updates: string[] = []
  const values: any[] = []

  for (const key of allowed) {
    if (key in req.body) { updates.push(`${key} = ?`); values.push(req.body[key]) }
  }

  const db = getDb()

  if (updates.length) {
    values.push(id)
    await db.execute({ sql: `UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, args: values })
  }

  if (Array.isArray(req.body.features)) {
    await db.execute({ sql: `DELETE FROM project_features WHERE project_id = ?`, args: [id] })
    for (let j = 0; j < req.body.features.length; j++) {
      await db.execute({
        sql: `INSERT INTO project_features (project_id, text, sort_order) VALUES (?, ?, ?)`,
        args: [id, req.body.features[j], j]
      })
    }
  }

  if (Array.isArray(req.body.tech)) {
    await db.execute({ sql: `DELETE FROM project_tech WHERE project_id = ?`, args: [id] })
    for (const t of req.body.tech) {
      await db.execute({
        sql: `INSERT INTO project_tech (project_id, name) VALUES (?, ?)`,
        args: [id, t]
      })
    }
  }

  res.json({ ok: true })
})

// POST /api/projects/:id/upload-image — admin
router.post('/:id/upload-image', requireAuth, (req, res, next) => {
  projectUpload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Multer/Cloudinary error:', util.inspect(err, { depth: null }))
      return res.status(500).json({ error: err?.message || String(err) })
    }
    next()
  })
}, async (req, res) => {
  console.log('--- Project Upload Debug ---')
  console.log('req.file:', req.file ? JSON.stringify(req.file) : 'No file received')
  console.log('req.params.id:', req.params.id)

  try {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' })

    const { id } = req.params
    const db = getDb()

    // Delete old image from Cloudinary if exists
    const existing = await db.execute({ sql: `SELECT hero_image_path FROM projects WHERE id = ?`, args: [id] })
    await deleteCloudinaryImage(existing.rows[0]?.hero_image_path as string | null)

    // req.file.path = full Cloudinary URL
    await db.execute({ sql: `UPDATE projects SET hero_image_path = ? WHERE id = ?`, args: [req.file.path, id] })
    res.json({ ok: true, path: req.file.path })
  } catch (err: any) {
    console.error('Project image upload handler error:', util.inspect(err, { depth: null }))
    res.status(500).json({
      error: err instanceof Error ? err.message : String(err)
    })
  }
})

// DELETE /api/projects/:id/image — admin
router.delete('/:id/image', requireAuth, async (req, res) => {
  const { id } = req.params
  const db = getDb()

  const existing = await db.execute({ sql: `SELECT hero_image_path FROM projects WHERE id = ?`, args: [id] })
  await deleteCloudinaryImage(existing.rows[0]?.hero_image_path as string | null)

  await db.execute({ sql: `UPDATE projects SET hero_image_path = '' WHERE id = ?`, args: [id] })
  res.json({ ok: true })
})

// DELETE /api/projects/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  const existing = await db.execute({ sql: `SELECT hero_image_path FROM projects WHERE id = ?`, args: [req.params.id] })
  await deleteCloudinaryImage(existing.rows[0]?.hero_image_path as string | null)

  await db.execute({ sql: `DELETE FROM projects WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
