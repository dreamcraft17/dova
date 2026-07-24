# DOVA

Agricultural marketplace MVP connecting buyers with verified suppliers.  
Monorepo: NestJS API + Next.js storefront + shared types.

**Status:** MVP **codebase 100% complete** (Week 1–4 product scope). Go-live still needs staging + Paystack proof.  
**Stack:** Node.js · NestJS · Next.js · PostgreSQL / Redis (optional) · Paystack (NGN)  
**UI:** Design ported from the DOVA-Startup mockups (green / gold brand).

---

## Quick start (local, no Docker)

```bash
npm install
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local
npm run dev
```

| Service    | URL |
|------------|-----|
| Frontend   | http://localhost:3001 |
| API health | http://localhost:3000/api/v1/health |

Default local mode uses **in-memory** data (`USE_IN_MEMORY=true`) so you can run UI + API without PostgreSQL/Redis.

### Demo accounts

| Role     | Email                  | Password       |
|----------|------------------------|----------------|
| Admin    | `admin@dova.local`     | `admin1234`    |
| Supplier | `supplier@dova.local`  | `supplier1234` |

Register a customer from `/auth/register`, or apply as supplier at `/auth/supplier-register`.

---

## Repository layout

```
dova/
├── apps/
│   ├── backend/          # NestJS API (:3000)
│   └── frontend/         # Next.js storefront (:3001)
├── shared/               # Shared TypeScript types + min-order helpers
├── database/migrations/  # SQL schema (001_init, 002_week4, …)
├── scripts/              # migrate, seed, smoke-week4
├── .github/workflows/    # CI + DB migrate
└── vercel.json           # Frontend deploy on Vercel
```

Internal product docs (PRD/SRS/runbook/changelog) live in a local `docs/` folder that is **gitignored** and not published in this repository.

---

## Environment

**Root / backend** (see `.env.example`, `apps/backend/.env.example`):

| Variable | Purpose |
|----------|---------|
| `USE_IN_MEMORY` | `true` = local demo without DB |
| `DATABASE_URL` | PostgreSQL (required when in-memory is off) |
| `REDIS_URL` | Redis (sessions/cache in full mode) |
| `JWT_SECRET` | Auth signing secret |
| `FRONTEND_URL` | CORS / redirects (`http://localhost:3001`) |
| `PAYSTACK_SECRET_KEY` | Live/test Paystack; empty → mock payment in dev |
| `PAYSTACK_CURRENCY` | `NGN` |
| `ADMIN_PASSWORD` | Seed/bootstrap admin password |
| `RESEND_API_KEY` / `EMAIL_FROM` / `SUPPORT_EMAIL` | Optional email for contact / supplier notices |

**Frontend** (`apps/frontend/.env.local`):

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | e.g. `http://localhost:3000/api/v1` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Optional public key |

---

## Common commands

```bash
npm run dev              # API + frontend together
npm run build            # shared → backend → frontend
npm run typecheck
npm run test             # unit + backend tests
npm run test:unit
npm run test:coverage
npm run test:backend

# Real database (USE_IN_MEMORY=false)
npm run db:migrate
npm run db:seed
npm run db:seed:week3

# Smoke (API must be running)
npm run smoke:week4
```

CI: `.github/workflows/ci.yml`  
DB migrate workflow: `.github/workflows/database-migrate.yml` (needs `DATABASE_URL` secret)

---

## Product surface

| Area | Routes / notes |
|------|----------------|
| Storefront | `/`, `/products`, `/products/[id]`, `/about`, `/contact` |
| Commerce | `/cart`, `/checkout` (pickup / delivery + min order), Paystack verify |
| Auth | `/auth/login`, `/auth/register`, `/auth/supplier-register` |
| Customer | `/customer`, `/customer/orders/[id]` |
| Supplier | `/supplier` — products (image upload), stock, orders |
| Admin | `/admin` — users, suppliers, products, orders, contacts |

**Minimum order (NGN):** pickup **₦3,000** · delivery **₦5,000**.  
Payments use **Paystack** when `PAYSTACK_SECRET_KEY` is set; otherwise a **mock** flow (no real charges).

---

## Deployment

- **Frontend:** Vercel (`vercel.json`). Set `NEXT_PUBLIC_API_URL` to the public API base (`…/api/v1`).
- **Backend:** Node.js host (e.g. PM2) with `USE_IN_MEMORY=false`, `DATABASE_URL`, `REDIS_URL`, `JWT_SECRET`, `FRONTEND_URL`, `PAYSTACK_*`.
- After deploy: `npm run db:migrate`, then `npm run smoke:week4` against the public API.
- No Docker required for this MVP path.

---

## Notes

- MVP **codebase is complete**; remaining work is ops (staging URL + Paystack test txs).
- Currency UI is **₦ (NGN)**.
- Storefront follows the **DOVA-Startup** brand (green / gold).
- Contact form submissions appear under Admin → **Contacts**.
- Supplier products accept multipart **image** upload (JPG/PNG/WEBP, max 5 MB) or an image URL.
