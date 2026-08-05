# DOVA — QA Testing Guide

**Author:** Dozer (@dreamraft17) - Software Engineer  
**Audience:** QA Tester  
**Updated:** August 2026  
**Related docs:** [TEST-CASES.md](./TEST-CASES.md) · [Readme.md](../Readme.md)

---

## 1. What you are testing

DOVA is an agricultural marketplace MVP:

| Layer | URL (local) | Role |
|-------|-------------|------|
| **Storefront** | http://localhost:3002 | Customer shopping, auth, checkout |
| **API** | http://localhost:3000/api/v1 | Backend for all data & payments |
| **Feedback board** | http://localhost:3002/feedback | Native ideas, votes, roadmap, changelog |

Three user roles: **customer**, **supplier**, **admin**.

---

## 2. Environment setup

### Prerequisites

- Node.js 20+
- Git clone of the `dova` repo

### First-time setup

```bash
cd dova
npm install
cp .env.dev .env
cp apps/backend/.env.dev apps/backend/.env
cp apps/frontend/.env.dev apps/frontend/.env.local
npm run dev
```

Wait until both services are up:

| Check | Expected |
|-------|----------|
| http://localhost:3002 | Homepage loads |
| http://localhost:3002/feedback | Feedback board loads |
| http://localhost:3000/api/v1/health | `{ "status": "ok" }` |

### Demo accounts (seeded in dev)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier (approved) | `supplier@dova.local` | `supplier1234` |

Register a new **customer** at `/auth/register`.  
Apply as **supplier** at `/auth/supplier-register` (starts as **pending** until admin approves).

### Staging

Use the staging URL provided by the dev team. Confirm `NEXT_PUBLIC_API_URL` points to the staging API before testing.

---

## 3. Test layers (what runs when)

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 1 — Automated unit tests (Jest)                      │
│  npm run test          → dev runs before every PR         │
│  QA: run once after checkout / before manual UAT            │
├─────────────────────────────────────────────────────────────┤
│  Layer 2 — Auth integration smoke                           │
│  npm run test:backend  → register/login/refresh/revoke      │
├─────────────────────────────────────────────────────────────┤
│  Layer 3 — API smoke (needs running server)                 │
│  npm run smoke:week4   → health + contact form              │
├─────────────────────────────────────────────────────────────┤
│  Layer 4 — Manual UAT (you)                                 │
│  Follow TEST-CASES.md on desktop + mobile                   │
└─────────────────────────────────────────────────────────────┘
```

### Quick automated check (5 minutes)

```bash
# From repo root — no server needed
npm run test

