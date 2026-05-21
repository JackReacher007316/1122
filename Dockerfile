# ─── Ubuntu Base Image ────────────────────────────────────────────────────────
FROM ubuntu:22.04

# ─── Avoid prompts during package installation ────────────────────────────────
ENV DEBIAN_FRONTEND=noninteractive

# ─── Install system dependencies and Node.js ──────────────────────────────────
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    gnupg \
    ca-certificates \
    build-essential \
    python3 \
    sqlite3 \
    && curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# ─── Working directory ────────────────────────────────────────────────────────
WORKDIR /app

# ─── Copy Backend package files for dependency caching ────────────────────────
COPY backend/package.json backend/package-lock.json ./backend/

# ─── Install backend dependencies ─────────────────────────────────────────────
WORKDIR /app/backend
RUN npm ci --omit=dev

# ─── Copy source code ─────────────────────────────────────────────────────────
# Copy backend files
COPY backend/ ./
# Copy built frontend assets
COPY fantasy-league/dist/ /app/fantasy-league/dist/

# ─── Generate Prisma client ───────────────────────────────────────────────────
# Set database URL for build phase to local SQLite file
ENV DATABASE_URL="file:./dev.db"
RUN npx prisma generate

# ─── Expose port ──────────────────────────────────────────────────────────────
EXPOSE 3000

# ─── Environment variables ────────────────────────────────────────────────────
ENV PORT=3000
ENV NODE_ENV=production
ENV DATABASE_URL="file:./dev.db"
ENV JWT_SECRET="supersecret_jwt_key_for_fantasy_league"

# ─── Healthcheck ──────────────────────────────────────────────────────────────
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/api/matches || exit 1

# ─── Startup: Run migrations, seed the database, and start the node server ────
CMD ["sh", "-c", "npx prisma db push --accept-data-loss --skip-generate && node seed.js && node server.js"]
