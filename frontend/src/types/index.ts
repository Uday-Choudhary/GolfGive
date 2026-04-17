import { z } from 'zod'

// ── Enums ──────────────────────────────────────────────────────────────────────
export type Role = 'SUBSCRIBER' | 'ADMIN'
export type SubscriptionStatus = 'ACTIVE' | 'INACTIVE' | 'CANCELLED' | 'LAPSED'
export type Plan = 'MONTHLY' | 'YEARLY'
export type DrawStatus = 'PENDING' | 'SIMULATED' | 'PUBLISHED'
export type DrawMode = 'RANDOM' | 'ALGORITHMIC'
export type MatchType = 'FIVE' | 'FOUR' | 'THREE'
export type PaymentStatus = 'PENDING' | 'PAID'

// ── Models ─────────────────────────────────────────────────────────────────────
export interface User {
  id: string
  email: string
  name: string
  role: Role
  subscriptionStatus: SubscriptionStatus
  subscriptionPlan?: Plan
  renewalDate?: string
  charityId?: string
  charityPercent: number
  charity?: { id: string; name: string; imageUrls: string[] }
  createdAt: string
}

export interface Score {
  id: string
  userId: string
  score: number
  date: string
  createdAt: string
}

export interface Draw {
  id: string
  month: string
  status: DrawStatus
  drawNumbers: number[]
  drawMode: DrawMode
  jackpotPool: number
  fourMatchPool: number
  threeMatchPool: number
  jackpotRolledOver: boolean
  rolledOverAmount: number
  publishedAt?: string
  createdAt: string
  winners?: Winner[]
}

export interface Winner {
  id: string
  userId: string
  drawId: string
  matchType: MatchType
  prizeAmount: number
  proofUrl?: string
  status: PaymentStatus
  adminNote?: string
  createdAt: string
  user?: { name: string; email: string }
  draw?: { month: string; drawNumbers: number[] }
}

export interface Charity {
  id: string
  name: string
  description: string
  mission: string
  imageUrls: string[]
  isFeatured: boolean
  category: string
  website?: string
  events?: CharityEvent[]
  _count?: { users: number }
  createdAt: string
}

export interface CharityEvent {
  id: string
  charityId: string
  title: string
  description: string
  date: string
  location: string
}

// ── Zod Schemas ────────────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
  charityId: z.string().optional(),
  charityPercent: z.number().min(10).max(100).optional(),
})

export const scoreSchema = z.object({
  score: z
    .number({ invalid_type_error: 'Score must be a number' })
    .int()
    .min(1, 'Minimum score is 1')
    .max(45, 'Maximum score is 45'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ScoreFormData = z.infer<typeof scoreSchema>
