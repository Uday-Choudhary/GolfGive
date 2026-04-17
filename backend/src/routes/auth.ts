import { Router, Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import { rateLimit } from 'express-rate-limit'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../lib/auth'
import { sendWelcomeEmail } from '../lib/email'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// Strict rate limit on auth routes
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
})

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
  path: '/',
}

// ── Register ───────────────────────────────────────────────────────────────────
const registerSchema = z.object({
  name: z.string().min(2).max(60),
  email: z.string().email(),
  password: z.string().min(8),
  charityId: z.string().optional(),
  charityPercent: z.number().min(10).max(100).optional(),
})

router.post('/register', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const { name, email, password, charityId, charityPercent } = parsed.data

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    res.status(409).json({ error: 'Email already in use' })
    return
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      charityId: charityId || null,
      charityPercent: charityPercent || 10,
    },
    include: { charity: { select: { name: true } } },
  })

  if (user.charity) {
    await sendWelcomeEmail(user.email, user.name, user.charity.name)
  }

  const payload = { userId: user.id, email: user.email, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  const refreshHash = await bcrypt.hash(refreshToken, 10)
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: refreshHash } })

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
  res.status(201).json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      renewalDate: user.renewalDate,
      charityId: user.charityId,
      charityPercent: user.charityPercent,
    },
  })
})

// ── Login ──────────────────────────────────────────────────────────────────────
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

router.post('/login', authLimiter, async (req: Request, res: Response): Promise<void> => {
  const parsed = loginSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid credentials' })
    return
  }

  const { email, password } = parsed.data
  const user = await prisma.user.findUnique({ where: { email } })

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    res.status(401).json({ error: 'Invalid email or password' })
    return
  }

  const payload = { userId: user.id, email: user.email, role: user.role }
  const accessToken = signAccessToken(payload)
  const refreshToken = signRefreshToken(payload)

  const refreshHash = await bcrypt.hash(refreshToken, 10)
  await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: refreshHash } })

  res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
  res.json({
    accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      renewalDate: user.renewalDate,
      charityId: user.charityId,
      charityPercent: user.charityPercent,
    },
  })
})

// ── Refresh ────────────────────────────────────────────────────────────────────
router.post('/refresh', async (req: Request, res: Response): Promise<void> => {
  const token = req.cookies?.refreshToken
  if (!token) {
    res.status(401).json({ error: 'No refresh token' })
    return
  }

  try {
    const payload = verifyRefreshToken(token)
    const user = await prisma.user.findUnique({ where: { id: payload.userId } })

    if (!user?.refreshTokenHash) {
      res.status(401).json({ error: 'Invalid refresh token' })
      return
    }

    const valid = await bcrypt.compare(token, user.refreshTokenHash)
    if (!valid) {
      res.status(401).json({ error: 'Invalid refresh token' })
      return
    }

    const newPayload = { userId: user.id, email: user.email, role: user.role }
    const accessToken = signAccessToken(newPayload)
    const refreshToken = signRefreshToken(newPayload)

    const refreshHash = await bcrypt.hash(refreshToken, 10)
    await prisma.user.update({ where: { id: user.id }, data: { refreshTokenHash: refreshHash } })

    res.cookie('refreshToken', refreshToken, REFRESH_COOKIE_OPTIONS)
    res.json({ accessToken })
  } catch {
    res.status(401).json({ error: 'Invalid or expired refresh token' })
  }
})

// ── Logout ─────────────────────────────────────────────────────────────────────
router.post('/logout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  if (req.user) {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { refreshTokenHash: null },
    })
  }
  res.clearCookie('refreshToken', { path: '/' })
  res.json({ message: 'Logged out' })
})

// ── Me ─────────────────────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true, name: true, email: true, role: true,
      subscriptionStatus: true, subscriptionPlan: true,
      renewalDate: true, charityId: true, charityPercent: true,
      charity: { select: { id: true, name: true, imageUrls: true } },
    },
  })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }
  res.json(user)
})

// ── PATCH /me ──────────────────────────────────────────────────────────────
router.patch('/me', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { charityId, charityPercent } = req.body
  const updateData: any = {}
  if (charityId !== undefined) updateData.charityId = charityId
  if (charityPercent !== undefined) updateData.charityPercent = Math.max(10, Math.min(100, charityPercent))

  await prisma.user.update({
    where: { id: req.user!.userId },
    data: updateData,
  })
  
  res.json({ success: true })
})

export default router
