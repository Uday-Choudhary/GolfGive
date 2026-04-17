import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { subscriptionCheck } from '../middleware/subscriptionCheck'

const router = Router()
router.use(authMiddleware)
router.use(subscriptionCheck)

const scoreSchema = z.object({
  score: z.number().int().min(1).max(45),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

// ── GET /api/scores ────────────────────────────────────────────────────────────
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const scores = await prisma.score.findMany({
    where: { userId: req.user!.userId },
    orderBy: { date: 'desc' },
    take: 5,
  })
  res.json(scores)
})

// ── POST /api/scores ───────────────────────────────────────────────────────────
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = scoreSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const { score, date } = parsed.data
  const userId = req.user!.userId
  const scoreDate = new Date(date)

  // Check for duplicate date
  const existing = await prisma.score.findUnique({
    where: { userId_date: { userId, date: scoreDate } },
  })
  if (existing) {
    res.status(409).json({ error: 'A score already exists for this date' })
    return
  }

  // Count existing scores
  const count = await prisma.score.count({ where: { userId } })

  // Rolling 5-score system: delete oldest if at 5
  if (count >= 5) {
    const oldest = await prisma.score.findFirst({
      where: { userId },
      orderBy: { date: 'asc' },
    })
    if (oldest) {
      await prisma.score.delete({ where: { id: oldest.id } })
    }
  }

  const newScore = await prisma.score.create({
    data: { userId, score, date: scoreDate },
  })

  res.status(201).json(newScore)
})

// ── PUT /api/scores/:id ────────────────────────────────────────────────────────
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const parsed = scoreSchema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.errors[0].message })
    return
  }

  const scoreRecord = await prisma.score.findFirst({
    where: { id, userId: req.user!.userId },
  })
  if (!scoreRecord) {
    res.status(404).json({ error: 'Score not found' })
    return
  }

  const updated = await prisma.score.update({
    where: { id },
    data: { score: parsed.data.score, date: new Date(parsed.data.date) },
  })
  res.json(updated)
})

// ── DELETE /api/scores/:id ─────────────────────────────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { id } = req.params
  const scoreRecord = await prisma.score.findFirst({
    where: { id, userId: req.user!.userId },
  })
  if (!scoreRecord) {
    res.status(404).json({ error: 'Score not found' })
    return
  }

  await prisma.score.delete({ where: { id } })
  res.json({ message: 'Score deleted' })
})

export default router
