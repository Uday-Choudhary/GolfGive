-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUBSCRIBER', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'CANCELLED', 'LAPSED');

-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "DrawStatus" AS ENUM ('PENDING', 'SIMULATED', 'PUBLISHED');

-- CreateEnum
CREATE TYPE "DrawMode" AS ENUM ('RANDOM', 'ALGORITHMIC');

-- CreateEnum
CREATE TYPE "MatchType" AS ENUM ('FIVE', 'FOUR', 'THREE');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'SUBSCRIBER',
    "subscriptionStatus" "SubscriptionStatus" NOT NULL DEFAULT 'INACTIVE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionPlan" "Plan",
    "renewalDate" TIMESTAMP(3),
    "charityId" TEXT,
    "charityPercent" INTEGER NOT NULL DEFAULT 10,
    "refreshTokenHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Score" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Score_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Draw" (
    "id" TEXT NOT NULL,
    "month" DATE NOT NULL,
    "status" "DrawStatus" NOT NULL DEFAULT 'PENDING',
    "drawNumbers" INTEGER[],
    "drawMode" "DrawMode" NOT NULL DEFAULT 'RANDOM',
    "jackpotPool" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "fourMatchPool" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "threeMatchPool" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "jackpotRolledOver" BOOLEAN NOT NULL DEFAULT false,
    "rolledOverAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "publishedAt" TIMESTAMP(3),

    CONSTRAINT "Draw_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Winner" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "drawId" TEXT NOT NULL,
    "matchType" "MatchType" NOT NULL,
    "prizeAmount" DOUBLE PRECISION NOT NULL,
    "proofUrl" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Winner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Charity" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "mission" TEXT NOT NULL DEFAULT '',
    "imageUrls" TEXT[],
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT NOT NULL DEFAULT 'General',
    "website" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Charity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharityEvent" (
    "id" TEXT NOT NULL,
    "charityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "CharityEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Score_userId_date_key" ON "Score"("userId", "date");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Score" ADD CONSTRAINT "Score_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Winner" ADD CONSTRAINT "Winner_drawId_fkey" FOREIGN KEY ("drawId") REFERENCES "Draw"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharityEvent" ADD CONSTRAINT "CharityEvent_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
