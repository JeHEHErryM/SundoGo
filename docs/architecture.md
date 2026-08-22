# SundoGo Architecture

## Overview

SundoGo is a PWA-based local tricycle ride-booking platform organized as a pnpm monorepo managed by Turborepo.

## Monorepo Structure

```
sundogo/
├── apps/
│   └── landing/       # Unified SPA (landing + passenger/driver/admin portals)
├── services/
│   └── api/           # Backend API (NestJS)
├── packages/
│   ├── config/        # Shared configuration
│   ├── types/         # Shared TypeScript types & enums
│   ├── ui/            # Shared UI components
│   ├── auth/          # Shared auth flows (login/register forms, layouts)
│   └── validation/    # Shared validation schemas (Zod/class-validator)
├── turbo.json         # Turborepo pipeline config
└── pnpm-workspace.yaml
```

## Technology Stack

### Frontend
- **Framework:** React 19 + TypeScript
- **Build tool:** Vite 6
- **Styling:** Tailwind CSS 4
- **State:** Zustand
- **Data fetching:** TanStack React Query + Axios
- **Routing:** React Router 7
- **PWA:** vite-plugin-pwa (service worker, manifest, offline precache)
- **Maps:** Mapbox GL JS
- **Icons:** Lucide React

### Backend
- **Framework:** NestJS 11
- **Language:** TypeScript
- **ORM:** Prisma 6
- **Auth:** Passport (JWT + Local strategies)
- **Real-time:** Socket.IO
- **Validation:** class-validator + class-transformer

### Database
- **Engine:** PostgreSQL
- **Migrations:** Prisma Migrate

## Frontend App (`apps/landing`)

A single unified SPA serves the landing page and all three role portals.
Routes are role-prefixed and lazily code-split per page:

- `/` — Marketing landing page
- `/login`, `/portal` — Unified login and sign-up portal
- `/user/passenger/*` — Book rides, track drivers, manage emergency contacts, view trip history, leave reviews.
- `/user/driver/*` — Accept/decline bookings, update availability & location, manage vehicle info, view earnings.
- `/user/admin/*` — Dashboard with platform stats, manage passengers/drivers, review driver verifications, manage service areas and pricing.

## Backend API (`services/api`)

NestJS application with modular architecture:

| Module | Purpose |
|---|---|
| Auth | Registration, login, JWT tokens, role guards |
| Passengers | Profile CRUD, emergency contacts |
| Drivers | Profile CRUD, location updates, availability |
| Driver Verification | Document submission, admin review/approval |
| Vehicles | Vehicle CRUD for drivers |
| Bookings | Create, search, cancel, status updates |
| Trips | Trip lifecycle, location history |
| Payments | Record payments, driver earnings |
| Notifications | User notifications, read/unread tracking |
| Reviews | Passenger reviews for drivers |
| Service Areas | Geofence definitions, location validation |
| Pricing | Fare estimation, pickup fee rules, fare configs |
| Admin | Dashboard stats, user management |

## Real-time (Socket.IO)

Socket.IO handles live updates:
- Driver location broadcasting during trips
- Booking status change notifications
- Emergency alerts (passenger → driver during an active trip)

## Deployment

### Frontend → Vercel
The unified SPA (`apps/landing`) is deployed as a single Vercel project
(`sundo-go.vercel.app`) with SPA rewrites configured in `vercel.json`.

### Backend → Railway
The NestJS API is deployed on Railway via Docker. The service runs
`pnpm --filter @sundogo/api start:prod` and exposes a health check endpoint at `/`.

### CI/CD
GitHub Actions runs on push to `master` and PRs:
1. Checkout code
2. Install pnpm + Node.js 22
3. `pnpm install --frozen-lockfile`
4. `pnpm build` (Turborepo)
5. `pnpm lint` (Turborepo)

## Development Setup

```bash
# Install dependencies
pnpm install

# Start all apps + API in dev mode
pnpm dev

# Run database migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Prisma Studio
pnpm db:studio

# Generate Prisma client
pnpm db:generate

# Reset database
pnpm db:reset
```

## Environment Variables

See `.env.example` for required configuration. Key variables:
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — Secret for JWT signing
- `JWT_EXPIRES_IN` — Token expiry (e.g., `7d`)
