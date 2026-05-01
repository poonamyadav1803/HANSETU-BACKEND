# ---------- Build Stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build


# ---------- Runtime Stage ----------
FROM node:20-alpine
WORKDIR /app

# Copy only required files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000
CMD sh -c "
node dist/db/migrations/create_new_tables.js &&
node dist/db/migrations/create_service_tables.js &&
node dist/db/migrations/create_gst_table.js &&
npm run db:seed &&
node dist/server.js
"