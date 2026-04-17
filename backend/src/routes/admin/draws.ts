import { Router, Response } from 'express'
import { prisma } from '../../lib/prisma'
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware'
import { adminGuard } from '../../middleware/adminGuard'
import { randomDraw, algorithmicDraw, detectMatch, getUserDrawNumbers } from '../../lib/draw-engine'
import { calculatePrizePools, splitPrize } from '../../lib/prize-pool'
import { sendDrawResultEmail, sendWinnerAlertEmail } from '../../lib/email'

const router = Router()
router.use(authMiddleware, adminGuard)

// POST /api/admin/draws/simulate
router.post('/simulate', async (req: AuthRequest, res: Response): Promise<void> => {
  const { mode = 'RANDOM', month } = req.body
  const drawMonth = month ? new Date(month) : new Date()
  drawMonth.setDate(1)

  const numbers =
    mode === 'ALGORITHMIC' ? await algorithmicDraw(prisma) : randomDraw()

  // Get subscriber counts for pool calculation
  const [monthlyCount, yearlyCount] = await Promise.all([
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'MONTHLY' } }),
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'YEARLY' } }),
  ])

  const pools = calculatePrizePools(monthlyCount + yearlyCount, monthlyCount, yearlyCount)

  // Simulate matches (don't save winners yet)
  const activeUsers = await prisma.user.findMany({
    where: { subscriptionStatus: 'ACTIVE' },
    select: { id: true, name: true, email: true },
  })

  const matchResults: { userId: string; matchType: string; scores: number[] }[] = []
  for (const user of activeUsers) {
    const scores = await getUserDrawNumbers(user.id, prisma)
    const match = detectMatch(scores, numbers)
    if (match) {
      matchResults.push({ userId: user.id, matchType: match, scores })
    }
  }

  res.json({ drawNumbers: numbers, pools, matchResults, mode, month: drawMonth })
})

// POST /api/admin/draws — create a real draw
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const { mode = 'RANDOM', month } = req.body
  const drawMonth = month ? new Date(month) : new Date()
  drawMonth.setDate(1)

  const numbers = mode === 'ALGORITHMIC' ? await algorithmicDraw(prisma) : randomDraw()

  const [monthlyCount, yearlyCount] = await Promise.all([
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'MONTHLY' } }),
    prisma.user.count({ where: { subscriptionStatus: 'ACTIVE', subscriptionPlan: 'YEARLY' } }),
  ])

  // Check for rollover jackpot from last month
  const lastDraw = await prisma.draw.findFirst({
    where: { status: 'PUBLISHED' },
    orderBy: { month: 'desc' },
  })
  const rolledOver = lastDraw?.jackpotRolledOver ? lastDraw.rolledOverAmount : 0

  const pools = calculatePrizePools(monthlyCount + yearlyCount, monthlyCount, yearlyCount, rolledOver)

  const draw = await prisma.draw.create({
    data: {
      month: drawMonth,
      status: 'SIMULATED',
      drawNumbers: numbers,
      drawMode: mode,
      jackpotPool: pools.jackpot,
      fourMatchPool: pools.fourMatch,
      threeMatchPool: pools.threeMatch,
    },
  })

  res.status(201).json(draw)
})

// POST /api/admin/draws/:id/publish
router.post('/:id/publish', async (req: AuthRequest, res: Response): Promise<void> => {
  const draw = await prisma.draw.findUnique({ where: { id: req.params.id } })
  if (!draw) { res.status(404).json({ error: 'Draw not found' }); return }
  if (draw.status === 'PUBLISHED') { res.status(400).json({ error: 'Draw already published' }); return }

  // Find all active users and detect matches
  const users = await prisma.user.findMany({
    where: { subscriptionStatus: 'ACTIVE' },
    select: { id: true, name: true, email: true },
  })

  interface MatchGroup { users: typeof users; pool: number }
  const matchGroups: Record<string, MatchGroup> = {
    FIVE: { users: [], pool: draw.jackpotPool },
    FOUR: { users: [], pool: draw.fourMatchPool },
    THREE: { users: [], pool: draw.threeMatchPool },
  }

  for (const user of users) {
    const scores = await getUserDrawNumbers(user.id, prisma)
    const match = detectMatch(scores, draw.drawNumbers)
    if (match) {
      matchGroups[match].users.push(user)
    }
  }

  // Create winner records + send notifications
  const winnerCreates = []
  for (const [matchType, group] of Object.entries(matchGroups)) {
    if (group.users.length === 0) continue
    const prizeAmount = splitPrize(group.pool, group.users.length)
    for (const user of group.users) {
      winnerCreates.push(
        prisma.winner.create({
          data: { userId: user.id, drawId: draw.id, matchType: matchType as any, prizeAmount },
        })
      )
      await sendWinnerAlertEmail(user.email, user.name, prizeAmount)
    }
  }
  await Promise.all(winnerCreates)

  // Handle jackpot rollover
  const jackpotRolledOver = matchGroups.FIVE.users.length === 0
  const updatedDraw = await prisma.draw.update({
    where: { id: draw.id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
      jackpotRolledOver,
      rolledOverAmount: jackpotRolledOver ? draw.jackpotPool : 0,
    },
  })

  // Notify all subscribers of results
  for (const user of users) {
    const scores = await getUserDrawNumbers(user.id, prisma)
    const match = detectMatch(scores, draw.drawNumbers)
    const winner = match
      ? matchGroups[match].users.find((u) => u.id === user.id)
      : undefined
    const matches = scores.filter((s) => draw.drawNumbers.includes(s)).length
    const prize = winner ? splitPrize(matchGroups[match!].pool, matchGroups[match!].users.length) : undefined
    await sendDrawResultEmail(user.email, user.name, draw.drawNumbers, matches, prize)
  }

  res.json(updatedDraw)
})

// GET /api/admin/draws
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const draws = await prisma.draw.findMany({
    orderBy: { month: 'desc' },
    include: { _count: { select: { winners: true } } },
  })
  res.json(draws)
})

export default router
