# ─── Backend Dockerfile ───────────────────────────────────────────────────────
# Production Node.js backend with Prisma + PostgreSQL
FROM node:20-alpine

# ── Working directory ──────────────────────────────────────────────────────────
WORKDIR /app

# ── Install dependencies ───────────────────────────────────────────────────────
# Copy package files first for layer caching
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ── Copy application source ────────────────────────────────────────────────────
COPY . .

# ── Generate Prisma client ─────────────────────────────────────────────────────
RUN npx prisma generate

# ── Expose backend port ────────────────────────────────────────────────────────
EXPOSE 3000

# ── Healthcheck ────────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/matches || exit 1

# ── Startup: push DB schema, seed, then start server ───────────────────────────
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node seed.js && node server.js"]
