import { Router, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware'
import { adminGuard } from '../../middleware/adminGuard'
import { sendPayoutEmail } from '../../lib/email'

const router = Router()
router.use(authMiddleware, adminGuard)

// GET /api/admin/winners
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const winners = await prisma.winner.findMany({
    include: {
      user: { select: { name: true, email: true } },
      draw: { select: { month: true, drawNumbers: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(winners)
})

// PATCH /api/admin/winners/:id/verify
router.patch('/:id/verify', async (req: AuthRequest, res: Response): Promise<void> => {
  const { approved, adminNote } = req.body
  const winner = await prisma.winner.findUnique({ where: { id: req.params.id } })
  if (!winner) { res.status(404).json({ error: 'Winner not found' }); return }

  const updated = await prisma.winner.update({
    where: { id: req.params.id },
    data: {
      status: approved ? 'PENDING' : 'PENDING', // stays PENDING until paid
      adminNote: adminNote || null,
    },
  })
  res.json(updated)
})

// PATCH /api/admin/winners/:id/payout
router.patch('/:id/payout', async (req: AuthRequest, res: Response): Promise<void> => {
  const winner = await prisma.winner.findUnique({
    where: { id: req.params.id },
    include: { user: { select: { name: true, email: true } } },
  })
  if (!winner) { res.status(404).json({ error: 'Winner not found' }); return }

  const updated = await prisma.winner.update({
    where: { id: req.params.id },
    data: { status: 'PAID' },
  })

  await sendPayoutEmail(winner.user.email, winner.user.name, winner.prizeAmount)
  res.json(updated)
})

export default router
