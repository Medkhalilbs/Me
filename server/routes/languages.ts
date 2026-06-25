import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

// GET /api/languages — public (visible only)
router.get('/', async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM languages WHERE is_visible = 1 ORDER BY sort_order ASC`)
  if (!result[0]) return res.json([])
  res.json(result[0].values.map(row => rowToObj(result[0].columns, row)))
})

// GET /api/languages/admin — admin (all)
router.get('/admin', requireAuth, async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM languages ORDER BY sort_order ASC`)
  if (!result[0]) return res.json([])
  res.json(result[0].values.map(row => rowToObj(result[0].columns, row)))
})

// POST /api/languages — admin create
router.post('/', requireAuth, async (req, res) => {
  const { name, code, proficiency, sort_order, is_visible } = req.body
  if (!name || !code || !proficiency) {
    return res.status(400).json({ error: 'name, code and proficiency are required' })
  }
  const db = await getDb()
  db.run(
    `INSERT INTO languages (name, code, proficiency, sort_order, is_visible) VALUES (?, ?, ?, ?, ?)`,
    [name, code.toLowerCase(), proficiency, sort_order ?? 0, is_visible !== undefined ? (is_visible ? 1 : 0) : 1]
  )
  saveDb()
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
  const db = await getDb()
  db.run(`UPDATE languages SET ${updates.join(', ')} WHERE id = ?`, values)
  saveDb()
  res.json({ ok: true })
})

// DELETE /api/languages/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM languages WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
