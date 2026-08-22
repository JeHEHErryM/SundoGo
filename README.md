# SundoGo

PWA-based local tricycle ride-booking platform for Mamburao, Occidental Mindoro, Philippines.

## Tech Stack

- **Frontend:** React 19, Vite, TypeScript, Tailwind CSS, shadcn/ui
- **Backend:** NestJS, Prisma, PostgreSQL, Socket.IO
- **Monorepo:** Turborepo + pnpm
- **Deployment:** Vercel (frontend) + Railway (backend)

## Structure

```
sundogo/
├── apps/
│   └── landing/       # Unified SPA (landing + passenger/driver/admin portals)
├── services/
│   └── api/           # NestJS backend
├── packages/
│   ├── ui/            # Shared UI components
│   ├── auth/          # Shared auth flows
│   ├── types/         # Shared TypeScript types
│   ├── validation/    # Shared validation schemas
│   └── config/        # Shared configuration
└── prisma/            # Database schema & migrations (services/api/prisma)
```

## Getting Started

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env

# Run development
pnpm dev
```

## License

Private
