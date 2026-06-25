import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()
function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

router.get('/', async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM tech_stack ORDER BY sort_order ASC`)
  if (!result[0]) return res.json([])
  res.json(result[0].values.map(row => rowToObj(result[0].columns, row)))
})

router.post('/', requireAuth, async (req, res) => {
  const { name, icon, sort_order } = req.body
  if (!name) return res.status(400).json({ error: 'name required' })
  const db = await getDb()
  db.run(`INSERT INTO tech_stack (name, icon, sort_order) VALUES (?, ?, ?)`, [name, icon || 'code', sort_order || 0])
  saveDb()
  res.status(201).json({ ok: true })
})

router.patch('/:id', requireAuth, async (req, res) => {
  const allowed = ['name', 'icon', 'sort_order']
  const updates: string[] = []
  const values: any[] = []
  for (const key of allowed) {
    if (key in req.body) { updates.push(`${key} = ?`); values.push(req.body[key]) }
  }
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
  values.push(req.params.id)
  const db = await getDb()
  db.run(`UPDATE tech_stack SET ${updates.join(', ')} WHERE id = ?`, values)
  saveDb()
  res.json({ ok: true })
})

router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM tech_stack WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
