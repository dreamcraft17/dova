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

| Service   | URL |
|-----------|-----|
| Frontend  | http://localhost:3001 |
| API health| http://localhost:3000/api/v1/health |

Default local mode uses **in-memory** data (`USE_IN_MEMORY=true`) so you can run UI + API without PostgreSQL/Redis.

### Demo accounts

| Role     | Email                 | Password      |
|----------|-----------------------|---------------|
| Admin    | `admin@dova.local`    | `admin1234`   |
| Supplier | `supplier@dova.local` | `supplier1234`|

Register a customer from `/auth/register`, or apply as supplier at `/auth/supplier-register`.

---

## Repository layout

```
dova/
├── apps/
│   ├── backend/          # NestJS API (:3000)
│   └── frontend/         # Next.js storefront (:3001)
├── shared/               # Shared TypeScript types
├── database/migrations/  # SQL schema
├── scripts/              # migrate + seed
└── docs/                 # PRD, SRS, SDD, status, changelog
```

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
```

CI: `.github/workflows/ci.yml`  
DB migrate workflow: `.github/workflows/database-migrate.yml` (needs `DATABASE_URL` secret)

---

## Product surface

| Area | Routes / notes |
|------|----------------|
| Storefront | `/`, `/products`, `/products/[id]`, `/about`, `/contact` |
| Commerce | `/cart`, `/checkout`, Paystack verify |
| Auth | `/auth/login`, `/auth/register`, `/auth/supplier-register` (verification doc guidance on form) |
| Customer | `/customer`, `/customer/orders/[id]` |
| Supplier | `/supplier` — sidebar: products, add/edit, orders |
| Admin | `/admin` — users, suppliers, products, orders, contacts |

Payments use **Paystack** when `PAYSTACK_SECRET_KEY` is set. Without it, development uses a **mock** flow (no real charges).

---

## Deployment

- Frontend: Vercel (`vercel.json`). See [DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md](./docs/DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md).
- Backend: separate Node.js host with managed PostgreSQL / Redis.
- No Docker required for this MVP path.

---

## Documentation

| Doc | Audience |
|-----|----------|
| [CHANGELOG](./docs/CHANGELOG.md) | Engineering — release history |
| [BUG_FIXES](./docs/BUG_FIXES.md) | Engineering — fixed / open issues |
| [MVP progress update](./docs/DOVA%20MVP%20PROGRESS%20UPDATE.md) | Business / ops |
| [Spec compliance](./docs/DOVA_SPEC_COMPLIANCE.md) | Engineering — PRD/SRS/SDD vs code |
| [VPS deploy steps](./docs/DOVA_VPS_DEPLOY.md) | DevOps — single-server deploy |
| [Runbook](./docs/DOVA_RUNBOOK.md) | DevOps — deploy, rollback, smoke |
| [API (MVP)](./docs/DOVA_API.md) | Engineering — endpoint cheat sheet |
| [Paystack + min order reply](./docs/DOVA_REPLY_PAYSTACK_AND_MIN_ORDER.md) | Stakeholder draft |
| [Supplier verification docs reply](./docs/DOVA_REPLY_SUPPLIER_VERIFICATION_DOCS.md) | Stakeholder draft — which documents to upload |
| [4-week plan summary](./docs/DOVA_SUMMARY_4W.md) | All stakeholders |
| PRD / SRS / SDD | `docs/DOVA_PRD_*`, `DOVA_SRS_*`, `DOVA_SDD_*` |
| Tech stack | [DOVA_TECH_STACK_MONOREPO.md](./docs/DOVA_TECH_STACK_MONOREPO.md) |
| Vercel override | [DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md](./docs/DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md) |

---

## Notes

- **MVP codebase: 100% complete** — see [spec compliance](./docs/DOVA_SPEC_COMPLIANCE.md).
- Currency UI is **₦ (NGN)** to match Paystack / Nigeria market.
- Storefront UI follows the **DOVA-Startup** design reference (brand, home, auth cards, dashboards).
- Min order: **pickup ₦3,000** / **delivery ₦5,000**. Contact messages land in Admin → Contacts.
- Remaining **ops** (live staging proof, Paystack test txs): [BUG_FIXES.md](./docs/BUG_FIXES.md) BF-013; launch steps in [DOVA_RUNBOOK.md](./docs/DOVA_RUNBOOK.md).
