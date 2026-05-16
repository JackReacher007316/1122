# ─── Frontend Dockerfile ──────────────────────────────────────────────────────
# Multi-stage build: builds static assets, served by the backend
FROM node:20-alpine AS builder

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# The dist/ folder is now at /app/dist
# In production, the backend serves these static files.
# This image is used only for building.
FROM alpine:latest
COPY --from=builder /app/dist /dist
CMD ["echo", "Frontend build complete. Files in /dist"]
