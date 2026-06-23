import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// Helper to convert rows to objects
function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

// GET /api/hero-stats — public
router.get('/', async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM hero_stats ORDER BY sort_order ASC`)
  if (!result[0]) return res.json([])
  const cols = result[0].columns
  const stats = result[0].values.map(row => rowToObj(cols, row))
  res.json(stats)
})

// POST /api/hero-stats — admin only
router.post('/', requireAuth, async (req, res) => {
  const { label, value, suffix, is_static, sort_order } = req.body
  if (!label || !value) return res.status(400).json({ error: 'Label and Value are required' })

  const db = await getDb()
  db.run(
    `INSERT INTO hero_stats (label, value, suffix, is_static, sort_order) VALUES (?, ?, ?, ?, ?)`,
    [label, value, suffix || '', is_static ? 1 : 0, sort_order || 0]
  )
  saveDb()
  res.status(201).json({ ok: true })
})

// PATCH /api/hero-stats/:id — admin only
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const db = await getDb()

  const allowed = ['label', 'value', 'suffix', 'is_static', 'sort_order']
  const updates: string[] = []
  const values: any[] = []

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = ?`)
      values.push(key === 'is_static' ? (req.body[key] ? 1 : 0) : req.body[key])
    }
  }

  if (updates.length === 0) return res.status(400).json({ error: 'No valid fields' })
  values.push(id)

  db.run(`UPDATE hero_stats SET ${updates.join(', ')} WHERE id = ?`, values)
  saveDb()
  res.json({ ok: true })
})

// DELETE /api/hero-stats/:id — admin only
router.delete('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const db = await getDb()
  db.run(`DELETE FROM hero_stats WHERE id = ?`, [id])
  saveDb()
  res.json({ ok: true })
})

export default router