# Optional: with coverage report
npm run test:coverage
# Open coverage/lcov-report/index.html in browser
```

With the dev server running (`npm run dev` in another terminal):

```bash
npm run smoke:week4
# Expected output: OK health · OK contact · Smoke Week 4 passed
```

---

## 4. Manual UAT workflow

Use [TEST-CASES.md](./TEST-CASES.md) as your checklist. Each row has an **ID** (e.g. `AUTH-01`) — log pass/fail against that ID.

### Recommended test order

1. **Smoke** — OPS-01, OPS-02 (health + smoke script)
2. **Auth** — AUTH-01 → AUTH-09
3. **Catalog** — CAT-01 → CAT-06
4. **Cart** — CART-01 → CART-06
5. **Checkout** — CHK-01 → CHK-06
6. **Payments** — PAY-01 → PAY-05
7. **Supplier** — SUP-01 → SUP-07
8. **Admin** — ADM-01 → ADM-06
9. **Public & feedback** — PUB-01 → PUB-08
10. **Mobile regression** — OPS-04 (full journey on phone width)

### Pass criteria (global)

- Expected result matches actual behavior
- No HTTP 5xx errors
- Login sets auth cookies; logout clears them
- All ₦ amounts display and calculate correctly
- Minimum order rules: **delivery ≥ ₦5,000** · **pickup ≥ ₦3,000**

### Fail criteria — log a bug when

- Wrong redirect or role access (security)
- Payment stuck in `pending` after successful verify
- Stock not decremented after purchase
- Supplier approval/rejection not reflected in UI
- Mobile layout broken (overflow, unreadable text, nav not working)

---

## 5. Test data tips

| Scenario | How to set up |
|----------|---------------|
| Customer with cart | Register → browse `/products` → add items with delivery slot |
| Below min order | Add 1× low-price item (e.g. ₦1,000 product) → try checkout |
| Pending supplier | `/auth/supplier-register` with new email → login before admin approval |
| Paid order | Checkout → mock payment (no Paystack key in dev) → verify at `/checkout/verify` |
| Admin inbox | Submit `/contact` form → check Admin → Contacts tab |

**Reset local data:** restart `npm run dev` (in-memory mode clears on restart). With PostgreSQL, ask dev to re-seed.

---

## 6. Payment testing

### Dev (mock — default)

When `PAYSTACK_SECRET_KEY` is empty, payments auto-succeed:

1. Complete checkout
2. Redirect to `/checkout/verify?reference=...`
3. Order status → **paid**

Test cases: PAY-01, PAY-02

### Staging / Paystack test mode

When Paystack keys are configured:

- Use Paystack **test card**: `4084 0840 8408 4081`, any future expiry, CVV `408`, PIN `0000`, OTP `123456`
- Test cases: PAY-03, PAY-04, OPS-03

---

## 7. Native feedback board testing

Feedback lives entirely inside DOVA at **`/feedback`** — no external app, proxy, or SSO.

| Case | Steps | Expected |
|------|-------|----------|
| Guest submit | `/feedback` → submit idea with name | Idea appears in list |
| Vote | Log in → vote on idea | Vote count +1; duplicate vote blocked |
| Search | Search box on board | Filters by title/description |
| Detail + comments | Open `/feedback/[id]` | Post + comment thread |
| Roadmap | `/feedback/roadmap` | Columns: open → planned → in progress → done |
| Changelog | `/feedback/changelog` | Release notes list + detail |
| Admin | `/admin` → Feedback tab | Change status, official reply, publish changelog |

Test cases: PUB-04 → PUB-08 · Automated: `feedback.service.spec.ts` + `frontend/src/lib/feedlog.spec.ts`

---

## 8. Bug report template

Copy this when filing issues:

```
**Test ID:** AUTH-04 (from TEST-CASES.md)
**Environment:** local / staging
**Browser / device:** Chrome 128 / iPhone 15 Safari
**Account used:** customer@test.com

**Steps:**
1. ...
2. ...

**Expected:** ...
**Actual:** ...

**Screenshots / HAR:** (attach)
**Console / network errors:** (if any)
```

---

## 9. Automated test map (for triage)

When a manual case fails, check if automation already covers it:

| Manual IDs | Automated file |
|------------|----------------|
| AUTH-01–05, AUTH-03 | `apps/backend/src/app.service.spec.ts` |
| AUTH-06 | `apps/backend/test/auth.test.js` |
| CAT-01 | `app.service.spec.ts` — pagination |
| CART-01–05 | `app.service.spec.ts` — cart add/update/remove |
| CHK-01–04 | `app.service.spec.ts` + `shared/src/index.spec.ts` |
| PAY-01–02, PAY-04 | `app.service.spec.ts` — mock + webhook |
| SUP-01, SUP-06–07 | `app.service.spec.ts` — supplier CRUD/fulfillment |
| ADM-02–03 | `app.service.spec.ts` — approve/reject supplier |
| ADM-04 | `app.service.spec.ts` — admin users/products/orders |
| PUB-04–08 | `feedback.service.spec.ts` + `frontend/src/lib/feedlog.spec.ts` |
| OPS-01–02 | `scripts/smoke-week4.js` |

If automation passes but manual fails → likely a **frontend/UI bug**.  
If both fail → likely a **backend/logic bug**.

---

## 10. Sign-off checklist

Before approving a release:

- [ ] `npm run test` — all green
- [ ] `npm run smoke:week4` against target environment — pass
- [ ] All P0 manual cases in TEST-CASES.md — pass (desktop)
- [ ] OPS-04 mobile smoke — pass
- [ ] Paystack test transactions (staging) — ≥10 successful (OPS-03)
- [ ] No open P0/P1 bugs for auth, checkout, or payment

**Sign-off format:**

```
DOVA [version/env] UAT — PASS / FAIL
Date: YYYY-MM-DD
Tester: [name]
Notes: [any waivers or known issues]
```

---

## 11. Contacts

| Question | Ask |
|----------|-----|
| Environment / deploy access | Dev lead |
| Paystack test keys | Dev lead |
| Test data / seed accounts | Dev lead |
| Product scope / expected behavior | PM (PRD) |
