import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()
function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

router.get('/', async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM testimonials ORDER BY sort_order ASC`)
  if (!result[0]) return res.json([])
  res.json(result[0].values.map(row => rowToObj(result[0].columns, row)))
})

router.post('/', requireAuth, async (req, res) => {
  const { author_name, author_role, author_company, avatar_initials, text, sort_order } = req.body
  if (!author_name || !text) return res.status(400).json({ error: 'author_name and text required' })
  const db = await getDb()
  db.run(`INSERT INTO testimonials (author_name, author_role, author_company, avatar_initials, text, sort_order) VALUES (?, ?, ?, ?, ?, ?)`,
    [author_name, author_role || '', author_company || '', avatar_initials || '', text, sort_order || 0])
  saveDb()
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
  const db = await getDb()
  db.run(`UPDATE testimonials SET ${updates.join(', ')} WHERE id = ?`, values)
  saveDb()
  res.json({ ok: true })
})

router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM testimonials WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
