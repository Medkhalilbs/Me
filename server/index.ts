import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

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
import testimonialsRouter from './routes/testimonials.js'
import contactRouter from './routes/contactMessages.js'
import cvsRouter from './routes/cvs.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
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
app.use('/api/testimonials', testimonialsRouter)
app.use('/api/contact', contactRouter)
app.use('/api/cvs', cvsRouter)

// Static data directory
app.use('/data', express.static(path.resolve(__dirname, '../data')))

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok', ts: Date.now() }))

app.listen(PORT, () => {
  console.log(`🚀 MKBS Portfolio API running at http://localhost:${PORT}`)
})

export default app
