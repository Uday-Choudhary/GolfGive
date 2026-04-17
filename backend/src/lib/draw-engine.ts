import { PrismaClient, MatchType } from '@prisma/client'

// ── Random Draw ────────────────────────────────────────────────────────────────
export function randomDraw(count = 5, min = 1, max = 45): number[] {
  const numbers = new Set<number>()
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * (max - min + 1)) + min)
  }
  return [...numbers].sort((a, b) => a - b)
}

// ── Algorithmic Draw (weighted by most frequent user scores) ───────────────────
export async function algorithmicDraw(prisma: PrismaClient): Promise<number[]> {
  const grouped = await prisma.score.groupBy({
    by: ['score'],
    _count: { score: true },
    orderBy: { _count: { score: 'desc' } },
  })

  if (grouped.length < 5) {
    // Fall back to random if not enough data
    return randomDraw()
  }

  // Build a weighted pool: higher frequency = more chances
  const weightedPool: number[] = []
  for (const entry of grouped) {
    const weight = entry._count.score
    for (let i = 0; i < weight; i++) {
      weightedPool.push(entry.score)
    }
  }

  // Sample 5 unique numbers from weighted pool
  const picked = new Set<number>()
  let attempts = 0
  while (picked.size < 5 && attempts < 1000) {
    const idx = Math.floor(Math.random() * weightedPool.length)
    picked.add(weightedPool[idx])
    attempts++
  }

  // Pad with random if needed
  while (picked.size < 5) {
    picked.add(Math.floor(Math.random() * 45) + 1)
  }

  return [...picked].sort((a, b) => a - b)
}

// ── Match Detection ────────────────────────────────────────────────────────────
export function detectMatch(userScores: number[], drawNumbers: number[]): MatchType | null {
  const matches = userScores.filter((s) => drawNumbers.includes(s)).length
  if (matches >= 5) return 'FIVE'
  if (matches >= 4) return 'FOUR'
  if (matches >= 3) return 'THREE'
  return null
}

// ── Get user's 5 most recent scores as numbers ─────────────────────────────────
export async function getUserDrawNumbers(userId: string, prisma: PrismaClient): Promise<number[]> {
  const scores = await prisma.score.findMany({
    where: { userId },
    orderBy: { date: 'desc' },
    take: 5,
    select: { score: true },
  })
  return scores.map((s) => s.score)
}
