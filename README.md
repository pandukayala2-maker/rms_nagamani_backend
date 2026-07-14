# QR Menu & POS — Backend

Express + TypeScript + Prisma + PostgreSQL API for the QR Menu & POS Restaurant
Management System. Companion frontend repo:
[rms_ngamani_frontend](https://github.com/pandukayala2-maker/rms_ngamani_frontend).

## Stack

Node.js, Express, TypeScript, Prisma ORM, PostgreSQL, JWT (access + refresh),
role-based access control, Multer, `qrcode`, `pdfkit`, Swagger, Winston.

## Local setup

Requires Node 20+ and a PostgreSQL database (e.g. a free one from
[neon.com](https://neon.com)).

```bash
cp .env.example .env         # edit DATABASE_URL and secrets
npm install
npx prisma migrate dev --name init
npm run seed                 # demo branch, users, menu, tables, QR codes
npm run dev                  # http://localhost:5000, Swagger at /api-docs
```

## Demo logins (after seeding)

| Role    | Email                    | Password      |
|---------|--------------------------|----------------|
| Admin   | admin@spiceroute.com     | Password@123   |
| Manager | manager@spiceroute.com   | Password@123   |
| Cashier | cashier@spiceroute.com   | Password@123   |

## Deploying to Render (free tier)

1. New Web Service → connect this repo.
2. Build command: `npm install && npx prisma generate && npm run build`
   Start command: `npx prisma migrate deploy && npm start`
3. Environment variables: `DATABASE_URL` (from Neon), `NODE_ENV=production`,
   `API_VERSION=v1`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`,
   `RESET_PASSWORD_SECRET`, `COOKIE_SECRET` (all random strings), and
   `CLIENT_URL` set to your deployed frontend's URL (no trailing slash).
   Render sets `PORT` automatically — don't add it.
4. After the first deploy, run `npm run seed` once from Render's **Shell** tab.

> **Free-tier caveat**: Render's free web services use an ephemeral disk —
> uploaded menu/category images and generated QR code images are wiped on
> redeploy. Fine for a demo; for production, move uploads to an object store
> (S3 / Cloudflare R2) or add a paid persistent disk.

## Architecture

Each domain lives in `src/modules/<name>/` as
`{routes,controller,service,repository,validator}.ts`. Global error handling
in `src/middleware/errorHandler.ts`, JWT + RBAC in `src/middleware/auth.ts`,
Prisma schema in `prisma/schema.prisma`. Swagger UI at `/api-docs`.
