# DOVA

Agricultural marketplace MVP — connects buyers with verified suppliers in Nigeria (NGN).

**Monorepo:** NestJS API · Next.js storefront · shared TypeScript types  
**Stack:** Node.js 20 · NestJS 11 · Next.js 16 · PostgreSQL · Redis (optional) · Paystack  
**UI:** DOVA-Startup brand (green / gold)

**Production:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)

---

## What it does

| Area | Capability |
|------|------------|
| Storefront | Browse, search, filter catalog; product detail with delivery slots |
| Commerce | Cart, checkout (pickup / delivery), Paystack or mock payment |
| Auth | Customer register/login, supplier application, role guards |
| Supplier | Product CRUD, image upload, stock, order fulfillment |
| Admin | Users, suppliers, products, orders, contacts, feedback moderation |
| Feedback | Native idea board at `/feedback` (replaces external FeedLog) |

**Minimum order:** pickup **₦3,000** · delivery **₦5,000** (see `shared/src/index.ts`).

---

## Prerequisites

- **Node.js 20+** and npm
- **PostgreSQL** — only when `USE_IN_MEMORY=false`
- **Redis** — optional; backend runs without it (in-memory session fallback)

No Docker required for local demo mode.

---

## Quick start (local, in-memory)

```bash
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

| Service | Dev URL (`npm run dev`) | Prod URL (`npm run start` in frontend) |
|---------|-------------------------|----------------------------------------|
| Storefront | http://localhost:3001 | http://localhost:3002 |
| API health | http://localhost:3000/api/v1/health | same |
| Feedback | http://localhost:3001/feedback | http://localhost:3002/feedback |

`USE_IN_MEMORY=true` (default in `.env.dev`) — no PostgreSQL/Redis needed for UI + API demo.

> **CORS note:** `apps/backend/.env.dev` sets `FRONTEND_URL=http://localhost:3002` for production-style `next start`. For `npm run dev` (port **3001**), set `FRONTEND_URL=http://localhost:3001` in `apps/backend/.env`.

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Register a customer at `/auth/register`, or apply as supplier at `/auth/supplier-register`.

---

## Repository layout

```
dova/
├── apps/
│   ├── backend/          # NestJS API (:3000)
│   └── frontend/         # Next.js storefront (dev :3001, prod :3002)
├── shared/               # Types, min-order helpers, product images
├── database/migrations/  # SQL schema (001_init, 002_week4, …)
├── scripts/              # migrate, seed, smoke-week4
├── tests/                # QA guides, env templates, test catalog
├── .github/workflows/    # CI + database migrate
└── vercel.json           # Frontend deploy on Vercel
```

---

## Environment variables

Templates: `.env.example`, `apps/backend/.env.example`, `tests/vps-*.env.example`  
**VPS / staging guide:** [`tests/ENV-SETUP.md`](./tests/ENV-SETUP.md)

### Backend (`apps/backend/.env`)

| Variable | Purpose |
|----------|---------|
| `USE_IN_MEMORY` | `true` = demo without DB |
| `DATABASE_URL` | PostgreSQL (required when in-memory off) |
| `JWT_SECRET` | Auth signing secret (`openssl rand -hex 32`) |
| `FRONTEND_URL` | CORS + redirects — must match storefront origin |
| `CROSS_SITE_COOKIES` | `true` when API and frontend are on different domains (production) |
| `ADMIN_PASSWORD` / `SUPPLIER_PASSWORD` | Demo account passwords for seed/bootstrap |
| `PAYSTACK_SECRET_KEY` | Paystack secret; empty → mock payment |
| `PAYSTACK_CURRENCY` | `NGN` |
| `PAYSTACK_CALLBACK_URL` | Checkout verify page on frontend |
| `REDIS_URL` | Optional — omit if Redis not running |
| `RESEND_API_KEY` / `EMAIL_FROM` / `SUPPORT_EMAIL` | Optional contact/supplier email |

### Frontend (`apps/frontend/.env.local`)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | e.g. `http://localhost:3000/api/v1` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Paystack public key (optional in mock mode) |

