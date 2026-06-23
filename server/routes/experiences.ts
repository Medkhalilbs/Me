import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

// GET /api/experiences — public
router.get('/', async (_req, res) => {
  const db = await getDb()
  const exps = db.exec(`SELECT * FROM experiences ORDER BY sort_order ASC`)
  const resps = db.exec(`SELECT * FROM experience_responsibilities ORDER BY experience_id, sort_order ASC`)
  const techs = db.exec(`SELECT * FROM experience_tech ORDER BY experience_id ASC`)

  if (!exps[0]) return res.json([])

  const expCols = exps[0].columns
  const respCols = resps[0]?.columns || []
  const techCols = techs[0]?.columns || []
  const respRows = resps[0]?.values || []
  const techRows = techs[0]?.values || []

  const result = exps[0].values.map(row => {
    const exp = rowToObj(expCols, row) as any
    exp.responsibilities = respRows
      .filter(r => r[respCols.indexOf('experience_id')] === exp.id)
      .map(r => rowToObj(respCols, r))
    exp.tech = techRows
      .filter(t => t[techCols.indexOf('experience_id')] === exp.id)
      .map(t => t[techCols.indexOf('name')])
    return exp
  })

  res.json(result)
})

// POST /api/experiences — admin
router.post('/', requireAuth, async (req, res) => {
  const { company, role, client, start_date, end_date, location, is_current, sort_order, responsibilities, tech } = req.body
  if (!company || !role || !start_date) return res.status(400).json({ error: 'company, role, start_date required' })

  const db = await getDb()
  db.run(
    `INSERT INTO experiences (company, role, client, start_date, end_date, location, is_current, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [company, role, client || '', start_date, end_date || '', location || '', is_current ? 1 : 0, sort_order || 0]
  )
  const expId = (db.exec(`SELECT last_insert_rowid() as id`)[0].values[0][0]) as number

  if (Array.isArray(responsibilities)) {
    responsibilities.forEach((r: string, j: number) =>
      db.run(`INSERT INTO experience_responsibilities (experience_id, text, sort_order) VALUES (?, ?, ?)`, [expId, r, j]))
  }
  if (Array.isArray(tech)) {
    tech.forEach((t: string) =>
      db.run(`INSERT INTO experience_tech (experience_id, name) VALUES (?, ?)`, [expId, t]))
  }

  saveDb()
  res.status(201).json({ ok: true, id: expId })
})

// PATCH /api/experiences/:id — admin
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const allowed = ['company', 'role', 'client', 'start_date', 'end_date', 'location', 'is_current', 'sort_order']
  const updates: string[] = []
  const values: any[] = []

  for (const key of allowed) {
    if (key in req.body) {
      updates.push(`${key} = ?`)
      values.push(key === 'is_current' ? (req.body[key] ? 1 : 0) : req.body[key])
    }
  }

  const db = await getDb()

  if (updates.length) {
    values.push(id)
    db.run(`UPDATE experiences SET ${updates.join(', ')} WHERE id = ?`, values)
  }

  // Replace responsibilities if provided
  if (Array.isArray(req.body.responsibilities)) {
    db.run(`DELETE FROM experience_responsibilities WHERE experience_id = ?`, [id])
    req.body.responsibilities.forEach((r: string, j: number) =>
      db.run(`INSERT INTO experience_responsibilities (experience_id, text, sort_order) VALUES (?, ?, ?)`, [id, r, j]))
  }

  // Replace tech if provided
  if (Array.isArray(req.body.tech)) {
    db.run(`DELETE FROM experience_tech WHERE experience_id = ?`, [id])
    req.body.tech.forEach((t: string) =>
      db.run(`INSERT INTO experience_tech (experience_id, name) VALUES (?, ?)`, [id, t]))
  }

  saveDb()
  res.json({ ok: true })
})

// DELETE /api/experiences/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM experiences WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
