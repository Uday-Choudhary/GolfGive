import { Router, Request, Response } from 'express'
import Stripe from 'stripe'
import { prisma } from '../lib/prisma'
import { authMiddleware, AuthRequest } from '../middleware/authMiddleware'
import { subscriptionCheck } from '../middleware/subscriptionCheck'
import { sendSubscriptionEmail } from '../lib/email'

const router = Router()
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-06-20' })
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173'

function getStripeErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message
  return 'Stripe request failed'
}

async function activateUserSubscription({
  userId,
  plan,
  subscriptionId,
}: {
  userId: string
  plan: 'MONTHLY' | 'YEARLY'
  subscriptionId: string
}) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const existingUser = await prisma.user.findUnique({ where: { id: userId } })
  const renewalDate = subscription.current_period_end
    ? new Date(subscription.current_period_end * 1000)
    : new Date(Date.now() + (plan === 'YEARLY' ? 365 : 30) * 24 * 60 * 60 * 1000)

  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      subscriptionStatus: 'ACTIVE',
      subscriptionPlan: plan,
      stripeSubscriptionId: subscription.id,
      renewalDate,
    },
  })

  if (
    existingUser?.subscriptionStatus !== 'ACTIVE' ||
    existingUser?.stripeSubscriptionId !== subscription.id
  ) {
    await sendSubscriptionEmail(
      user.email,
      user.name,
      plan,
      new Date(user.renewalDate!).toLocaleDateString()
    )
  }

  return user
}

// ── GET /api/subscription/status ──────────────────────────────────────────────
router.get('/status', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { subscriptionStatus: true, subscriptionPlan: true, renewalDate: true },
  })
  res.json(user)
})

// ── POST /api/subscription/checkout ───────────────────────────────────────────
router.post('/checkout', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { plan } = req.body as { plan: 'MONTHLY' | 'YEARLY' }

  if (plan !== 'MONTHLY' && plan !== 'YEARLY') {
    res.status(400).json({ error: 'Invalid subscription plan' })
    return
  }

  const priceId =
    plan === 'YEARLY'
      ? process.env.STRIPE_YEARLY_PRICE_ID
      : process.env.STRIPE_MONTHLY_PRICE_ID

  if (!process.env.STRIPE_SECRET_KEY || !priceId) {
    res.status(500).json({ error: 'Stripe is not configured for this plan' })
    return
  }

  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user) {
    res.status(404).json({ error: 'User not found' })
    return
  }

  try {
    let customerId = user.stripeCustomerId
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, name: user.name })
      customerId = customer.id
      await prisma.user.update({ where: { id: user.id }, data: { stripeCustomerId: customerId } })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${clientUrl}/pricing?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${clientUrl}/pricing?cancelled=true`,
      metadata: { userId: user.id, plan },
    })

    res.json({ url: session.url })
  } catch (error) {
    res.status(502).json({ error: getStripeErrorMessage(error) })
  }
})

// ── POST /api/subscription/confirm ────────────────────────────────────────────
router.post('/confirm', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  const { sessionId } = req.body as { sessionId?: string }

  if (!sessionId) {
    res.status(400).json({ error: 'Missing checkout session id' })
    return
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const userId = session.metadata?.userId
    const plan = session.metadata?.plan as 'MONTHLY' | 'YEARLY' | undefined

    if (!userId || userId !== req.user!.userId || !plan) {
      res.status(403).json({ error: 'Checkout session does not belong to this user' })
      return
    }

    if (session.mode !== 'subscription' || session.status !== 'complete' || !session.subscription) {
      res.status(400).json({ error: 'Checkout is not complete yet' })
      return
    }

    const user = await activateUserSubscription({
      userId,
      plan,
      subscriptionId: session.subscription as string,
    })

    res.json({
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      renewalDate: user.renewalDate,
    })
  } catch (error) {
    res.status(502).json({ error: getStripeErrorMessage(error) })
  }
})

// ── POST /api/subscription/webhook ────────────────────────────────────────────
router.post('/webhook', async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'] as string
  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    res.status(400).json({ error: 'Webhook signature verification failed' })
    return
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session
      const userId = session.metadata?.userId
      const plan = session.metadata?.plan as 'MONTHLY' | 'YEARLY'
      if (userId && plan && session.subscription) {
        await activateUserSubscription({
          userId,
          plan,
          subscriptionId: session.subscription as string,
        })
      }
      break
    }
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
        const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'ACTIVE',
              renewalDate: new Date((sub.current_period_end) * 1000),
            },
          })
        }
      }
      break
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice
      if (invoice.subscription) {
        const user = await prisma.user.findFirst({
          where: { stripeSubscriptionId: invoice.subscription as string },
        })
        if (user) {
          await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: 'LAPSED' } })
        }
      }
      break
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object as Stripe.Subscription
      const user = await prisma.user.findFirst({ where: { stripeSubscriptionId: sub.id } })
      if (user) {
        await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: 'CANCELLED' } })
      }
      break
    }
  }

  res.json({ received: true })
})

// ── POST /api/subscription/cancel ─────────────────────────────────────────────
router.post('/cancel', authMiddleware, subscriptionCheck, async (req: AuthRequest, res: Response): Promise<void> => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } })
  if (!user?.stripeSubscriptionId) {
    res.status(400).json({ error: 'No active subscription found' })
    return
  }

  await stripe.subscriptions.cancel(user.stripeSubscriptionId)
  await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: 'CANCELLED' } })
  res.json({ message: 'Subscription cancelled' })
})

export default router
