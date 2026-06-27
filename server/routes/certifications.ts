import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/certifications — public (non-hidden only)
router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT * FROM certifications WHERE is_hidden = 0 ORDER BY sort_order ASC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// GET /api/certifications/admin — admin (all, including hidden)
router.get('/admin', requireAuth, async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT * FROM certifications ORDER BY sort_order ASC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// POST /api/certifications — admin create
router.post('/', requireAuth, async (req, res) => {
  const { name, issuer, description, verified, sort_order, status, is_hidden } = req.body
  if (!name || !issuer) return res.status(400).json({ error: 'name and issuer required' })
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO certifications (name, issuer, description, verified, sort_order, status, is_hidden) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [name, issuer, description || '', verified ? 1 : 1, sort_order || 0, status || 'active', is_hidden ? 1 : 0]
  })
  res.status(201).json({ ok: true })
})

// PATCH /api/certifications/:id — admin update
router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['name', 'issuer', 'description', 'verified', 'sort_order', 'status', 'is_hidden']
  const updates: string[] = []
  const values: any[] = []
  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = ?`)
      if (key === 'verified' || key === 'is_hidden') {
        values.push(req.body[key] ? 1 : 0)
      } else {
        values.push(req.body[key])
      }
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
  values.push(req.params.id)
  const db = getDb()
  await db.execute({ sql: `UPDATE certifications SET ${updates.join(', ')} WHERE id = ?`, args: values })
  res.json({ ok: true })
})

// DELETE /api/certifications/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM certifications WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
