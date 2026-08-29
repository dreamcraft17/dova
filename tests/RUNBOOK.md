# DOVA — Operational Runbook

> **Author:** Dozer  
> **Service:** DOVA marketplace (NestJS API + Next.js storefront)  
> **Owner:** Dozer Napitupulu (CTO, DN Tech)  
> **Environment:** Production  
> **Last verified:** 2026-08-29

**Production URLs**

| Surface | URL |
|---------|-----|
| Storefront | https://dova.dntech.id |
| API base | https://api.dova.dntech.id/api/v1 |
| Health | https://api.dova.dntech.id/api/v1/health |

**Infrastructure support:** [dntech.id](https://dntech.id) — Dozer Napitupulu Technology (DN Tech)

**Related:** [ENV-SETUP.md](./ENV-SETUP.md) · [GUIDE.md](./GUIDE.md) · [DOVA-BUG-TRIAGE.md](./DOVA-BUG-TRIAGE.md) · [DOVA-RELEASE-READINESS-AUDIT.md](./DOVA-RELEASE-READINESS-AUDIT.md)

---

## Overview

DOVA is a B2B/B2C food-supply marketplace for Nigeria (NGN, Paystack). Production runs on a single VPS under DN Tech infrastructure with PM2-managed Node processes, PostgreSQL, optional Redis, and Nginx reverse proxy.

| Component | Process | Typical PM2 name |
|-----------|---------|------------------|
| API (NestJS) | `apps/backend/dist/main.js` | `dova-backend` or `dova-api` |
| Storefront (Next.js) | `next start -p 3002` | `dova-frontend` or `dova-web` |
| Database | PostgreSQL | system service |
| Cache / sessions | Redis (optional) | system service |
| Payments | Paystack (external) | — |
| Email OTP | Resend or Gmail SMTP | — |

**Critical user impact if down:** customers cannot browse, register, checkout, or pay; suppliers cannot fulfill orders; admin cannot moderate users/suppliers/orders.

---

## Preconditions

Before any production change, confirm:

- [ ] SSH access to VPS hosting DOVA
- [ ] `git` pull access to `dreamcraft17/dova` on server (`~/dova` or `/var/www/dntech/dova`)
- [ ] Read/write to `apps/backend/.env` and `apps/frontend/.env.local`
- [ ] PM2 installed; know actual process names (`pm2 status`)
- [ ] Postgres reachable (`DATABASE_URL` in backend `.env`)
- [ ] Paystack dashboard access (webhook + live/test keys)
- [ ] Email provider configured (`RESEND_API_KEY` + `EMAIL_FROM` **or** Gmail SMTP) for customer signup OTP

---

## Start procedure

Use after server reboot or first-time bring-up.

```bash
# 1. System dependencies (if not running)
sudo systemctl start postgresql
# sudo systemctl start redis   # only if REDIS_URL is set

# 2. App processes
cd ~/dova   # adjust path on VPS
pm2 start dova-backend dova-frontend --update-env
# or, if legacy names:
# pm2 start dova-api dova-web --update-env

# 3. Persist PM2 across reboot (once)
pm2 save
```

**Expected:** `pm2 status` shows both processes **online**.

---

## Stop procedure

Use for maintenance windows or before risky manual DB work.

```bash
pm2 stop dova-backend dova-frontend
# or: pm2 stop dova-api dova-web
```

**Expected:** storefront and API return connection errors externally; no orphaned Node workers (`pm2 status` shows **stopped**).

---

## Health checks

Run after start, deploy, or incident mitigation.

### API

```bash
curl -sf https://api.dova.dntech.id/api/v1/health
```

**Expected:** `{"status":"ok","service":"dova-api"}` (HTTP 200)

### Local (on VPS)

```bash
curl -sf http://127.0.0.1:4201/api/v1/health
```

Port may differ — check `PORT` in `apps/backend/.env`.

### Storefront

```bash
curl -sfI https://dova.dntech.id | head -1
```

**Expected:** `HTTP/2 200` (or `HTTP/1.1 200`)

### Automated smoke (from dev machine or CI)

```bash
cd ~/dova
SMOKE_OTP_CODE=123456 npm run smoke:production
```

Requires `DOVA_QA_FIXED_OTP=123456` on server for QA email pattern. Log: see release audit docs.

### Quick functional checks

1. Login as admin (`admin@dova.local`)
2. Home + `/products` load on mobile width
3. Register flow: Send code → OTP → create account (needs live email config)
4. Add to cart → checkout min-order enforcement (pickup ₦3k / delivery ₦5k)

---

## Deployment checklist

Standard production deploy after merge to `main`.

| Step | Command / action | Pass criteria |
|------|------------------|---------------|
| 1 | `git pull` on VPS | Latest `main` SHA |
| 2 | `npm ci` | Clean install, no errors |
| 3 | Review `.env` if release notes mention new vars | See [ENV-SETUP.md](./ENV-SETUP.md) |
| 4 | `npm run db:migrate` | Migrations apply without error |
| 5 | `npm run build` | shared → backend → frontend build OK |
| 6 | `pm2 restart dova-backend dova-frontend --update-env` | PM2 online |
| 7 | `curl -sf …/health` | `{ "status": "ok" }` |
| 8 | `SMOKE_OTP_CODE=123456 npm run smoke:production` | All steps pass |
| 9 | Observe 10–15 min | No spike in PM2 restarts / 5xx in nginx |

**Full command block:**

```bash
cd ~/dova
git pull
npm ci
npm run db:migrate
npm run build
pm2 restart dova-backend dova-frontend --update-env
curl -sf https://api.dova.dntech.id/api/v1/health
SMOKE_OTP_CODE=123456 npm run smoke:production
```

**Frontend-only note:** `NEXT_PUBLIC_*` values are baked at build time — always rebuild frontend after changing `apps/frontend/.env.local`.

**Rollback trigger during deploy:** health check fails, smoke fails on P0 paths (health, login, register OTP, catalog), or Paystack webhook stops confirming payments.

---

## Rollback

### Application rollback (preferred)

```bash
cd ~/dova
git log -5 --oneline
git checkout <previous-good-sha>
npm ci
npm run build
pm2 restart dova-backend dova-frontend --update-env
curl -sf https://api.dova.dntech.id/api/v1/health
```

Then re-run smoke. Communicate rollback to DOVA team.

### Database caution

- Migrations in `database/migrations/` are **additive** — do not drop columns in panic.
- Roll back **code first**; undo migrations only with a planned Postgres restore.
- If data corruption suspected: stop writes (`pm2 stop` backend), snapshot/restore from backup, then redeploy known-good SHA.

### Rollback triggers

| Signal | Action |
|--------|--------|
| `/health` not 200 after deploy | Roll back app SHA immediately |
| Customer signup OTP emails fail globally | Check Resend/SMTP env; roll back if bad release broke mailer |
| Checkout / Paystack initialize 5xx | Roll back API; verify Paystack keys unchanged |
| Auth cookies broken cross-subdomain | Verify `CROSS_SITE_COOKIES=true` + `FRONTEND_URL`; roll back if regression |

---

## Incident response

### Triage (first 5 minutes)

1. **Classify severity**
   - **SEV-1:** Production down or payments/auth broken for all users
   - **SEV-2:** Major feature degraded (checkout, supplier portal, admin)
   - **SEV-3:** Minor bug, workaround exists
2. **Contain:** note start time, recent deploy SHA (`git log -1`), PM2 status, health endpoint
3. **Check recent changes:** `git log -3`, Paystack dashboard, email provider status
4. **Mitigate:** restart PM2, roll back if deploy-correlated

### Diagnosis commands

```bash
pm2 status
pm2 logs dova-backend --lines 100
pm2 logs dova-frontend --lines 50
sudo tail -n 100 /var/log/nginx/error.log
curl -sf https://api.dova.dntech.id/api/v1/health | jq .
```

### Common issues

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| CORS errors in browser | `FRONTEND_URL` mismatch | Set to `https://dova.dntech.id`, restart backend |
| Login cookie missing (prod) | Cross-site cookie config | `CROSS_SITE_COOKIES=true`, HTTPS, correct API subdomain |
| Register rejected | Email not configured | Set Resend or SMTP per [ENV-SETUP.md](./ENV-SETUP.md) |
| OTP never arrives | `RESEND_API_KEY` / SMTP / spam | Test provider; check `EMAIL_FROM` domain |
| Paystack fails | Wrong secret, webhook, currency | Verify `PAYSTACK_*`, webhook URL in Paystack dashboard |
| 404 on product UUID | Invalid ID (expected) vs routing bug | Check API logs |
| Upload fails | File > 5 MB or wrong MIME | JPG/PNG/WEBP only |
| Min order error at checkout | Expected business rule | Pickup ₦3k / delivery ₦5k |

---

## Monitoring (MVP)

| Source | Command / location |
|--------|-------------------|
| Process uptime | `pm2 status`, `pm2 monit` |
| API logs | `pm2 logs dova-backend --lines 200` |
| Frontend logs | `pm2 logs dova-frontend --lines 100` |
| Reverse proxy | nginx access + error logs |
| Database | Postgres backups (`pg_dump` / provider schedule) |
| Payments | Paystack dashboard — failed charges, webhook delivery |
| Uptime (optional) | External ping on `/api/v1/health` |

No production APM yet — treat failed smoke + user reports as primary alerts.

---

## Escalation

| Level | Contact | When |
|-------|---------|------|
| L1 | Dozer (CTO) | Any production incident, deploy approval |
| L2 | Onyekachi Daniel (CEO) | Extended outage, payment/legal/customer comms |
| L3 | Arthur Darwanto (FE) | Storefront/UI regression after deploy |
| L3 | Kersie Karuma (QA) | Reproduce UAT steps, smoke verification |
| L3 | Nurul Husna Dini (Assistant Manager) | Partner/user communication coordination |

**Support channels:** Admin → Contacts in app; product email per env `SUPPORT_EMAIL`.

---

## Post-incident

1. Record timeline (deploy SHA, detection, mitigation, resolution).
2. Root cause + corrective actions with owners.
3. Update this runbook if steps were missing or wrong.
4. Update [DOVA-BUG-TRIAGE.md](./DOVA-BUG-TRIAGE.md) if user-facing defect.
5. Bump **Last verified** date after quarterly dry-run.

---

## Quarterly validation

- [ ] Run deploy checklist on staging-like path or dry-run commands on VPS (read-only where possible)
- [ ] Execute rollback to previous SHA in maintenance window (or document why skipped)
- [ ] Confirm PM2 names, paths, and env templates match [ENV-SETUP.md](./ENV-SETUP.md)
- [ ] Run `npm run smoke:production` with QA OTP env set
- [ ] Verify Paystack webhook URL still matches API hostname
- [ ] Confirm escalation contacts current

---

*Author: Dozer · Infrastructure: DN Tech ([dntech.id](https://dntech.id))*
