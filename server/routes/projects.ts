import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

function rowToObj(cols: string[], row: any[]) {
  return Object.fromEntries(cols.map((c, i) => [c, row[i]]))
}

// GET /api/projects — public
router.get('/', async (_req, res) => {
  const db = await getDb()
  const projs = db.exec(`SELECT * FROM projects ORDER BY sort_order ASC`)
  const feats = db.exec(`SELECT * FROM project_features ORDER BY project_id, sort_order ASC`)
  const techs = db.exec(`SELECT * FROM project_tech ORDER BY project_id ASC`)

  if (!projs[0]) return res.json([])

  const projCols = projs[0].columns
  const featCols = feats[0]?.columns || []
  const techCols = techs[0]?.columns || []
  const featRows = feats[0]?.values || []
  const techRows = techs[0]?.values || []

  const result = projs[0].values.map(row => {
    const proj = rowToObj(projCols, row) as any
    proj.features = featRows
      .filter(f => f[featCols.indexOf('project_id')] === proj.id)
      .map(f => rowToObj(featCols, f))
    proj.tech = techRows
      .filter(t => t[techCols.indexOf('project_id')] === proj.id)
      .map(t => t[techCols.indexOf('name')])
    return proj
  })

  res.json(result)
})

// POST /api/projects — admin
router.post('/', requireAuth, async (req, res) => {
  const { title, category, description, problem, solution, business_impact, status, github_url, demo_url, sort_order, features, tech } = req.body
  if (!title) return res.status(400).json({ error: 'Title required' })

  const db = await getDb()
  db.run(
    `INSERT INTO projects (title, category, description, problem, solution, business_impact, status, github_url, demo_url, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [title, category || 'web', description || '', problem || '', solution || '', business_impact || '', status || 'completed', github_url || '', demo_url || '', sort_order || 0]
  )
  const projId = (db.exec(`SELECT last_insert_rowid() as id`)[0].values[0][0]) as number

  if (Array.isArray(features)) {
    features.forEach((f: string, j: number) =>
      db.run(`INSERT INTO project_features (project_id, text, sort_order) VALUES (?, ?, ?)`, [projId, f, j]))
  }
  if (Array.isArray(tech)) {
    tech.forEach((t: string) =>
      db.run(`INSERT INTO project_tech (project_id, name) VALUES (?, ?)`, [projId, t]))
  }

  saveDb()
  res.status(201).json({ ok: true, id: projId })
})

// PATCH /api/projects/:id — admin
router.patch('/:id', requireAuth, async (req, res) => {
  const { id } = req.params
  const allowed = ['title', 'category', 'description', 'problem', 'solution', 'business_impact', 'status', 'github_url', 'demo_url', 'sort_order']
  const updates: string[] = []
  const values: any[] = []

  for (const key of allowed) {
    if (key in req.body) { updates.push(`${key} = ?`); values.push(req.body[key]) }
  }

  const db = await getDb()

  if (updates.length) {
    values.push(id)
    db.run(`UPDATE projects SET ${updates.join(', ')} WHERE id = ?`, values)
  }

  if (Array.isArray(req.body.features)) {
    db.run(`DELETE FROM project_features WHERE project_id = ?`, [id])
    req.body.features.forEach((f: string, j: number) =>
      db.run(`INSERT INTO project_features (project_id, text, sort_order) VALUES (?, ?, ?)`, [id, f, j]))
  }

  if (Array.isArray(req.body.tech)) {
    db.run(`DELETE FROM project_tech WHERE project_id = ?`, [id])
    req.body.tech.forEach((t: string) =>
      db.run(`INSERT INTO project_tech (project_id, name) VALUES (?, ?)`, [id, t]))
  }

  saveDb()
  res.json({ ok: true })
})

// DELETE /api/projects/:id — admin
router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM projects WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
