import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import { initSchema, runMigrations } from './db.js'

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
import util from 'util'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
// To this:
const isProduction = process.env.NODE_ENV === 'production'
app.use(cors({
  origin: isProduction ? true : 'http://localhost:5173',
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/hero-stats', heroStatsRouter)
app.use('/api/skills', skillsRouter)
app.use('/api/experiences', experiencesRouter)
app.use('/api/projects', projectsRouter)
app.use('/api/education', educationRouter)
app.use('/api/tech-stack', techStackRouter)
app.use('/api/why-work-with-me', whyWorkWithMeRouter)
app.use('/api/certifications', certificationsRouter)
app.use('/api/contact', contactRouter)
app.use('/api/cvs', cvsRouter)
app.use('/api/languages', languagesRouter)
app.use('/api/sections', sectionsRouter)



// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }))


const distPath = path.resolve(__dirname, '../dist')
app.use(express.static(distPath))

// Global error handler middleware
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('Express error:', util.inspect(err, { depth: null }))
  res.status(500).json({
    error: err?.message || util.inspect(err),
  })
})

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

initSchema()
  .then(() => runMigrations())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 MKBS Portfolio API running at http://localhost:${PORT}`)
    })
  })
  .catch((err) => {
    console.error('❌ Failed to initialize database:', err)
    process.exit(1)
  })

export default app
