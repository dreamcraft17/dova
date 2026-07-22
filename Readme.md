# DOVA MVP

Monorepo implementation berdasarkan PRD, SDD, SRS, dan tech-stack docs di `docs/`.

## Quick start

```bash
npm install
npm run dev
```

Frontend: http://localhost:3001 · API: http://localhost:3000/api/v1/health

## Week 1 foundation

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local
npm run build
npm run test:backend
```

Unit test commands:

```bash
npm run test:unit
npm run test:coverage
```

Unit tests mencakup auth, validasi, refresh/revocation token, role authorization, product/cart/order behavior, dan shared constants.

Database schema dan seed kategori ada di `database/migrations/001_init.sql`. CI GitHub Actions tersedia di `.github/workflows/ci.yml` dan tidak menggunakan Docker.

Untuk database nyata:

```bash
npm run db:migrate
npm run db:seed
```

Frontend deployment ditargetkan ke Vercel melalui `vercel.json`. Backend berjalan pada runtime Node.js terpisah dan menggunakan PostgreSQL/Redis managed melalui `DATABASE_URL`/`REDIS_URL`. Migration database dapat dijalankan manual melalui workflow `.github/workflows/database-migrate.yml` dengan GitHub secret `DATABASE_URL`.

Untuk development tanpa database lokal, set `USE_IN_MEMORY=true`. Untuk persistence penuh, gunakan PostgreSQL dan Redis managed/external; repository ini tidak membutuhkan Docker.

Week 2 payment memakai Paystack jika `PAYSTACK_SECRET_KEY` tersedia; tanpa key di development, payment menggunakan mock flow lokal dan tidak memproses uang sungguhan.

Demo users: `admin@dova.local / admin1234`, `supplier@dova.local / supplier1234`.

Database schema produksi/local tersedia di `database/migrations/001_init.sql`; baseline development memakai in-memory repository agar UI dapat langsung dijalankan tanpa PostgreSQL. Set `DATABASE_URL`, Redis, dan `PAYSTACK_SECRET_KEY` sebelum menghubungkan adapter produksi.
# dova
