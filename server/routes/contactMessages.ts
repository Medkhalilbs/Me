import { Router } from 'express'
import { getDb } from '../db.js'
import { requireAuth } from './auth.js'

const router = Router()

// GET /api/contact — admin only (view messages)
router.get('/', requireAuth, async (_req, res) => {
  const db = getDb()
  const result = await db.execute(`SELECT * FROM contact_messages ORDER BY received_at DESC`)
  res.json(result.rows.map(r => ({ ...r })))
})

// POST /api/contact — public (submit contact form)
router.post('/', async (req, res) => {
  const { name, email, subject, message } = req.body
  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: 'All fields are required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email address' })

  const db = getDb()
  await db.execute({
    sql: `INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)`,
    args: [name, email, subject, message]
  })
  res.status(201).json({ ok: true, message: 'Message sent successfully' })
})

// PATCH /api/contact/:id/read — admin mark as read
router.patch('/:id/read', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `UPDATE contact_messages SET is_read = 1 WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

// DELETE /api/contact/:id — admin delete
router.delete('/:id', requireAuth, async (req, res) => {
  const db = getDb()
  await db.execute({ sql: `DELETE FROM contact_messages WHERE id = ?`, args: [req.params.id] })
  res.json({ ok: true })
})

export default router
