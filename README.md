# Digital Heroes

Digital Heroes is a full-stack web platform where golfers submit scores, join monthly prize draws, and support charities through recurring subscriptions.

## Key Features

- User registration and secure login with JWT + refresh flow
- Monthly and yearly subscriptions with Stripe Checkout
- 5-score rolling entry system (Stableford style)
- Monthly draw engine with prize distribution logic
- Charity selection and contribution tracking
- Winner verification workflow and payout tracking
- Admin panel for users, draws, charities, reports, and winners

## Tech Stack

- Frontend: React 19, TypeScript, Vite, Tailwind CSS, Zustand, React Query
- Backend: Node.js, Express, TypeScript, Prisma ORM
- Database: PostgreSQL
- Payments: Stripe

## Screenshots

### App Screen 1

![App Screen 1](./screenshots/01-app-page.png)

### App Screen 2

![App Screen 2](./screenshots/02-app-page.png)

### App Screen 3

![App Screen 3](./screenshots/03-app-page.png)

## Project Structure

```text
DigitalHeroes/
├── backend/
│   ├── prisma/
│   ├── src/
│   ├── docker-compose.yml
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── screenshots/
├── .env.example
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (or Docker)
- Stripe test keys

## Setup

1. Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
```

2. Configure environment variables

- Copy values from `.env.example` into:
  - `backend/.env` for backend keys
  - `frontend/.env` (or `frontend/.env.local`) for `VITE_` keys

Required minimum variables:

```env
# backend/.env
DATABASE_URL=...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_MONTHLY_PRICE_ID=...
STRIPE_YEARLY_PRICE_ID=...
PORT=4000
NODE_ENV=development

# frontend/.env.local
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLISHABLE_KEY=...
```

3. Prepare database

```bash
cd backend
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

## Run Locally

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

Default URLs:

- Frontend: http://localhost:5173 (or Vite-assigned port)
- Backend: http://localhost:4000

## Production Build

Backend:

```bash
cd backend
npm run build
npm start
```

Frontend:

```bash
cd frontend
npm run build
npm run preview
```

## Production Readiness Checklist

- Set `NODE_ENV=production`
- Use production Stripe keys and webhook secret
- Configure strict CORS origin(s)
- Enforce HTTPS at hosting layer
- Run Prisma migrations in deploy pipeline
- Store secrets in host secret manager (not in repo)
- Enable server logging and health monitoring

## Assignment Notes

- This repository is intentionally cleaned for submission.
- Non-essential documentation and local artifacts were removed.

## Author

Uday Kumar Choudhary
