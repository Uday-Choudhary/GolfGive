# GolfGive

GolfGive is a subscription-based golf platform that combines competitive play, transparent charity giving, and monthly prize draws into a single, cohesive experience. Members submit their Stableford golf scores each month, a portion of every subscription goes directly to a charity of their choosing, and a monthly number draw determines cash prize winners across three tiers.

The platform is built as a production-grade full-stack application with a React frontend, an Express REST API, a PostgreSQL database managed through Prisma, and Stripe handling all subscription and payment logic.

**Live Application:** https://golf-give-six.vercel.app  
**Backend API:** https://golfgive-klzs.onrender.com  
**Repository:** https://github.com/Uday-Choudhary/GolfGive

---

## Screenshots

**Homepage**

<img src="./screenshots/HomePage1.png" alt="GolfGive Homepage" width="900" />

<img src="./screenshots/HomePage2.png" alt="GolfGive Homepage Features" width="900" />

**User Dashboard — Overview**

<img src="./screenshots/UserOverview.png" alt="User Dashboard Overview" width="900" />

**User Dashboard — Score Tracking**

<img src="./screenshots/UserScore.png" alt="User Score Tracking" width="900" />

**User Dashboard — My Charity**

<img src="./screenshots/UserCharity.png" alt="User Charity Selection" width="900" />

**Admin Panel — Draw Engine**

<img src="./screenshots/Admin-DrawEngine.png" alt="Admin Draw Engine" width="900" />

**Admin Panel — Charity Management**

<img src="./screenshots/AdminCharity.png" alt="Admin Charity Management" width="900" />

**Admin Panel — Reports**

<img src="./screenshots/AdminReports.png" alt="Admin Reports Dashboard" width="900" />

---

## How It Works

A user registers, selects a charity, and picks a subscription plan — either monthly at £9.99 or annually at £7.99 per month. Each month, they log up to five Stableford scores through their dashboard. At the end of the month, an admin runs the draw engine to select five winning numbers. Members whose submitted score totals match three, four, or all five numbers win prizes from tiered prize pools. Ten percent (or more, based on user preference) of every subscription is allocated to the member's chosen charity.

Winners are notified and must upload proof of their scores within seven days to claim their prize. Admins review submissions, mark payments, and manage the entire process through a dedicated admin panel.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS, Framer Motion |
| State Management | Zustand, TanStack Query |
| Forms and Validation | React Hook Form, Zod |
| Backend | Node.js, Express, TypeScript |
| Database | PostgreSQL (Neon serverless) via Prisma ORM |
| Authentication | JWT access tokens, HTTP-only refresh token cookies |
| Payments | Stripe Checkout + Webhooks |
| Email | Resend |
| Frontend Hosting | Vercel |
| Backend Hosting | Render |

---

## Project Structure

```
GolfGive/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/         # Navbar, Footer, DashboardLayout, AdminLayout
│   │   │   └── ui/             # Button, Input, Modal, Card, Badge, Spinner
│   │   ├── hooks/              # useAuth, useCharities, useDraws, useScores
│   │   ├── lib/                # Axios instance, Stripe loader, utilities
│   │   ├── pages/
│   │   │   ├── auth/           # Login, Register
│   │   │   ├── dashboard/      # Overview, MyScores, DrawHistory, MyCharity, Winnings
│   │   │   ├── admin/          # AdminPanel, AdminUsers, AdminDrawEngine, AdminCharities, AdminWinners, AdminReports
│   │   │   └── public/         # Home, Charities, Pricing
│   │   ├── router/             # React Router v7 config, ProtectedRoute, AdminRoute
│   │   └── store/              # Zustand auth store (sessionStorage persisted)
│   └── vercel.json             # SPA fallback routing config
└── backend/
    ├── prisma/
    │   ├── schema.prisma       # Full database schema
    │   └── seed.ts             # Demo data seed
    └── src/
        ├── lib/                # Prisma client, JWT helpers, email, draw engine, prize pool
        ├── middleware/         # Auth guard, admin guard, subscription check
        └── routes/
            ├── auth.ts
            ├── scores.ts
            ├── draws.ts
            ├── charities.ts
            ├── winners.ts
            ├── subscription.ts
            └── admin/          # Users, draws, charities, winners, reports
```

---

## Database Schema

The schema is built around six core models:

- **User** — Stores credentials, subscription state, Stripe identifiers, charity allocation, and role. Roles are `SUBSCRIBER` or `ADMIN`.
- **Score** — One score per user per date (unique constraint enforced at the database level). Stores Stableford points.
- **Draw** — Monthly draw record with draw numbers, prize pool amounts, status (`PENDING`, `SIMULATED`, `PUBLISHED`), and rollover tracking.
- **Winner** — Links a user and a draw. Stores match type (three, four, or five numbers), prize amount, proof upload URL, and payment status.
- **Charity** — Nonprofit organisations with descriptions, images, category, website, and associated events.
- **CharityEvent** — Upcoming events linked to a charity, shown on the public charity page.

---

## Authentication Flow

1. On login or registration, the server signs a short-lived JWT access token (returned in the response body) and a long-lived refresh token (sent as an HTTP-only, `SameSite=none`, `Secure` cookie).
2. The frontend stores the access token in Zustand, backed by `sessionStorage` so it survives full-page navigation events such as Stripe payment redirects.
3. Every API request attaches the access token via the `Authorization: Bearer` header.
4. When the access token expires (401 response), the Axios interceptor automatically calls `/api/auth/refresh`. If the refresh token cookie is valid, a new access token is issued silently.
5. Logout clears both the server-side refresh token hash (via database update) and the client-side session storage.

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Sign in |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Invalidate refresh token |
| GET | `/api/auth/me` | Get current user profile |