`NEXT_PUBLIC_*` values are baked in at **`npm run build`** — rebuild after changing them.

---

## Commands

```bash
npm run dev              # API + frontend concurrently
npm run build            # shared → backend → frontend
npm run typecheck        # also aliased as npm run lint
npm run test             # 92 unit tests + backend build smoke
npm run test:unit
npm run test:coverage
npm run test:backend

# PostgreSQL mode (USE_IN_MEMORY=false)
npm run db:migrate
npm run db:seed
npm run db:seed:week3
npm run db:reset-logins

# API smoke (server must be running)
npm run smoke:week4
```

**CI** (`.github/workflows/ci.yml`): build · typecheck · test on every push/PR to `main`.

---

## Routes

| Area | Paths |
|------|-------|
| Storefront | `/`, `/products`, `/products/[id]`, `/about`, `/contact` |
| Commerce | `/cart`, `/checkout`, `/checkout/verify` |
| Auth | `/auth/login`, `/auth/register`, `/auth/supplier-register` |
| Customer | `/customer`, `/customer/profile`, `/customer/history`, `/customer/orders/[id]` |
| Supplier | `/supplier` — products, stock, orders |
| Admin | `/admin` — users, suppliers, products, orders, contacts, feedback |
| Feedback | `/feedback`, `/feedback/roadmap`, `/feedback/changelog`, `/feedback/[id]` |

Payments use **Paystack** when `PAYSTACK_SECRET_KEY` is set; otherwise a **mock** flow (no real charges).

---

## Testing & QA docs

| Doc | Contents |
|-----|----------|
| [`tests/TEST-CASES.md`](./tests/TEST-CASES.md) | Automated + manual test catalog |
| [`tests/GUIDE.md`](./tests/GUIDE.md) | Manual QA workflow |
| [`tests/ENV-SETUP.md`](./tests/ENV-SETUP.md) | VPS/staging env setup (ID) |
| [`tests/DOVA-STATUS-LENGKAP.md`](./tests/DOVA-STATUS-LENGKAP.md) | Dokumen status teknis lengkap (ID) |
| [`tests/UAT-BUG-FIXES.md`](./tests/UAT-BUG-FIXES.md) | UAT defect log + verification |

---

## Deployment

### Production / VPS (PM2)

```bash
git pull
npm run build
npm run db:seed          # refresh catalog + demo data
pm2 restart dova-backend dova-frontend --update-env
```

Set `USE_IN_MEMORY=false`, `CROSS_SITE_COOKIES=true`, and production URLs — see [`tests/ENV-SETUP.md`](./tests/ENV-SETUP.md).

### Vercel (frontend only)

`vercel.json` at repo root. Set `NEXT_PUBLIC_API_URL` to the public API base (`…/api/v1`).

### After deploy

```bash
npm run db:migrate       # if schema changed
npm run smoke:week4      # health + contact against running API
```

---

## Feedback board (native)

External FeedLog is replaced by native Next.js pages + NestJS routes under `/api/v1/feedback/*`.

| Endpoint | Purpose |
|----------|---------|
| `GET/POST /feedback/posts` | List / create ideas |
| `POST /feedback/posts/:id/vote` | Vote (auth required) |
| `GET/POST /feedback/posts/:id/comments` | Comments |
| `PUT /feedback/posts/:id/status` | Admin roadmap status |
| `GET /feedback/roadmap` | Public roadmap columns |
| `GET/POST /feedback/changelog` | Release notes |

In-memory when `USE_IN_MEMORY=true`; admin UI under **Admin → Feedback**.

---

## Notes

- Currency UI is **₦ (NGN)** throughout.
- Supplier products accept multipart **image** upload (JPG/PNG/WEBP, max 5 MB) or image URL.
- Contact submissions appear under Admin → **Contacts**.
- Auth on cross-origin production uses **Bearer tokens** in `sessionStorage` plus optional cookies when `CROSS_SITE_COOKIES=true`.
