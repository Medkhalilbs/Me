import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/experiences — public
router.get('/', async (_req, res) => {
  const db = getDb()
  const exps = await db.execute(`SELECT * FROM experiences ORDER BY sort_order ASC`)
  const resps = await db.execute(`SELECT * FROM experience_responsibilities ORDER BY experience_id, sort_order ASC`)
  const techs = await db.execute(`SELECT * FROM experience_tech ORDER BY experience_id ASC`)

  const result = exps.rows.map(exp => {
    const e = { ...exp } as any
    e.responsibilities = resps.rows
      .filter(r => r.experience_id === exp.id)
      .map(r => ({ ...r }))
    e.tech = techs.rows
      .filter(t => t.experience_id === exp.id)
      .map(t => t.name)
    return e
  })

  res.json(result)
})

// POST /api/experiences — admin
router.post('/', requireAuth, async (req, res) => {
  const { company, role, client, start_date, end_date, location, is_current, sort_order, responsibilities, tech } = req.body
  if (!company || !role || !start_date) return res.status(400).json({ error: 'company, role, start_date required' })

  const db = getDb()
  await db.execute({
    sql: `INSERT INTO experiences (company, role, client, start_date, end_date, location, is_current, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [company, role, client || '', start_date, end_date || '', location || '', is_current ? 1 : 0, sort_order || 0]
  })
  const idResult = await db.execute(`SELECT last_insert_rowid() as id`)
  const expId = idResult.rows[0].id as number

  if (Array.isArray(responsibilities)) {
    for (let j = 0; j < responsibilities.length; j++) {
      await db.execute({
        sql: `INSERT INTO experience_responsibilities (experience_id, text, sort_order) VALUES (?, ?, ?)`,
        args: [expId, responsibilities[j], j]
      })
    }
  }
  if (Array.isArray(tech)) {
    for (const t of tech) {
      await db.execute({
        sql: `INSERT INTO experience_tech (experience_id, name) VALUES (?, ?)`,
        args: [expId, t]
      })
    }
  }

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

  const db = getDb()

  if (updates.length) {
    values.push(id)
    await db.execute({ sql: `UPDATE experiences SET ${updates.join(', ')} WHERE id = ?`, args: values })
  }

  // Replace responsibilities if provided
  if (Array.isArray(req.body.responsibilities)) {
    await db.execute({ sql: `DELETE FROM experience_responsibilities WHERE experience_id = ?`, args: [id] })
    for (let j = 0; j < req.body.responsibilities.length; j++) {
      await db.execute({
        sql: `INSERT INTO experience_responsibilities (experience_id, text, sort_order) VALUES (?, ?, ?)`,
        args: [id, req.body.responsibilities[j], j]
      })
    }
  }

  // Replace tech if provided
  if (Array.isArray(req.body.tech)) {
    await db.execute({ sql: `DELETE FROM experience_tech WHERE experience_id = ?`, args: [id] })
    for (const t of req.body.tech) {
      await db.execute({
        sql: `INSERT INTO experience_tech (experience_id, name) VALUES (?, ?)`,
        args: [id, t]
      })
    }
  }

  res.json({ ok: true })
})

// DELETE /api/experiences/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM experiences WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
