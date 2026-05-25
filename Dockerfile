# ══════════════════════════════════════════════════════════════════════════════
#  Hansetu Backend — Dockerfile
#  Place this file at: ./hansetu-backend/Dockerfile
# ══════════════════════════════════════════════════════════════════════════════

# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first (better layer caching — only reinstalls when these change)
COPY package*.json ./

# Install ALL dependencies (including devDeps like ts-node, typescript)
RUN npm ci

# Copy source code
COPY . .

# Compile TypeScript → dist/
RUN npm run build

# ── Stage 2: Runtime ──────────────────────────────────────────────────────────
FROM node:20-alpine AS runtime

WORKDIR /app

# Copy only what's needed to run
COPY --from=builder /app/dist        ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

# Copy migration + seed source files so ts-node can run them at startup
# (Migrations are TS files — they need ts-node, not the compiled dist)
COPY --from=builder /app/src/db      ./src/db
COPY --from=builder /app/tsconfig.json ./

# Install ts-node + typescript globally so the startup script can run migrations
RUN npm install -g ts-node typescript

# Copy the startup script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000

# Use entrypoint script (runs migrations → seed → server)
CMD ["./docker-entrypoint.sh"]
