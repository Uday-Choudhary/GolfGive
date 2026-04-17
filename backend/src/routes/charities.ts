import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma'
import { authMiddleware } from '../middleware/authMiddleware'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' })

// ── GET /api/charities ─────────────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { search, category, featured } = req.query

  const charities = await prisma.charity.findMany({
    where: {
      ...(search ? { name: { contains: String(search), mode: 'insensitive' } } : {}),
      ...(category ? { category: String(category) } : {}),
      ...(featured === 'true' ? { isFeatured: true } : {}),
    },
    include: {
      events: { orderBy: { date: 'asc' }, take: 3 },
      _count: { select: { users: true } },
    },
    orderBy: [{ isFeatured: 'desc' }, { createdAt: 'asc' }],
  })

  res.json(charities)
})

// ── GET /api/charities/:id ─────────────────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  const charity = await prisma.charity.findUnique({
    where: { id: req.params.id },
    include: {
      events: { orderBy: { date: 'asc' } },
      _count: { select: { users: true } },
    },
  })

  if (!charity) {
    res.status(404).json({ error: 'Charity not found' })
    return
  }

  res.json(charity)
})

// ── POST /api/charities/:id/donate ─────────────────────────────────────────────
router.post('/:id/donate', authMiddleware, async (req: Request, res: Response): Promise<void> => {
  const charity = await prisma.charity.findUnique({ where: { id: req.params.id } })
  
  if (!charity) {
    res.status(404).json({ error: 'Charity not found' })
    return
  }
  
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'gbp',
          product_data: {
            name: `One-Time Donation to ${charity.name}`,
            description: charity.mission || charity.description,
          },
          unit_amount: 1000, // £10.00 default donation
        },
        quantity: 1,
      }],
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5174'}/dashboard/charity?donation=success`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5174'}/dashboard/charity?donation=cancelled`,
    })
    
    res.json({ url: session.url })
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Stripe error' })
  }
})

export default router
