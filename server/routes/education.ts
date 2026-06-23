import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

// GET /api/education — public
router.get('/', async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM education ORDER BY sort_order ASC`)
  if (!result[0]) return res.json([])
  res.json(result[0].values.map(row => rowToObj(result[0].columns, row)))
})

// POST /api/education — admin
router.post('/', requireAuth, async (req, res) => {
  const { school, degree, start_year, end_year, description, sort_order } = req.body
  if (!school || !degree) return res.status(400).json({ error: 'school and degree required' })
  const db = await getDb()
  db.run(`INSERT INTO education (school, degree, start_year, end_year, description, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [school, degree, start_year || '', end_year || '', description || '', sort_order || 0])
  saveDb()
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
  const db = await getDb()
  db.run(`UPDATE education SET ${updates.join(', ')} WHERE id = ?`, values)
  saveDb()
  res.json({ ok: true })
})

// DELETE /api/education/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM education WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
