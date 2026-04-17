import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { rateLimit } from 'express-rate-limit'

// Routes
import authRouter from './routes/auth'
import scoresRouter from './routes/scores'
import drawsRouter from './routes/draws'
import charitiesRouter from './routes/charities'
import winnersRouter from './routes/winners'
import subscriptionRouter from './routes/subscription'
import adminUsersRouter from './routes/admin/users'
import adminDrawsRouter from './routes/admin/draws'
import adminCharitiesRouter from './routes/admin/charities'
import adminWinnersRouter from './routes/admin/winners'
import adminReportsRouter from './routes/admin/reports'

const app = express()
const PORT = process.env.PORT || 4000

// ── Security middleware ────────────────────────────────────────────────────────
app.use(helmet())
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

// ── Global rate limit ──────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use(globalLimiter)

// ── Body parsers ───────────────────────────────────────────────────────────────
// Stripe webhook needs raw body — mount before json()
app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ── API Routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter)
app.use('/api/scores', scoresRouter)
app.use('/api/draws', drawsRouter)
app.use('/api/charities', charitiesRouter)
app.use('/api/winners', winnersRouter)
app.use('/api/subscription', subscriptionRouter)

// Admin routes
app.use('/api/admin/users', adminUsersRouter)
app.use('/api/admin/draws', adminDrawsRouter)
app.use('/api/admin/charities', adminCharitiesRouter)
app.use('/api/admin/winners', adminWinnersRouter)
app.use('/api/admin/reports', adminReportsRouter)

// ── 404 ───────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Error]', err.message)
  res.status(500).json({ error: 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`)
  console.log(`   Environment: ${process.env.NODE_ENV}`)
})

export default app
