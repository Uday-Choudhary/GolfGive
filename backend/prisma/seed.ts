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
      description: 'Providing underprivileged youth access to golf coaching, equipment, and community through the sport we love.',
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
          { title: 'Junior Open Day', description: 'Free coaching sessions for ages 8–16', date: new Date('2026-05-15'), location: 'Wentworth Golf Club' },
          { title: 'Charity Scramble', description: 'Annual fundraising tournament', date: new Date('2026-06-20'), location: 'Royal Birkdale' },
          { title: 'Schools Golf Challenge', description: 'Inter-school golf competition', date: new Date('2026-07-08'), location: 'St Andrews' },
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
      description: 'Restoring natural habitats adjacent to golf courses, making every round a vote for our planet.',
      mission: 'Golf courses can be engines of environmental restoration when managed with purpose.',
      imageUrls: [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800',
        'https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800',
      ],
      isFeatured: true,
      category: 'Environment',
      website: 'https://greenheartfoundation.org',
      events: {
        create: [
          { title: 'Tree Planting Day', description: 'Community tree planting at golf course perimeters', date: new Date('2026-04-22'), location: 'Sunningdale Golf Club' },
          { title: 'Wildlife Survey Walk', description: 'Guided nature walk and bird spotting', date: new Date('2026-05-30'), location: 'Muirfield' },
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
      description: 'Using golf as therapy and community for veterans — proven to reduce isolation and improve mental wellbeing.',
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
          { title: "Veterans' Captain's Day", description: 'Annual golf day for veterans and their families', date: new Date('2026-07-10'), location: 'Gleneagles' },
          { title: 'Remembrance Cup', description: 'Golf tournament in honour of fallen servicemen', date: new Date('2026-11-11'), location: 'Royal Lytham' },
        ],
      },
    },
  })

  const charity4 = await prisma.charity.upsert({
    where: { id: 'charity-4' },
    update: {},
    create: {
      id: 'charity-4',
      name: 'Swing Against Cancer',
      description: 'Raising funds for cancer research through charity golf events across the UK and Ireland.',
      mission: 'Every birdie matters. Every putt counts. Swing for a cure.',
      imageUrls: ['https://images.unsplash.com/photo-1576158114254-3ba81558b87d?w=800'],
      isFeatured: true,
      category: 'Health',
      website: 'https://swingagainstcancer.org',
      events: {
        create: [
          { title: 'Pink Ribbon Open', description: 'Annual charity tournament raising funds for breast cancer research', date: new Date('2026-10-01'), location: 'Carnoustie' },
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

  // ── Demo Users ────────────────────────────────────────────────────────────
  const users = [
    { email: 'demo@golfgive.com', name: 'Alex Johnson', password: 'Demo@1234', charity: charity1.id, plan: 'MONTHLY', percent: 15, renewal: '2026-05-17' },
    { email: 'sarah.m@golfgive.com', name: 'Sarah Mitchell', password: 'Demo@1234', charity: charity2.id, plan: 'YEARLY', percent: 20, renewal: '2027-04-17' },
    { email: 'james.k@golfgive.com', name: 'James Keller', password: 'Demo@1234', charity: charity3.id, plan: 'MONTHLY', percent: 10, renewal: '2026-05-10' },
    { email: 'emma.d@golfgive.com', name: 'Emma Davies', password: 'Demo@1234', charity: charity4.id, plan: 'MONTHLY', percent: 25, renewal: '2026-05-22' },
    { email: 'oliver.c@golfgive.com', name: 'Oliver Chen', password: 'Demo@1234', charity: charity1.id, plan: 'YEARLY', percent: 15, renewal: '2027-01-05' },
  ]

  const createdUsers: any[] = []
  for (const u of users) {
    const hash = await bcrypt.hash(u.password, 12)
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: {},
      create: {
        email: u.email,
        name: u.name,
        passwordHash: hash,
        role: 'SUBSCRIBER',
        subscriptionStatus: 'ACTIVE',
        subscriptionPlan: u.plan as any,
        renewalDate: new Date(u.renewal),
        charityId: u.charity,
        charityPercent: u.percent,
      },
    })
    createdUsers.push(user)
  }

  // ── Scores for all demo users ─────────────────────────────────────────────
  const scoreData = [
    [32, 28, 35, 27, 31, 29, 33, 26, 30, 34],
    [25, 30, 22, 28, 24, 26, 29, 23, 27, 31],
    [38, 42, 36, 40, 37, 39, 41, 35, 38, 43],
    [29, 31, 27, 33, 30, 28, 32, 26, 29, 34],
    [22, 24, 20, 26, 23, 21, 25, 19, 22, 27],
  ]

  for (let ui = 0; ui < createdUsers.length; ui++) {
    for (let si = 0; si < 10; si++) {
      const date = new Date()
      date.setDate(date.getDate() - si * 7)
      date.setHours(0, 0, 0, 0)
      await prisma.score.upsert({
        where: { userId_date: { userId: createdUsers[ui].id, date } },
        update: {},
        create: { userId: createdUsers[ui].id, score: scoreData[ui][si], date },
      })
    }
  }

  // ── Sample Draws ───────────────────────────────────────────────────────────
  await prisma.draw.upsert({
    where: { id: 'draw-feb-2026' },
    update: {},
    create: {
      id: 'draw-feb-2026',
      month: new Date('2026-02-01'),
      status: 'PUBLISHED',
      drawNumbers: [3, 11, 24, 33, 42],
      drawMode: 'ALGORITHMIC',
      jackpotPool: 3800,
      fourMatchPool: 2100,
      threeMatchPool: 1400,
      jackpotRolledOver: false,
      publishedAt: new Date('2026-02-28'),
    },
  })

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
  console.log('   Admin:       admin@golfgive.com   /  Admin@1234')
  console.log('   Demo User:   demo@golfgive.com    /  Demo@1234')
  console.log(`   + ${users.length - 1} additional demo subscribers seeded`)
  console.log(`   Charities: ${[charity1, charity2, charity3, charity4].map(c => c.name).join(', ')}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