### Subscription
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/subscription/checkout` | Create Stripe Checkout session |
| POST | `/api/subscription/confirm` | Confirm checkout after redirect |
| POST | `/api/subscription/webhook` | Stripe webhook handler |
| DELETE | `/api/subscription` | Cancel subscription |

### Scores
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/scores` | Get current user's scores |
| POST | `/api/scores` | Submit a new score |
| DELETE | `/api/scores/:id` | Remove a score |

### Draws and Winners
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/draws` | List all published draws |
| GET | `/api/winners/me` | Get current user's winning history |

### Admin (requires `ADMIN` role)
| Method | Endpoint | Description |
|---|---|---|
| GET/POST/PATCH/DELETE | `/api/admin/users` | User management |
| GET/POST/PATCH | `/api/admin/draws` | Draw simulation and publishing |
| GET/POST/PATCH/DELETE | `/api/admin/charities` | Charity management |
| GET/PATCH | `/api/admin/winners` | Winner review and payout marking |
| GET | `/api/admin/reports` | Revenue, charity, and draw analytics |

---

## Local Development Setup

### Prerequisites

- Node.js 20 or later
- A Neon account for the PostgreSQL database (free tier sufficient)
- A Stripe account for payment processing
- A Resend account for transactional email

### 1. Clone the repository

```bash
git clone https://github.com/Uday-Choudhary/GolfGive.git
cd GolfGive
```

### 2. Configure backend environment variables

Create a `.env` file in the `backend/` directory:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST/neondb?sslmode=require
DIRECT_URL=postgresql://USER:PASSWORD@DIRECT_HOST/neondb?sslmode=require
JWT_SECRET=your_long_random_secret
JWT_REFRESH_SECRET=another_long_random_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESEND_API_KEY=re_...
CLIENT_URL=http://localhost:5173
NODE_ENV=development
PORT=4000
```

### 3. Configure frontend environment variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:4000/api
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

### 4. Run database migrations and seed

```bash
cd backend
npm install
npx prisma@5.21.0 migrate dev --name init
npx prisma@5.21.0 db seed
```

### 5. Start the backend

```bash
cd backend
npm run dev
```

The API will be available at `http://localhost:4000`.

### 6. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

### Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@golfgive.com | Admin@1234 |
| Subscriber | demo@golfgive.com | Demo@1234 |

These users and sample data (charities, scores, draws) are created by the seed script.

---

## Production Deployment

### Database (Neon)

1. Create a project on [neon.tech](https://neon.tech).
2. Copy the **pooled connection string** as `DATABASE_URL` and the **direct connection string** as `DIRECT_URL`.
3. Run `npx prisma@5.21.0 migrate deploy` from the backend directory to apply migrations to the production database.
4. Run `npx prisma@5.21.0 db seed` to populate initial charity and user data.

### Backend (Render)

1. Create a **Web Service** on [render.com](https://render.com) pointing to the repository root.
2. Set the **Root Directory** to `backend`.
3. Set the **Build Command** to `npm install && npx prisma@5.21.0 generate && npm run build`.
4. Set the **Start Command** to `npm start`.
5. Add the following environment variables in the Render dashboard:

```
DATABASE_URL         = (Neon pooled URL)
DIRECT_URL           = (Neon direct URL)
JWT_SECRET           = (strong random string)
JWT_REFRESH_SECRET   = (strong random string)
STRIPE_SECRET_KEY    = sk_live_...
STRIPE_WEBHOOK_SECRET= whsec_... (from Stripe dashboard webhook)
RESEND_API_KEY       = re_...
CLIENT_URL           = https://your-vercel-domain.vercel.app
NODE_ENV             = production
```

### Frontend (Vercel)

1. Import the repository on [vercel.com](https://vercel.com).
2. Set the **Root Directory** to `frontend`.
3. The framework preset should auto-detect as Vite.
4. Add the following environment variables:

```
VITE_API_URL                 = https://your-render-service.onrender.com/api
VITE_STRIPE_PUBLISHABLE_KEY  = pk_live_...
```

5. The `vercel.json` file in the frontend directory handles SPA routing, ensuring direct URL access works correctly.

### Stripe Webhook (Required for subscription activation)

After the backend is live on Render:

1. Go to the Stripe Dashboard — **Developers** — **Webhooks** — **Add Endpoint**.
2. Set the endpoint URL to `https://your-render-service.onrender.com/api/subscription/webhook`.
3. Select the events: `checkout.session.completed`, `invoice.paid`, `customer.subscription.deleted`.
4. Copy the generated **Signing Secret** (`whsec_...`) and add it to Render as `STRIPE_WEBHOOK_SECRET`.

---

## Key Design Decisions

**Session persistence via sessionStorage.** The JWT access token is stored in sessionStorage rather than in-memory only. This prevents users from being logged out when Stripe's external checkout page redirects them back to the application, which triggers a full page reload and wipes any in-memory state.

**SameSite=none for the refresh cookie.** The refresh token cookie uses `SameSite=none; Secure` in production. This is required because the frontend (Vercel) and backend (Render) are on different domains, and the Stripe payment flow involves a cross-site redirect. A `SameSite=strict` or `SameSite=lax` cookie would be silently dropped by the browser in this scenario.

**Pinned Prisma version.** The project uses Prisma 5.21.0 explicitly rather than the latest version. Prisma 7 introduced a breaking change that moves database URLs out of `schema.prisma` into a separate config file. Pinning the version avoids this migration overhead while the project remains stable.

**Pooled and direct Neon connections.** Neon requires a separate direct (non-pooled) connection string for migrations because the connection pooler does not support the extended query protocol that Prisma migrations depend on. The pooled URL is used for all application queries to benefit from connection reuse.

---

## License

This project is proprietary. All rights reserved.
