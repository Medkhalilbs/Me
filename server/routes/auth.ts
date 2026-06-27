import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { getDb } from '../db.js'

const router = Router()

// Simple in-memory token store (local use only)
const validTokens = new Set<string>()

function generateToken(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Password required' })

  const db = getDb()
  const result = await db.execute(`SELECT admin_password_hash, admin_secret_path FROM profile WHERE id = 1`)
  if (!result.rows[0]) return res.status(500).json({ error: 'Profile not found' })

  const hash = result.rows[0].admin_password_hash as string
  const valid = bcrypt.compareSync(password, hash)
  if (!valid) return res.status(401).json({ error: 'Invalid password' })

  const token = generateToken()
  validTokens.add(token)
  res.json({ token })
})

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  const auth = req.headers.authorization
  if (auth?.startsWith('Bearer ')) {
    validTokens.delete(auth.slice(7))
  }
  res.json({ ok: true })
})

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ') || !validTokens.has(auth.slice(7))) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Both passwords required' })

  const db = getDb()
  const result = await db.execute(`SELECT admin_password_hash FROM profile WHERE id = 1`)
  const hash = result.rows[0].admin_password_hash as string

  if (!bcrypt.compareSync(currentPassword, hash)) {
    return res.status(401).json({ error: 'Current password is incorrect' })
  }

  const newHash = bcrypt.hashSync(newPassword, 10)
  await db.execute({ sql: `UPDATE profile SET admin_password_hash = ? WHERE id = 1`, args: [newHash] })
  res.json({ ok: true })
})

// Middleware to verify admin token (exported for use in other routes)
export function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ') || !validTokens.has(auth.slice(7))) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  next()
}

export default router
