FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.22.0 --activate

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/types/package.json packages/types/
COPY packages/validation/package.json packages/validation/
COPY services/api/package.json services/api/

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @sundogo/types build
RUN pnpm --filter @sundogo/validation build
ENV DATABASE_URL="postgresql://unused:unused@localhost:5432/unused"
RUN pnpm --filter @sundogo/api db:generate
RUN pnpm --filter @sundogo/api build

WORKDIR /app/services/api
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/main.js"]
