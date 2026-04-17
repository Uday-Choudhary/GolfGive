import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // ── Charities ──────────────────────────────────────────────────────────────
  const charity1 = await prisma.charity.upsert({
    where: { id: 'charity-1' },
    update: {},
    create: {
      id: 'charity-1',
      name: 'Fairways for Youth',
      description:
        'Providing underprivileged youth access to golf coaching, equipment, and community through the sport we love.',
      mission: 'Every child deserves a chance to experience the joy of golf and the values it teaches.',
      imageUrls: [
        'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?w=800',
        'https://images.unsplash.com/photo-1611374243504-0297a44b14a2?w=800',
      ],
      isFeatured: true,
      category: 'Youth Sports',
      website: 'https://fairwaysforyouth.org',
      events: {
        create: [
          {
            title: 'Junior Open Day',
            description: 'Free coaching sessions for ages 8–16 at local clubs',
            date: new Date('2026-05-15'),
            location: 'Wentworth Golf Club',
          },
          {
            title: 'Charity Scramble',
            description: 'Annual fundraising tournament in aid of youth programmes',
            date: new Date('2026-06-20'),
            location: 'Royal Birkdale',
          },
        ],
      },
    },
  })

  const charity2 = await prisma.charity.upsert({
    where: { id: 'charity-2' },
    update: {},
    create: {
      id: 'charity-2',
      name: 'Green Heart Foundation',
      description:
        'Restoring natural habitats adjacent to golf courses, making every round a vote for our planet.',
      mission: 'Golf courses can be engines of environmental restoration when managed with purpose.',
      imageUrls: [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
      ],
      isFeatured: false,
      category: 'Environment',
      website: 'https://greenheartfoundation.org',
      events: {
        create: [
          {
            title: 'Tree Planting Day',
            description: 'Community tree planting at golf course perimeters',
            date: new Date('2026-04-22'),
            location: 'Sunningdale Golf Club',
          },
        ],
      },
    },
  })

  const charity3 = await prisma.charity.upsert({
    where: { id: 'charity-3' },
    update: {},
    create: {
      id: 'charity-3',
      name: 'Veterans on the Fairway',
      description:
        'Using golf as therapy and community for veterans — proven to reduce isolation and improve mental wellbeing.',
      mission: 'Golf heals. We bring veterans to the course and let the sport do the rest.',
      imageUrls: [
        'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800',
      ],
      isFeatured: false,
      category: 'Veterans',
      website: 'https://veteransfairway.org',
      events: {
        create: [
          {
            title: "Veterans' Captain's Day",
            description: 'Annual golf day for veterans and their families',
            date: new Date('2026-07-10'),
            location: 'Gleneagles',
          },
        ],
      },
    },
  })

  // ── Admin User ─────────────────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('Admin@1234', 12)
  await prisma.user.upsert({
    where: { email: 'admin@golfgive.com' },
    update: {},
    create: {
      email: 'admin@golfgive.com',
      name: 'Platform Admin',
      passwordHash,
      role: 'ADMIN',
      subscriptionStatus: 'ACTIVE',
      charityId: charity1.id,
      charityPercent: 10,
    },
  })

  // ── Demo Subscriber ────────────────────────────────────────────────────────
  const demoHash = await bcrypt.hash('Demo@1234', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@golfgive.com' },
    update: {},
    create: {
      email: 'demo@golfgive.com',
      name: 'Alex Johnson',
      passwordHash: demoHash,
      role: 'SUBSCRIBER',
      subscriptionStatus: 'ACTIVE',
      subscriptionPlan: 'MONTHLY',
      renewalDate: new Date('2026-05-17'),
      charityId: charity1.id,
      charityPercent: 15,
    },
  })

  // Demo scores
  const scoreDates = [
    new Date('2026-04-10'),
    new Date('2026-04-05'),
    new Date('2026-03-28'),
    new Date('2026-03-20'),
    new Date('2026-03-12'),
  ]
  const scoreValues = [32, 28, 35, 27, 31]

  for (let i = 0; i < 5; i++) {
    await prisma.score.upsert({
      where: { userId_date: { userId: demoUser.id, date: scoreDates[i] } },
      update: {},
      create: {
        userId: demoUser.id,
        score: scoreValues[i],
        date: scoreDates[i],
      },
    })
  }

  // ── Sample Draws ───────────────────────────────────────────────────────────
  await prisma.draw.upsert({
    where: { id: 'draw-march-2026' },
    update: {},
    create: {
      id: 'draw-march-2026',
      month: new Date('2026-03-01'),
      status: 'PUBLISHED',
      drawNumbers: [7, 15, 22, 31, 38],
      drawMode: 'RANDOM',
      jackpotPool: 4200,
      fourMatchPool: 3675,
      threeMatchPool: 2625,
      jackpotRolledOver: true,
      rolledOverAmount: 4200,
      publishedAt: new Date('2026-03-31'),
    },
  })

  await prisma.draw.upsert({
    where: { id: 'draw-april-2026' },
    update: {},
    create: {
      id: 'draw-april-2026',
      month: new Date('2026-04-01'),
      status: 'PENDING',
      drawNumbers: [],
      drawMode: 'RANDOM',
      jackpotPool: 8400,
      fourMatchPool: 3675,
      threeMatchPool: 2625,
      jackpotRolledOver: false,
    },
  })

  console.log('✅ Seed complete!')
  console.log('   Admin:      admin@golfgive.com  /  Admin@1234')
  console.log('   Subscriber: demo@golfgive.com   /  Demo@1234')
  console.log(`   Charities:  ${charity1.name}, ${charity2.name}, ${charity3.name}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
