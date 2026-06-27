import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/languages — public (visible only)
router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT * FROM languages WHERE is_visible = 1 ORDER BY sort_order ASC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// GET /api/languages/admin — admin (all)
router.get('/admin', requireAuth, async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT * FROM languages ORDER BY sort_order ASC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// POST /api/languages — admin create
router.post('/', requireAuth, async (req, res) => {
  const { name, code, proficiency, sort_order, is_visible } = req.body
  if (!name || !code || !proficiency) {
    return res.status(400).json({ error: 'name, code and proficiency are required' })
  }
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO languages (name, code, proficiency, sort_order, is_visible) VALUES (?, ?, ?, ?, ?)`,
    args: [name, code.toLowerCase(), proficiency, sort_order ?? 0, is_visible !== undefined ? (is_visible ? 1 : 0) : 1]
  })
  res.status(201).json({ ok: true })
})

// PATCH /api/languages/:id — admin update
router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['name', 'code', 'proficiency', 'sort_order', 'is_visible']
  const updates: string[] = []
  const values: any[] = []
  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = ?`)
      values.push(key === 'is_visible' ? (req.body[key] ? 1 : 0) : req.body[key])
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
  values.push(req.params.id)
  const db = getDb()
  await db.execute({ sql: `UPDATE languages SET ${updates.join(', ')} WHERE id = ?`, args: values })
  res.json({ ok: true })
})

// DELETE /api/languages/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM languages WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
