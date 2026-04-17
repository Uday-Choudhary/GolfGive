import { Router, Response } from 'express'
import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { authMiddleware, AuthRequest } from '../../middleware/authMiddleware'
import { adminGuard } from '../../middleware/adminGuard'

const router = Router()
router.use(authMiddleware, adminGuard)

const charitySchema = z.object({
  name: z.string().min(2),
  description: z.string().min(10),
  mission: z.string().optional(),
  imageUrls: z.array(z.string().url()).optional(),
  isFeatured: z.boolean().optional(),
  category: z.string().optional(),
  website: z.string().url().optional(),
})

// POST /api/admin/charities
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = charitySchema.safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return }
  const charity = await prisma.charity.create({ data: parsed.data })
  res.status(201).json(charity)
})

// PATCH /api/admin/charities/:id
router.patch('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  const parsed = charitySchema.partial().safeParse(req.body)
  if (!parsed.success) { res.status(400).json({ error: parsed.error.errors[0].message }); return }
  const charity = await prisma.charity.update({ where: { id: req.params.id }, data: parsed.data })
  res.json(charity)
})

// DELETE /api/admin/charities/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.charity.delete({ where: { id: req.params.id } })
  res.json({ message: 'Charity deleted' })
})

// GET /api/admin/charities
router.get('/', async (_req: AuthRequest, res: Response): Promise<void> => {
  const charities = await prisma.charity.findMany({
    include: { _count: { select: { users: true } }, events: true },
    orderBy: { createdAt: 'desc' },
  })
  res.json(charities)
})

// POST /api/admin/charities/:id/events
router.post('/:id/events', async (req: AuthRequest, res: Response): Promise<void> => {
  const { title, description, date, location } = req.body
  const event = await prisma.charityEvent.create({
    data: {
      charityId: req.params.id,
      title,
      description: description || "",
      date: new Date(date),
      location: location || "",
    }
  })
  res.json(event)
})

// DELETE /api/admin/charities/:id/events/:eventId
router.delete('/:id/events/:eventId', async (req: AuthRequest, res: Response): Promise<void> => {
  await prisma.charityEvent.delete({
    where: { id: req.params.eventId, charityId: req.params.id }
  })
  res.json({ success: true })
})

export default router
