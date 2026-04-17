import { Response, NextFunction } from 'express'
import { AuthRequest } from './authMiddleware'
import { prisma } from '../lib/prisma'

export async function subscriptionCheck(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Unauthenticated' })
    return
  }

  // Admins bypass subscription check
  if (req.user.role === 'ADMIN') {
    next()
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    select: { subscriptionStatus: true },
  })

  if (!user || user.subscriptionStatus !== 'ACTIVE') {
    res.status(403).json({ error: 'Active subscription required' })
    return
  }

  next()
}
