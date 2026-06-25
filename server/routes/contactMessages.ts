import { Router } from 'express'
import { getDb, saveDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/contact — admin only (view messages)
router.get('/', requireAuth, async (_req, res) => {
  const db = await getDb()
  const result = db.exec(`SELECT * FROM contact_messages ORDER BY received_at DESC`)
  if (!result[0]) return res.json([])
  const cols = result[0].columns
  res.json(result[0].values.map(row => Object.fromEntries(cols.map((c, i) => [c, row[i]]))))
})

// POST /api/contact — public (submit contact form)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email address' })

  const db = await getDb()
  db.run(`INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
    [name, email, subject, message])
  saveDb()
  res.status(201).json({ ok: true, message: 'Message sent successfully' })
})

// PATCH /api/contact/:id/read — admin mark as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`UPDATE contact_messages SET is_read = 1 WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

// DELETE /api/contact/:id — admin delete
router.delete('/:id', requireAuth, async (req, res) => {
  const db = await getDb()
  db.run(`DELETE FROM contact_messages WHERE id = ?`, [req.params.id])
  saveDb()
  res.json({ ok: true })
})

export default router
