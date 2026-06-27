import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/skills — public
router.get('/', async (_req, res) => {
  const db = getDb()
  const cats = await db.execute(`SELECT * FROM skill_categories ORDER BY sort_order ASC`)
  const tags = await db.execute(`SELECT * FROM skill_tags ORDER BY category_id, sort_order ASC`)

  const result = cats.rows.map(cat => {
    const c = { ...cat } as any
    c.tags = tags.rows
      .filter(t => t.category_id === cat.id)
      .map(t => ({ ...t }))
    return c
  })

  res.json(result)
})

// POST /api/skills/categories — admin
router.post('/categories', requireAuth, async (req, res) => {
  const { name, icon, proficiency, sort_order } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO skill_categories (name, icon, proficiency, sort_order) VALUES (?, ?, ?, ?)`,
    args: [name, icon || 'code', proficiency || 80, sort_order || 0]
  })
  res.status(201).json({ ok: true })
})

// PATCH /api/skills/categories/:id — admin
router.patch('/categories/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const allowed = ['name', 'icon', 'proficiency', 'sort_order']
  const updates: string[] = []
  const values: any[] = []
  for (const key of allowed) {
    if (key in req.body) { updates.push(`${key} = ?`); values.push(req.body[key]) }
  }
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
  values.push(id)
  const db = getDb()
  await db.execute({ sql: `UPDATE skill_categories SET ${updates.join(', ')} WHERE id = ?`, args: values })
  res.json({ ok: true })
})

// DELETE /api/skills/categories/:id — admin (cascades to tags)
router.delete('/categories/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM skill_categories WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

// POST /api/skills/tags — admin
router.post('/tags', requireAuth, async (req, res) => {
  const { category_id, name, sort_order } = req.body
  if (!category_id || !name) return res.status(400).json({ error: 'category_id and name required' })
  const db = getDb()
  await db.execute({
    sql: `INSERT INTO skill_tags (category_id, name, sort_order) VALUES (?, ?, ?)`,
    args: [category_id, name, sort_order || 0]
  })
  res.status(201).json({ ok: true })
})

// DELETE /api/skills/tags/:id — admin
router.delete('/tags/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM skill_tags WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
