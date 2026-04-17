import { Router, Request, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'

const router = Router()

// ── GET /api/draws ─────────────────────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const draws = await prisma.draw.findMany({
    where: { status: 'PUBLISHED' },
    orderBy: { month: 'desc' },
    take: 12,
    include: {
      winners: {
        select: { matchType: true, prizeAmount: true, status: true },
      },
    },
  })
  res.json(draws)
})

// ── GET /api/draws/current ─────────────────────────────────────────────────────
router.get('/current', async (_req: Request, res: Response): Promise<void> => {
  const draw = await prisma.draw.findFirst({
    where: { status: { in: ['PENDING', 'SIMULATED'] } },
    orderBy: { month: 'desc' },
  })
  res.json(draw)
})

// ── GET /api/draws/:id ─────────────────────────────────────────────────────────
router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const draw = await prisma.draw.findUnique({
    where: { id: req.params.id },
    include: {
      winners: {
        include: {
          user: { select: { name: true, email: true } },
        },
      },
    },
  })
  if (!draw) {
    res.status(404).json({ error: 'Draw not found' })
    return
  }
  res.json(draw)
})

export default router
