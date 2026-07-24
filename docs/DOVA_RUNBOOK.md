# DOVA Runbook — Deploy, Rollback, Troubleshoot

**Audience:** Engineering / DevOps  
**Last updated:** 24 July 2026  
**MVP codebase:** complete — this runbook is for **staging/production go-live** (ops).  
**Related:** `DOVA_VPS_DEPLOY.md`, `DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md`, `Readme.md`

---

## 1. Environments

| Env | Frontend | API | Notes |
|-----|----------|-----|-------|
| Local | `:3001` | `:3000` | `USE_IN_MEMORY=true` OK for UI demo |
| Staging / Prod | Vercel **or** VPS Nginx | Node (PM2) | `USE_IN_MEMORY=false` + Postgres + Redis |

---

## 2. Deploy (VPS)

```bash
cd /var/www/dova
git pull
npm install
npm run db:migrate          # applies all SQL in database/migrations/
npm run build
pm2 restart dova-api dova-web
curl -s http://127.0.0.1:3000/api/v1/health
```

Full first-time setup: `docs/DOVA_VPS_DEPLOY.md`.

### Deploy (Vercel frontend only)

- Root `vercel.json` builds `shared` + `apps/frontend`.
- Set `NEXT_PUBLIC_API_URL` to the public API base (`…/api/v1`).
- Backend remains on a Node host with `DATABASE_URL`, `REDIS_URL`, `PAYSTACK_*`, `JWT_SECRET`.

---

## 3. Required production env

| Variable | Service |
|----------|---------|
| `JWT_SECRET` | Backend |
| `DATABASE_URL` | Backend |
| `REDIS_URL` | Backend (recommended) |
| `USE_IN_MEMORY=false` | Backend |
| `FRONTEND_URL` | Backend CORS |
| `PAYSTACK_SECRET_KEY` / `PAYSTACK_CURRENCY=NGN` | Backend |
| `NEXT_PUBLIC_API_URL` | Frontend |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Frontend (optional) |
| `RESEND_API_KEY` / `EMAIL_FROM` / `SUPPORT_EMAIL` | Contact + supplier emails (optional) |

---

## 4. Smoke checklist (post-deploy)

1. `GET /api/v1/health` → `{ status: "ok" }`  
2. Home + Products load on mobile & desktop  
3. Register customer → add to cart → checkout  
4. Min order: pickup ₦3,000 / delivery ₦5,000 blocks under-min baskets  
5. Mock or Paystack payment verify  
6. Supplier register + document upload  
7. Admin approve supplier  
8. Supplier add product **with image file**  
9. Contact form → admin **Contacts** tab shows message  

Script helper (API up):

```bash
node scripts/smoke-week4.js
```

---

## 5. Rollback

```bash
cd /var/www/dova
git log -5 --oneline
git checkout <previous-good-sha>
npm install
npm run build
pm2 restart dova-api dova-web
```

DB: migrations are additive (`002_week4.sql`). Do **not** drop columns in panic; restore app code first. If a migration must be undone, restore from Postgres backup.

---

## 6. Common issues

| Symptom | Check |
|---------|--------|
| CORS errors | `FRONTEND_URL` matches real site origin |
| Login cookie missing | HTTPS + `sameSite` / proxy `X-Forwarded-Proto` |
| Contact “ok” but empty admin list | `USE_IN_MEMORY` vs DB mismatch; run migrate |
| Order rejected “Add ₦X more…” | Expected — raise basket or switch pickup/delivery |
| Paystack fails | Secret key + webhook URL + NGN currency |
| Large product image fails | Max 5 MB; JPG/PNG/WEBP only |

---

## 7. Monitoring (MVP)

- PM2: `pm2 status`, `pm2 logs dova-api --lines 100`  
- Nginx access/error logs  
- Postgres backups (provider schedule or `pg_dump` cron)  
- Paystack dashboard for payment failures  

Optional later: uptime ping on `/api/v1/health`, error tracking (Sentry).

---

## 8. Support

- Product email: `support@dova.com`  
- Contact submissions also appear in Admin → Contacts  
