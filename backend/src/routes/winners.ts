import { Router, Response } from 'express'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { subscriptionCheck } from '../middleware/subscriptionCheck'

const router = Router()
router.use(authMiddleware)

// ── GET /api/winners/me ────────────────────────────────────────────────────────
router.get('/me', subscriptionCheck, async (req: AuthRequest, res: Response): Promise<void> => {
  const winnings = await prisma.winner.findMany({
    where: { userId: req.user!.userId },
    include: {
      draw: { select: { month: true, drawNumbers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(winnings)
})

// ── POST /api/winners/:id/proof ────────────────────────────────────────────────
// Returns a presigned URL for uploading to Supabase Storage
router.post('/:id/proof', subscriptionCheck, async (req: AuthRequest, res: Response): Promise<void> => {
  const winner = await prisma.winner.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  })

  if (!winner) {
    res.status(404).json({ error: 'Winner record not found' })
    return
  }

  // In production: generate a Supabase presigned URL here
  // For now return a mock upload endpoint URL
  const uploadUrl = `${process.env.SUPABASE_URL}/storage/v1/object/winner-proofs/${winner.id}`
  res.json({ uploadUrl, winnerId: winner.id })
})

// ── PATCH /api/winners/:id/proof-url — called after client direct upload ───────
router.patch('/:id/proof-url', subscriptionCheck, async (req: AuthRequest, res: Response): Promise<void> => {
  const { proofUrl } = req.body
  if (!proofUrl) {
    res.status(400).json({ error: 'proofUrl is required' })
    return
  }

  const winner = await prisma.winner.findFirst({
    where: { id: req.params.id, userId: req.user!.userId },
  })
  if (!winner) {
    res.status(404).json({ error: 'Winner record not found' })
    return
  }

  const updated = await prisma.winner.update({
    where: { id: winner.id },
    data: { proofUrl },
  })
  res.json(updated)
})

export default router
