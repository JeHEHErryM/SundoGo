FROM node:22-slim

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
RUN pnpm --filter @sundogo/api db:generate
RUN pnpm --filter @sundogo/api build

WORKDIR /app/services/api
EXPOSE 3001
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
