import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import rateLimit from 'express-rate-limit'
import { getDb } from '../db.js'

const router = Router()

// ─── JWT setup ───────────────────────────────────────────────────────────────
const JWT_SECRET =
  process.env.JWT_SECRET || 'dev-only-fallback-secret-change-in-production'

function signToken(): string {
  return jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '24h' })
}

// ─── Rate limiter (login only) ────────────────────────────────────────────────
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts. Try again in 15 minutes.' },
})

// POST /api/auth/login
router.post('/login', loginLimiter, async (req, res) => {
  const { password } = req.body
  if (!password) return res.status(400).json({ error: 'Password required' })

  const db = getDb()
  const result = await db.execute(`SELECT admin_password_hash FROM profile WHERE id = 1`)
  if (!result.rows[0]) return res.status(500).json({ error: 'Profile not found' })

  const hash = result.rows[0].admin_password_hash as string
  const valid = bcrypt.compareSync(password, hash)
  if (!valid) return res.status(401).json({ error: 'Invalid password' })

  const token = signToken()
  res.json({ token })
})

// POST /api/auth/logout — JWT is stateless, nothing to revoke server-side
router.post('/logout', (_req, res) => {
  res.json({ ok: true })
})

// POST /api/auth/change-password
router.post('/change-password', async (req, res) => {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = auth.slice(7)
  try {
    jwt.verify(token, JWT_SECRET)
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }

  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Both passwords required' })
  }
  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'New password must be at least 8 characters' })
  }

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

// ─── Middleware: verify JWT Bearer token (used by all admin routes) ────────────
export function requireAuth(req: any, res: any, next: any) {
  const auth = req.headers.authorization
  if (!auth?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  const token = auth.slice(7)
  try {
    jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Token expired or invalid' })
  }
}

export default router
