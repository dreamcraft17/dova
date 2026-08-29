# DOVA

Agricultural marketplace MVP — NestJS API · Next.js storefront · shared TypeScript (Nigeria · NGN · Paystack).

**Production:** [dova.dntech.id](https://dova.dntech.id) · API [api.dova.dntech.id](https://api.dova.dntech.id/api/v1/health)

**Documentation:** [dova-comp-wiki](https://github.com/dreamcraft17/dova-com-wiki) — runbook, QA, env setup, feature catalog, changelog (SSOT for all docs).

---

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
| Storefront | http://localhost:3001 |
| API health | http://localhost:3000/api/v1/health |

`USE_IN_MEMORY=true` in `.env.dev` — no PostgreSQL/Redis required for UI demo.

> **CORS:** for `npm run dev` (port **3001**), set `FRONTEND_URL=http://localhost:3001` in `apps/backend/.env`.

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
npm run test:unit        # unit tests
npm run db:migrate       # PostgreSQL migrations
npm run db:seed          # demo catalog + accounts
npm run smoke:production # production API smoke (see wiki RUNBOOK)
```

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
