# Hansetu Backend

REST API for the Hansetu B2B industrial marketplace. Built with **Node.js + Express + TypeScript**, **Drizzle ORM**, and **PostgreSQL (Neon serverless)**.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [Running Migrations & Seeds](#running-migrations--seeds)
- [Production Deployment](#production-deployment)
  - [Docker](#docker)
  - [AWS (EC2 / Elastic Beanstalk)](#aws)
  - [Railway / Render / Fly.io](#railway--render--flyio)
  - [VPS / Bare Metal](#vps--bare-metal)
- [Reverse Proxy (Nginx)](#reverse-proxy-nginx)
- [Environment Checklist](#environment-checklist)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 20 LTS |
| Language | TypeScript 5 |
| Framework | Express 4 |
| ORM | Drizzle ORM |
| Database | PostgreSQL (Neon serverless — swap freely) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| Email OTP | Nodemailer (SMTP) |
| SMS OTP | Twilio |
| GST Verify | Masters India API (with DB cache) |
| Validation | Zod |
| API Docs | Swagger UI — `/api-docs` |

---

## Project Structure

```
hansetu-backend/
├── src/
│   ├── app.ts                  # Express app factory (routes, middleware)
│   ├── server.ts               # HTTP server entry point
│   ├── config/
│   │   ├── env.ts              # Typed env vars
│   │   └── swagger.ts          # Swagger/OpenAPI config
│   ├── db/
│   │   ├── index.ts            # Drizzle client + pg pool
│   │   ├── schema.ts           # All table definitions
│   │   ├── migrations/         # Raw SQL migration scripts
│   │   └── seeds/              # Seed data scripts
│   ├── middlewares/
│   │   ├── auth.middleware.ts  # JWT guard
│   │   └── error.middleware.ts # Global error handler
│   ├── modules/                # Feature modules (route/controller/service/repo)
│   │   ├── auth/
│   │   ├── user/
│   │   ├── industry/
│   │   ├── category/
│   │   ├── product/
│   │   ├── manufacturer/
│   │   ├── raw-material/
│   │   ├── machine/
│   │   ├── offer/
│   │   ├── calibration-service/
│   │   ├── testing-service/
│   │   ├── hr-service/
│   │   ├── training-program/
│   │   ├── student-service/
│   │   ├── financial-service/
│   │   ├── supplier/
│   │   └── gst/
│   ├── services/
│   │   ├── email.service.ts    # Nodemailer OTP emails
│   │   └── sms.service.ts      # Twilio OTP SMS
│   └── utils/
│       └── logger.ts
├── .env                        # Local env (never commit)
├── package.json
└── tsconfig.json
```

---

## API Overview

| Prefix | Module |
|--------|--------|
| `POST /api/auth/signup` | Register new business account |
| `POST /api/auth/login` | Login, returns JWT |
| `POST /api/auth/gst-verify` | Verify GST number (DB cache → Masters India) |
| `POST /api/auth/send-email-otp` | Send OTP to email via SMTP |
| `POST /api/auth/verify-email-otp` | Verify email OTP, returns `otpToken` |
| `POST /api/auth/send-phone-otp` | Send OTP via Twilio SMS |
| `POST /api/auth/verify-phone-otp` | Verify phone OTP |
| `GET /api/industries` | List all industries |
| `GET /api/categories` | List product categories + subcategories |
| `GET /api/products` | List products (filter: `categoryId`, `subcategoryId`) |
| `GET /api/manufacturers` | List manufacturers (filter: `industrySlug`) |
| `GET /api/raw-materials` | List raw materials |
| `GET /api/machines` | List machines |
| `GET /api/offers` | List offers |
| `GET /api/calibration-services` | Calibration services |
| `GET /api/testing-services` | Testing services |
| `GET /api/hr-services` | HR services |
| `GET /api/training-programs` | Training programs |
| `GET /api/student-services` | Student services |
| `GET /api/financial-services` | Financial services |
| `GET /api/suppliers` | Suppliers (filter: `industrySlug`) |
| `GET /api/health` | Health check |
| `GET /api-docs` | Swagger UI |
| `GET /api/swagger.json` | OpenAPI spec (used by frontend codegen) |

---

## Local Development

### Prerequisites

- Node.js >= 20
- npm >= 9
- A PostgreSQL database (Neon free tier works out of the box)

### Steps

```bash
# 1. Clone and install
git clone <repo-url>
cd hansetu-backend
npm install

# 2. Configure environment
cp .env.example .env    # then fill in real values (see below)

# 3. Run migrations
npx ts-node-dev --transpile-only src/db/migrations/create_new_tables.ts
npx ts-node-dev --transpile-only src/db/migrations/create_service_tables.ts
npx ts-node-dev --transpile-only src/db/migrations/create_gst_table.ts

# 4. Seed the database
npm run db:seed

# 5. Start dev server (hot reload)
npm run dev
```

Server runs at `http://localhost:3000`.  
Swagger UI at `http://localhost:3000/api-docs`.

---

## Environment Variables

Create a `.env` file in the project root:

```env
# ── Server ────────────────────────────────────────────────
PORT=3000

# ── Database (Neon / any Postgres) ───────────────────────
DATABASE_URL='postgresql://user:password@host/dbname?sslmode=require'

# ── Auth ─────────────────────────────────────────────────
JWT_SECRET='change-this-to-a-long-random-string'

# ── GST Verification (Masters India) ─────────────────────
# Get sandbox key from: https://developers.mastersindia.co
MASTERS_INDIA_API_KEY='your_sandbox_or_prod_api_key'

# ── Email OTP (Nodemailer / SMTP) ────────────────────────
# Gmail: enable 2FA → generate App Password
SMTP_HOST='smtp.gmail.com'
SMTP_PORT='587'
SMTP_USER='your_email@gmail.com'
SMTP_PASS='your_16char_app_password'
EMAIL_FROM='Hansetu <your_email@gmail.com>'

# ── SMS OTP (Twilio) ─────────────────────────────────────
# Get from: https://console.twilio.com
TWILIO_ACCOUNT_SID='ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'
TWILIO_AUTH_TOKEN='your_auth_token'
TWILIO_PHONE_NUMBER='+1234567890'

# ── CORS (set to frontend URL in production) ─────────────
FRONTEND_URL='http://localhost:5173'
```

> **Security note:** Never commit `.env` to version control. Use your cloud provider's secrets manager in production (AWS Secrets Manager, Railway Env, Render Env Groups, etc.).

---

## Database

The app uses **Drizzle ORM** against any PostgreSQL-compatible database.

**Recommended:** [Neon](https://neon.tech) (serverless Postgres, free tier, no cold starts).

**Alternatives:** AWS RDS, Supabase, Railway Postgres, self-hosted Postgres.

To switch databases, just update `DATABASE_URL` in `.env` — no code changes needed.

### Tables

| Table | Purpose |
|-------|---------|
| `users` | Registered business accounts |
| `gst_info` | GST verification cache (Masters India results) |
| `industries` | Industry master data |
| `categories` | Product categories with subcategories |
| `products` | Product catalog |
| `manufacturers` | Manufacturer profiles |
| `raw_materials` | Raw material listings |
| `machines` | Machine/equipment listings |
| `offers` | Special offers and deals |
| `calibration_services` | Calibration service providers |
| `testing_services` | Testing & QA services |
| `hr_services` | HR service providers |
| `training_programs` | Training and certification programs |
| `student_services` | Student placement services |
| `financial_services` | Financial service providers |
| `suppliers` | Raw material suppliers |

---

## Running Migrations & Seeds

```bash
# Run all migrations (safe — CREATE TABLE IF NOT EXISTS)
npx ts-node-dev --transpile-only src/db/migrations/create_new_tables.ts
npx ts-node-dev --transpile-only src/db/migrations/create_service_tables.ts
npx ts-node-dev --transpile-only src/db/migrations/create_gst_table.ts

# Seed all data (industries, categories, products, manufacturers, etc.)
npm run db:seed

# Browse DB visually
npm run db:studio     # opens Drizzle Studio in browser
```

---

## Production Deployment

### Docker

**Dockerfile** (place in project root):

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
EXPOSE 3000
CMD ["node", "dist/server.js"]
```

```bash
# Build image
docker build -t hansetu-backend .

# Run (pass env file)
docker run -p 3000:3000 --env-file .env hansetu-backend
```

**docker-compose.yml** (for local full-stack):

```yaml
version: "3.9"
services:
  backend:
    build: ./hansetu-backend
    ports:
      - "3000:3000"
    env_file:
      - ./hansetu-backend/.env
    restart: unless-stopped

  frontend:
    build: ./hansetu-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

---

### AWS

#### Option A — EC2

```bash
# On EC2 (Ubuntu 22.04)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone <repo-url> /opt/hansetu-backend
cd /opt/hansetu-backend
npm ci
npm run build

# Run migrations + seed
node dist/db/migrations/...   # or use ts-node for migration scripts

# Install PM2 process manager
npm install -g pm2
pm2 start dist/server.js --name hansetu-backend
pm2 startup
pm2 save
```

Set env vars in `/etc/environment` or use **AWS Systems Manager Parameter Store**:

```bash
# Store a secret
aws ssm put-parameter --name "/hansetu/prod/DATABASE_URL" \
  --value "postgresql://..." --type SecureString

# Inject at runtime via start script
export DATABASE_URL=$(aws ssm get-parameter --name "/hansetu/prod/DATABASE_URL" \
  --with-decryption --query Parameter.Value --output text)
```

#### Option B — Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Init and deploy
eb init hansetu-backend --platform "Node.js 20"
eb create hansetu-backend-prod
eb setenv PORT=3000 DATABASE_URL=... JWT_SECRET=...
eb deploy
```

#### Option C — ECS / Fargate (containerised)

1. Push Docker image to ECR
2. Create ECS task definition with env vars from Secrets Manager
3. Create Fargate service behind an ALB

---

### Railway / Render / Fly.io

These are the fastest zero-config options:

#### Railway

```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

Set env vars in the Railway dashboard under **Variables**.

#### Render

1. Connect GitHub repo in Render dashboard
2. Set **Build Command:** `npm install && npm run build`
3. Set **Start Command:** `node dist/server.js`
4. Add env vars under **Environment**

#### Fly.io

```bash
# Install flyctl, then:
fly launch
fly secrets set DATABASE_URL="..." JWT_SECRET="..." ...
fly deploy
```

---

### VPS / Bare Metal

```bash
# 1. Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. Install PM2
npm install -g pm2

# 3. Deploy app
git clone <repo> /opt/hansetu-backend
cd /opt/hansetu-backend
npm ci
npm run build

# 4. Create env file
sudo nano /opt/hansetu-backend/.env   # fill in all values

# 5. Start with PM2
pm2 start dist/server.js --name hansetu-backend \
  --env production
pm2 startup systemd
pm2 save
```

---

## Reverse Proxy (Nginx)

Install Nginx and point it at the Node process:

```nginx
# /etc/nginx/sites-available/hansetu-backend
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/hansetu-backend \
           /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# HTTPS via Let's Encrypt
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

---

## Environment Checklist

Before going to production, verify every item:

- [ ] `DATABASE_URL` points to production database
- [ ] `JWT_SECRET` is a long random string (not the default)
- [ ] `MASTERS_INDIA_API_KEY` switched from sandbox to production
- [ ] `SMTP_USER` / `SMTP_PASS` configured and verified (send a test email)
- [ ] `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` / `TWILIO_PHONE_NUMBER` set
- [ ] `FRONTEND_URL` set to your production frontend domain (CORS)
- [ ] All migrations have been run against the production database
- [ ] Seed data loaded (`npm run db:seed`)
- [ ] HTTPS enabled on the API domain
- [ ] PM2 / container restart policy configured
- [ ] Health check passing: `GET /api/health`
- [ ] Swagger UI disabled or protected in production (optional)
