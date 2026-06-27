import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/education — public
router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT * FROM education ORDER BY sort_order ASC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// POST /api/education — admin
router.post('/', requireAuth, async (req, res) => {
  const { school, degree, start_year, end_year, description, sort_order } = req.body
  if (!school || !degree) return res.status(400).json({ error: 'school and degree required' })
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO education (school, degree, start_year, end_year, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [school, degree, start_year || '', end_year || '', description || '', sort_order || 0]
  })
  res.status(201).json({ ok: true })
})

// PATCH /api/education/:id — admin
router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['school', 'degree', 'start_year', 'end_year', 'description', 'sort_order']
  const updates: string[] = []
  const values: any[] = []
  for (const key of allowed) {
    if (key in req.body) { updates.push(`${key} = ?`); values.push(req.body[key]) }
  }
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
  values.push(req.params.id)
  const db = getDb()
  await db.execute({ sql: `UPDATE education SET ${updates.join(', ')} WHERE id = ?`, args: values })
  res.json({ ok: true })
})

// DELETE /api/education/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM education WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
