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

**Feedback (FeedLog):** optional sibling app for public feedback / roadmap / changelog.  
Set `NEXT_PUBLIC_FEEDLOG_URL` on the frontend to show **Feedback** in nav + footer.

**Minimum order (NGN):** pickup **₦3,000** · delivery **₦5,000**.  
Payments use **Paystack** when `PAYSTACK_SECRET_KEY` is set; otherwise a **mock** flow (no real charges).

---

## Feedback (FeedLog) — full integration

DOVA keeps the marketplace stack (Nest + Next). Product feedback runs as **FeedLog** (Nuxt) in the sibling `../feedlog` repo.

| Piece | Role |
|-------|------|
| DOVA API | `GET /api/v1/feedback/sso` — signs SSO JWT for logged-in users |
| DOVA frontend | Nav/footer + dashboard **Feedback** links (SSO when logged in) |
| FeedLog (`../feedlog`) | Ideas, votes, roadmap, changelog |

### Shared database (recommended)

DOVA and FeedLog can use **one Postgres instance** — separate tables, no naming conflicts:

| App | Example tables |
|-----|----------------|
| DOVA | `users`, `products`, `orders`, `supplier_profiles`, … |
| FeedLog | `user`, `post`, `board`, `changelog`, `organization`, … |

Both apps point at the same `DATABASE_URL`. Accounts are linked via **SSO email**, not foreign keys.

```bash
# From dova/ — same DATABASE_URL in dova/.env and feedlog/.env
npm run db:migrate          # DOVA SQL migrations (+ pgvector extension)
npm run db:migrate:feedlog    # FeedLog Drizzle migrations
# or
npm run db:migrate:all
```

Requirements: Postgres **17+** with `vector` extension (enable on Neon/Supabase in dashboard).

### Local dev (all three apps)

```bash
# Terminal A — DOVA
npm install && cp .env.dev .env && cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev

# Terminal B — FeedLog (needs remote Postgres with pgvector — Neon/Supabase)
cd ../feedlog && cp .env.dova.example .env && pnpm install && pnpm dev --port 3010

# Or run together from dova/:
npm run dev:all
```

Set matching URLs:

```bash
# apps/frontend/.env.local
NEXT_PUBLIC_FEEDLOG_URL=http://localhost:3010

# apps/backend/.env
FEEDLOG_BASE_URL=http://localhost:3010
FEEDLOG_SSO_SECRET=<same secret as FeedLog dashboard → Developer → SSO>
```

### SSO setup (recommended for production)

1. Deploy FeedLog (Vercel/Cloudflare + Neon Postgres with `vector` extension).
2. Sign in as admin → **Developer → SSO** → create signing secret.
3. Copy secret to DOVA backend: `FEEDLOG_SSO_SECRET=...`
4. Set `FEEDLOG_BASE_URL` (backend) and `NEXT_PUBLIC_FEEDLOG_URL` (frontend) to the same FeedLog URL.
5. Rebuild/redeploy both apps.

Logged-in DOVA users opening **Feedback** hit `/api/v1/feedback/sso`, get a short-lived JWT, and land on FeedLog already signed in. Guests see the public board.

### Quick demo (no self-host)

```bash
NEXT_PUBLIC_FEEDLOG_URL=https://feedback.feedlog.ai
```

Links work; SSO is skipped without `FEEDLOG_SSO_SECRET`.

### Why sibling app (not merged)

- FeedLog stays updatable from upstream MIT repo
- No Nuxt-into-Nest rewrite
- DOVA go-live stays unblocked

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
