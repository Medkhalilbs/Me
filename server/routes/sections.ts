import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

// GET /api/sections — public
router.get('/', async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM section_settings ORDER BY sort_order ASC`)
  if (!result[0]) return res.json([])
  res.json(result[0].values.map(row => rowToObj(result[0].columns, row)))
})

// PATCH /api/sections/:key — admin update by section_key
router.patch('/:key', requireAuth, async (req, res) => {
  const { key } = req.params
  const allowed = ['is_visible', 'sort_order']
  const updates: string[] = []
  const values: any[] = []
  for (const field of allowed) {
    if (field in req.body) {
      updates.push(`${field} = ?`)
      values.push(field === 'is_visible' ? (req.body[field] ? 1 : 0) : req.body[field])
    }
  }
  if (!updates.length) return res.status(400).json({ error: 'No valid fields' })
  values.push(key)
  const db = await getDb()
  db.run(`UPDATE section_settings SET ${updates.join(', ')} WHERE section_key = ?`, values)
  saveDb()
  res.json({ ok: true })
})

export default router
