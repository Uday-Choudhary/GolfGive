const POOL_SPLITS = { FIVE: 0.4, FOUR: 0.35, THREE: 0.25 }
const CHARITY_MIN_PERCENT = 0.1

const PLAN_PRICES = {
  MONTHLY: 9.99,
  YEARLY: 95.88, // 7.99/mo × 12
}

export interface PrizePools {
  jackpot: number
  fourMatch: number
  threeMatch: number
  charityPool: number
  totalRevenue: number
}

export function calculatePrizePools(
  subscriberCount: number,
  monthlyCount: number,
  yearlyCount: number,
  rolledOverJackpot: number = 0
): PrizePools {
  const totalRevenue =
    monthlyCount * PLAN_PRICES.MONTHLY + (yearlyCount * PLAN_PRICES.YEARLY) / 12

  const charityPool = totalRevenue * CHARITY_MIN_PERCENT
  const prizePool = totalRevenue - charityPool

  return {
    jackpot: prizePool * POOL_SPLITS.FIVE + rolledOverJackpot,
    fourMatch: prizePool * POOL_SPLITS.FOUR,
    threeMatch: prizePool * POOL_SPLITS.THREE,
    charityPool,
    totalRevenue,
  }
}

export function splitPrize(totalPrize: number, winnerCount: number): number {
  if (winnerCount === 0) return 0
  return Math.floor((totalPrize / winnerCount) * 100) / 100 // round down to cents
}
