# Multi-stage production build for MAHEALL API (NestJS + Fastify)
# Base Stage
FROM node:20-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@latest --activate
RUN apk add --no-cache libc6-compat

# Dependencies Stage
FROM base AS dependencies
WORKDIR /app

# Copy root manifest and workspace configuration
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

# Install all dependencies with frozen lockfile
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# Build Stage
FROM base AS builder
WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY --from=dependencies /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=dependencies /app/apps/api/node_modules ./apps/api/node_modules

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml tsconfig.base.json ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package and API
RUN pnpm --filter @maheall/shared build || true
RUN pnpm --filter @maheall/api build

# Production Dependencies Stage (pruned)
FROM base AS prod-dependencies
WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile

# Runner Stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001

# Create unprivileged system user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 maheall

# Copy production node_modules and built artifacts
COPY --from=prod-dependencies --chown=maheall:nodejs /app/node_modules ./node_modules
COPY --from=prod-dependencies --chown=maheall:nodejs /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=prod-dependencies --chown=maheall:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=maheall:nodejs /app/packages/shared ./packages/shared
COPY --from=builder --chown=maheall:nodejs /app/apps/api/dist ./apps/api/dist
COPY --from=builder --chown=maheall:nodejs /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder --chown=maheall:nodejs /app/package.json ./package.json

USER maheall

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/api/v1/health || exit 1

CMD ["node", "apps/api/dist/main.js"]
