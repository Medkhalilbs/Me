import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

router.get('/', async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT * FROM testimonials ORDER BY sort_order ASC`)
  res.json(result.rows.map(r => ({ ...r })))
})

router.post('/', requireAuth, async (req, res) => {
  const { author_name, author_role, author_company, avatar_initials, text, sort_order } = req.body
  if (!author_name || !text) return res.status(400).json({ error: 'author_name and text required' })
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO testimonials (author_name, author_role, author_company, avatar_initials, text, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
    args: [author_name, author_role || '', author_company || '', avatar_initials || '', text, sort_order || 0]
  })
  res.status(201).json({ ok: true })
})

router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['author_name', 'author_role', 'author_company', 'avatar_initials', 'text', 'sort_order']
  const updates: string[] = []
  const values: any[] = []
  for (const key of allowed) {
    if (key in req.body) { updates.push(`${key} = ?`); values.push(req.body[key]) }
  }
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
  values.push(req.params.id)
  const db = getDb()
  await db.execute({ sql: `UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`, args: values })
  res.json({ ok: true })
})

router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM testimonials WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
