# SundoGo Architecture

## Overview

SundoGo is a PWA-based local tricycle ride-booking platform organized as a pnpm monorepo managed by Turborepo.

## Monorepo Structure

```
sundogo/
├── apps/
│   ├── passenger/     # Passenger PWA (React + Vite)
│   ├── driver/        # Driver PWA (React + Vite)
│   └── admin/         # Admin PWA (React + Vite)
├── services/
│   └── api/           # Backend API (NestJS)
├── packages/
│   ├── config/        # Shared configuration
│   ├── types/         # Shared TypeScript types & enums
│   ├── ui/            # Shared UI components
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
- **PWA:** vite-plugin-pwa
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

## Frontend Apps

All three PWAs share the same tech stack and follow identical patterns:

### Passenger App (`apps/passenger`)
- Book rides, track drivers, manage emergency contacts, view trip history, leave reviews.

### Driver App (`apps/driver`)
- Accept/decline bookings, update availability & location, manage vehicle info, view earnings.

### Admin App (`apps/admin`)
- Dashboard with platform stats, manage passengers/drivers, review driver verifications, manage service areas and pricing.

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
- Emergency alerts

## Deployment

### Frontend → Vercel
Each PWA is deployed as a separate Vercel project with SPA rewrites configured in per-app `vercel.json` files.

### Backend → Railway
The NestJS API is deployed on Railway using Nixpacks. The service runs `pnpm --filter @sundogo/api start:prod` and exposes a health check endpoint at `/`.

### CI/CD
GitHub Actions runs on push to `master` and PRs:
1. Checkout code
2. Install pnpm 9 + Node.js 20
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
