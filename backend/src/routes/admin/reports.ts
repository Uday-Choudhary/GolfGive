import { Router, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware'
import { adminGuard } from '../../middleware/adminGuard'

const router = Router()
router.use(authMiddleware, adminGuard)

// GET /api/admin/reports
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const [
    totalUsers,
    activeSubscribers,
    monthlySubscribers,
    yearlySubscribers,
    totalWinners,
    totalPaid,
    pendingWinners,
    totalDraws,
    charities,
    recentDraws,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'SUBSCRIBER' } }),
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE' } }),
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'MONTHLY' } }),
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'YEARLY' } }),
    prisma.winner.count(),
    prisma.winner.aggregate({ _sum: { prizeAmount: true }, where: { status: 'PAID' } }),
    prisma.winner.count({ where: { status: 'PENDING' } }),
    prisma.draw.count({ where: { status: 'PUBLISHED' } }),
    prisma.charity.findMany({
      select: {
        name: true,
        _count: { select: { users: true } },
      },
    }),
    prisma.draw.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { month: 'desc' },
      take: 6,
      select: {
        month: true,
        jackpotPool: true,
        fourMatchPool: true,
        threeMatchPool: true,
        _count: { select: { winners: true } },
      },
    }),
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { createdAt: true },
    }),
  ])

  // Monthly revenue estimate
  const monthlyRevenue = monthlySubscribers * 9.99 + (yearlySubscribers * 95.88) / 12
  const totalCharityDistributed = monthlyRevenue * 0.1

  res.json({
    kpis: {
      totalUsers,
      activeSubscribers,
      monthlySubscribers,
      yearlySubscribers,
      totalDraws,
      totalWinners,
      pendingWinners,
      totalPaid: totalPaid._sum.prizeAmount || 0,
      monthlyRevenue: Math.round(monthlyRevenue * 100) / 100,
      totalCharityDistributed: Math.round(totalCharityDistributed * 100) / 100,
    },
    charityBreakdown: charities.map((c) => ({
      name: c.name,
      users: c._count.users,
    })),
    drawHistory: recentDraws.map((d) => ({
      month: d.month,
      totalPool: d.jackpotPool + d.fourMatchPool + d.threeMatchPool,
      winners: d._count.winners,
    })),
    userGrowth: recentUsers.map((u) => u.createdAt),
  })
})

export default router
