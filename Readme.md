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
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

| Service    | URL |
|------------|-----|
| Frontend   | http://localhost:3002 |
| Feedback   | http://localhost:3002/feedback |
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
│   ├── frontend/         # Next.js storefront (:3002)
│   └── feedlog/          # FeedLog Nuxt app (:3010, proxied at /feedback)
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
| `NEXT_PUBLIC_FEEDLOG_URL` | FeedLog portal URL (enables Feedback links) |

**Backend FeedLog (optional SSO):**

| Variable | Purpose |
|----------|---------|
| `FEEDLOG_BASE_URL` | Same URL as `NEXT_PUBLIC_FEEDLOG_URL` (for SSO redirect) |
| `FEEDLOG_SSO_SECRET` | HS256 secret from FeedLog dashboard → Developer → SSO |

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
npm run db:migrate:feedlog   # FeedLog tables on same Postgres as DOVA
npm run db:migrate:all       # both in one command
npm run db:seed
npm run db:seed:week3

# Smoke (API must be running)
npm run smoke:week4
```

CI: `.github/workflows/ci.yml`  
Manual + automated test catalog: [`tests/TEST-CASES.md`](./tests/TEST-CASES.md)  
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

**Feedback (FeedLog):** integrated at **`/feedback`** on the DOVA storefront (same tab).  
Run `npm run dev` to start API + frontend + FeedLog together.

**Minimum order (NGN):** pickup **₦3,000** · delivery **₦5,000**.  
Payments use **Paystack** when `PAYSTACK_SECRET_KEY` is set; otherwise a **mock** flow (no real charges).

---

## Feedback (FeedLog) — integrated in DOVA (MVP)

FeedLog runs **inside DOVA** at **`/feedback`** on the same origin as the storefront. Users stay in one app — no new tab, no separate subdomain for MVP.

| Piece | Role |
|-------|------|
| DOVA frontend | Proxies `/feedback/*` → FeedLog Nitro server (`:3010`) |
| DOVA API | `GET /api/v1/feedback/sso` — signs SSO JWT for logged-in users |
| `apps/feedlog` | FeedLog Nuxt app (symlink to sibling repo) under base path `/feedback` |

### Architecture

```
Browser  →  localhost:3002/feedback  →  Next.js rewrite  →  FeedLog :3010/feedback
Browser  →  localhost:3002/api/v1/feedback/sso  →  NestJS  →  redirect /feedback/api/sso/jwt
```

### One-command local dev

```bash
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
cd apps/feedlog && cp .env.dova-integrated.example .env && pnpm install && cd ../..
npm run dev    # API :3000 + frontend :3002 + FeedLog :3010
```

| URL | Purpose |
|-----|---------|
| http://localhost:3002/feedback | Feedback board (integrated) |
| http://localhost:3002/feedback/roadmap | Public roadmap |
| http://localhost:3002/feedback/changelog | Release notes |

Nav/footer **Feedback** links go to `/feedback` in the same tab.

### Shared database (recommended)

DOVA and FeedLog can use **one Postgres instance** — separate tables, no naming conflicts:

| App | Example tables |
|-----|----------------|
| DOVA | `users`, `products`, `orders`, `supplier_profiles`, … |
| FeedLog | `user`, `post`, `board`, `changelog`, `organization`, … |

```bash
npm run db:migrate          # DOVA SQL migrations (+ pgvector extension)
npm run db:migrate:feedlog    # FeedLog Drizzle migrations
# or
npm run db:migrate:all
```

Requirements: Postgres **17+** with `vector` extension.

### Environment (integrated MVP)

```bash
# apps/frontend/.env.local
NEXT_PUBLIC_FEEDLOG_INTEGRATED=true
FEEDLOG_INTERNAL_URL=http://localhost:3010

# apps/backend/.env
FEEDLOG_BASE_URL=http://localhost:3002/feedback
FEEDLOG_SSO_SECRET=<from FeedLog dashboard → Developer → SSO>

# apps/feedlog/.env  (copy from .env.dova-integrated.example)
NUXT_APP_BASE_URL=/feedback/
BETTER_AUTH_URL=http://localhost:3002/feedback
PORT=3010
```

### SSO setup

1. Start all apps (`npm run dev`), open http://localhost:3002/feedback
2. Sign up with `SYSTEM_ADMIN_EMAILS` email (e.g. `admin@dova.local`) → admin
3. **Developer → SSO** → create signing secret
4. Copy secret to `apps/backend/.env`: `FEEDLOG_SSO_SECRET=...`
5. Restart DOVA API

Logged-in DOVA users opening **Feedback** hit `/api/v1/feedback/sso`, get a JWT, and land on `/feedback` signed in.

### Production (same-origin)

Reverse-proxy `/feedback` to the FeedLog Node server on the same domain as DOVA:

```nginx
location /feedback/ {
  proxy_pass http://127.0.0.1:3010/feedback/;
  proxy_set_header Host $host;
}
```

Set `FEEDLOG_BASE_URL=https://your-dova-domain/feedback` and `BETTER_AUTH_URL` to the same.

### External FeedLog (optional)

To run FeedLog on a separate domain again:

```bash
NEXT_PUBLIC_FEEDLOG_INTEGRATED=false
NEXT_PUBLIC_FEEDLOG_URL=https://feedback.dova.example
FEEDLOG_BASE_URL=https://feedback.dova.example
```

Use `npm run dev:web` if you only need API + frontend without FeedLog.

---

## Deployment

- **Frontend:** Vercel (`vercel.json`). Set `NEXT_PUBLIC_API_URL` to the public API base (`…/api/v1`). Optionally set `NEXT_PUBLIC_FEEDLOG_URL` for feedback links.
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
