# ─── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

# Copy workspace config
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./

# Copy all package.json files for workspace resolution
COPY apps/api/package.json apps/api/package.json
COPY packages/shared-types/package.json packages/shared-types/package.json
COPY packages/shared-schemas/package.json packages/shared-schemas/package.json
COPY packages/config/package.json packages/config/package.json

RUN pnpm install --frozen-lockfile || pnpm install

# ─── Stage 2: Build ────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages ./packages

# Copy source files
COPY apps/api ./apps/api
COPY packages ./packages
COPY pnpm-workspace.yaml package.json tsconfig.base.json ./

# Generate Prisma client
RUN cd apps/api && npx prisma generate

# ─── Stage 3: Run ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runner

RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
RUN apk add --no-cache dumb-init

WORKDIR /app

COPY --from=builder /app ./

EXPOSE 3001

# Use dumb-init for proper signal handling
CMD ["dumb-init", "node", "--import", "tsx", "apps/api/src/server.ts"]
