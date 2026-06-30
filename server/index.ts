import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path'
import { fileURLToPath } from 'url'
import { initSchema, runMigrations } from './db.js'
import util from 'util'

import authRouter from './routes/auth.js'
import profileRouter from './routes/profile.js'
import heroStatsRouter from './routes/heroStats.js'
import skillsRouter from './routes/skills.js'
import experiencesRouter from './routes/experiences.js'
import projectsRouter from './routes/projects.js'
import educationRouter from './routes/education.js'
import techStackRouter from './routes/techStack.js'
import whyWorkWithMeRouter from './routes/whyWorkWithMe.js'
import certificationsRouter from './routes/certifications.js'
import contactRouter from './routes/contactMessages.js'
import cvsRouter from './routes/cvs.js'
import languagesRouter from './routes/languages.js'
import sectionsRouter from './routes/sections.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001
const isProduction = process.env.NODE_ENV === 'production'

// ─── Security headers (Task 6) ────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'"],
      styleSrc:   ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc:     ["'self'", 'data:', 'https://res.cloudinary.com'],
      fontSrc:    ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'https://res.cloudinary.com'],
    },
  },
}))

// ─── CORS (Task 3) ────────────────────────────────────────────────────────────
app.use(cors({
  origin: isProduction ? (process.env.ALLOWED_ORIGIN || true) : 'http://localhost:5173',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth',           authRouter)
app.use('/api/profile',        profileRouter)
app.use('/api/hero-stats',     heroStatsRouter)
app.use('/api/skills',         skillsRouter)
app.use('/api/experiences',    experiencesRouter)
app.use('/api/projects',       projectsRouter)
app.use('/api/education',      educationRouter)
app.use('/api/tech-stack',     techStackRouter)
app.use('/api/why-work-with-me', whyWorkWithMeRouter)
app.use('/api/certifications', certificationsRouter)
app.use('/api/contact',        contactRouter)
app.use('/api/cvs',            cvsRouter)
app.use('/api/languages',      languagesRouter)
app.use('/api/sections',       sectionsRouter)

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }))

// ─── Static SPA (production) ──────────────────────────────────────────────────
const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))

// ─── Global error handler (Task 4) ────────────────────────────────────────────
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Express error:', util.inspect(err, { depth: null }))
  if (isProduction) {
    return res.status(500).json({ error: 'Internal server error' })
  }
  res.status(500).json({ error: err?.message || util.inspect(err) })
})

// ─── API 404 fallback — must be before SPA catch-all (Task 11) ───────────────
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }))

// ─── SPA catch-all ────────────────────────────────────────────────────────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

initSchema()
  .then(() => runMigrations())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Portfolio API running at http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err)
    process.exit(1)
  })

export default app
