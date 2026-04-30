# ─── Backend Dockerfile ───────────────────────────────────────────────────────
# Ubuntu-based Node.js backend with Prisma + SQLite
FROM ubuntu:24.04

# Avoid interactive prompts during package installation
ENV DEBIAN_FRONTEND=noninteractive

# ── System dependencies ────────────────────────────────────────────────────────
RUN apt-get update && apt-get install -y \
    curl \
    ca-certificates \
    gnupg \
    && mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource-repo.gpg.key \
       | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_20.x nodistro main" \
       > /etc/apt/sources.list.d/nodesource.list \
    && apt-get update && apt-get install -y nodejs \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

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

# ── Persist the SQLite database via a volume ──────────────────────────────────
# The actual volume is declared in docker-compose.yml
RUN mkdir -p /app/prisma

# ── Expose backend port ────────────────────────────────────────────────────────
EXPOSE 3000

# ── Startup: migrate DB then start server ─────────────────────────────────────
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
