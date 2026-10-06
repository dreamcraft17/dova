# DOVA

> **Author:** Dozer

Agricultural marketplace MVP — NestJS API · Next.js storefront · shared TypeScript (Nigeria · NGN · Paystack).

**Production:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)

**Documentation:** [dova-comp-wiki](https://github.com/dreamcraft17/dova-com-wiki) — runbook, QA, env setup, feature catalog (SSOT). Integrator notes: [DOVA-INTEGRATION-GUIDE.md](https://github.com/dreamcraft17/dova-com-wiki/blob/main/code/DOVA-INTEGRATION-GUIDE.md). Repo changelog: [CHANGELOG.md](./CHANGELOG.md).

---

## Prerequisites

- Node.js 20 (pinned in CI — `.github/workflows/ci.yml`)
- npm (workspaces: `shared`, `apps/backend`, `apps/frontend`)
- PostgreSQL + Redis only if running with `USE_IN_MEMORY=false` — see [Quick start](#quick-start-local-in-memory) below

## Quick start (local, in-memory)

```bash
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

| Service | Dev URL |
|---------|---------|
| Storefront | http://localhost:3005 (`next dev -p 3005` in `apps/frontend`) |
| API health | http://localhost:3000/api/v1/health |

`USE_IN_MEMORY=true` in `.env.dev` — no PostgreSQL/Redis required for UI demo.

> **CORS / catalog Origin:** set `FRONTEND_URL` on the API to the storefront origin. `apps/backend/.env.dev` still ships `http://localhost:3001`; `npm run dev` serves Next on **3005**. Point `FRONTEND_URL` (and Paystack callback host) at `http://localhost:3005` or catalog/login from the browser can fail CORS / Origin checks. Localhost runbook: [Dova RunBook for localhost.md](https://github.com/dreamcraft17/dova-com-wiki/blob/main/operations/Dova%20RunBook%20for%20localhost.md).

### Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

---

## Commands

```bash
npm run dev              # API + frontend
npm run build            # shared → backend → frontend
npm run test             # test:unit + backend typecheck (CI also runs test:backend)
npm run test:unit        # Jest (shared + backend + frontend lib specs)
npm run test:backend     # backend workspace Jest
npm run test:coverage    # unit tests with coverage report
npm run typecheck        # tsc --noEmit across shared + both apps
npm run db:migrate       # PostgreSQL migrations
npm run db:seed          # demo catalog + accounts
npm run smoke:production # production API smoke (see wiki RUNBOOK)
```

---

## API access (partners vs storefront)

Customer and supplier flows on the storefront use **JWT** (login, cart, supplier product CRUD). They do **not** send `X-Api-Key`.

External catalog reads (`GET /api/v1/products`, `/categories`, `/openapi.json`) require `X-Api-Key` once `DOVA_INTEGRATION_KEYS` is set on the API. Browser requests from `FRONTEND_URL` / `CORS_ORIGINS` are treated as the storefront (no partner key). Env **names:** `DOVA_INTEGRATION_KEYS` (backend, `name:secret,...`), optional `DOVA_INTEGRATION_KEY` + `DOVA_BACKEND_URL` if you still use `/api/gateway`. Never put secrets in `NEXT_PUBLIC_*`.

---

## Deploy (production)

See **[operations/RUNBOOK.md](https://github.com/dreamcraft17/dova-com-wiki/blob/main/operations/RUNBOOK.md)** and **[operations/ENV-SETUP.md](https://github.com/dreamcraft17/dova-com-wiki/blob/main/operations/ENV-SETUP.md)** in the wiki.

```bash
git pull && npm ci && npm run db:migrate && npm run build
pm2 restart dova-backend dova-frontend --update-env
```

---

## Repository layout

```
dova/
├── apps/backend/          # NestJS API
├── apps/frontend/         # Next.js storefront
├── shared/                # Shared types & helpers
├── database/migrations/   # SQL schema
├── scripts/               # migrate, seed, smoke
├── ops/logs/              # smoke script output (gitignored)
└── .github/workflows/     # CI
```
