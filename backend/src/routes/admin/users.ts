import { Router, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware } from '../../middleware/authMiddleware'
import { adminGuard } from '../../middleware/adminGuard'
import { AuthRequest } from '../../middleware/authMiddleware'

const router = Router()
router.use(authMiddleware, adminGuard)

// GET /api/admin/users
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const users = await prisma.user.findMany({
    select: {
      id: true, name: true, email: true, role: true,
      subscriptionStatus: true, subscriptionPlan: true,
      renewalDate: true, charityPercent: true, createdAt: true,
      charity: { select: { name: true } },
      _count: { select: { scores: true, winnings: true } },
    },
    orderBy: { createdAt: 'desc' },
  })
  res.json(users)
})

// GET /api/admin/users/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.params.id },
    include: {
      scores: { orderBy: { date: 'desc' } },
      winnings: { include: { draw: { select: { month: true } } } },
      charity: true,
    },
  })
  if (!user) { res.status(404).json({ error: 'User not found' }); return }
  res.json(user)
})

// PATCH /api/admin/users/:id
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const { subscriptionStatus, subscriptionPlan, charityId, charityPercent, role } = req.body
  const updated = await prisma.user.update({
    where: { id: req.params.id },
    data: {
      ...(subscriptionStatus && { subscriptionStatus }),
      ...(subscriptionPlan && { subscriptionPlan }),
      ...(charityId !== undefined && { charityId }),
      ...(charityPercent !== undefined && { charityPercent }),
      ...(role && { role }),
    },
  })
  res.json(updated)
})

// DELETE /api/admin/users/:userId/scores/:scoreId
router.delete('/:userId/scores/:scoreId', async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.score.delete({
    where: { id: req.params.scoreId, userId: req.params.userId },
  })
  res.json({ success: true })
})

export default router
