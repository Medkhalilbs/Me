import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

// GET /api/skills — public
router.get('/', async (_req, res) => {
  const db = await getDb()
  const cats = db.exec(`SELECT * FROM skill_categories ORDER BY sort_order ASC`)
  const tags = db.exec(`SELECT * FROM skill_tags ORDER BY category_id, sort_order ASC`)

  if (!cats[0]) return res.json([])

  const catCols = cats[0].columns
  const tagCols = tags[0]?.columns || []
  const tagRows = tags[0]?.values || []

  const result = cats[0].values.map(row => {
    const cat = rowToObj(catCols, row) as any
    cat.tags = tagRows
      .filter(t => t[tagCols.indexOf('category_id')] === cat.id)
      .map(t => rowToObj(tagCols, t))
    return cat
  })

  res.json(result)
})

// POST /api/skills/categories — admin
router.post('/categories', requireAuth, async (req, res) => {
  const { name, icon, proficiency, sort_order } = req.body
  if (!name) return res.status(400).json({ error: 'Name required' })
  const db = await getDb()
  db.run(`INSERT INTO skill_categories (name, icon, proficiency, sort_order) VALUES (?, ?, ?, ?)`,
    [name, icon || 'code', proficiency || 80, sort_order || 0])
  saveDb()
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
  const db = await getDb()
  db.run(`UPDATE skill_categories SET ${updates.join(', ')} WHERE id = ?`, values)
  saveDb()
  res.json({ ok: true })
})

// DELETE /api/skills/categories/:id — admin (cascades to tags)
router.delete('/categories/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM skill_categories WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

// POST /api/skills/tags — admin
router.post('/tags', requireAuth, async (req, res) => {
  const { category_id, name, sort_order } = req.body
  if (!category_id || !name) return res.status(400).json({ error: 'category_id and name required' })
  const db = await getDb()
  db.run(`INSERT INTO skill_tags (category_id, name, sort_order) VALUES (?, ?, ?)`, [category_id, name, sort_order || 0])
  saveDb()
  res.status(201).json({ ok: true })
})

// DELETE /api/skills/tags/:id — admin
router.delete('/tags/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM skill_tags WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
