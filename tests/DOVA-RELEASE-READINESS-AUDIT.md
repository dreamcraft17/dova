# DOVA — Release Readiness Audit

> **Status:** Active · **Last updated:** 2026-08-27 · **Author:** Dozer  
> **App HEAD:** `54c3009` · **Target release:** v0.5.x soft launch  
> **Scope:** QA review · bug triage · backend assessment · go/no-go gates

---

## Summary

This audit combines three passes — **test quality (AI QA review)**, **bug triage**, and **backend architecture review** — to answer whether DOVA is ready for **100% release sign-off**.

**Verdict:** **~78% overall** — MVP codebase and staging are strong; **payment proof**, **manual QA execution**, and **database integration coverage** still block full release.

| Layer | Score | Notes |
|-------|-------|-------|
| MVP codebase | 95% | Week 1–4 scope + v0.5.0 shipped |
| Backend quality | 82% | NestJS solid; recent P0 auth/SQL fixes |
| Test automation | 68% | 121 unit tests; no E2E; DB layer ~9% covered |
| Staging ops | 80% | Live at `dova.dntech.id` |
| Payment go-live | 40% | Paystack wired; ≥10 txs not proven |
| Business go/no-go | 45% | 3/8 checklist items complete |
| **Overall** | **~78%** | Code release-ready; launch not closed |

**Staging URLs**

| Service | URL |
|---------|-----|
| Storefront | https://dova.dntech.id |
| API | https://api.dova.dntech.id/api/v1 |
| Health | https://api.dova.dntech.id/api/v1/health |

---

## 1. Verification evidence

Checks run on **2026-08-27** against repo `main` @ `54c3009`.

| Check | Result |
|-------|--------|
| Unit tests × 3 runs | **121/121 pass** each run (~29s) — no flakiness |
| Staging API `/health` | **200** `{ "status": "ok", "service": "dova-api" }` |
| Staging storefront | **200** |
| CI pipeline | build + typecheck + `test:unit` + `test:backend` |
| Line coverage (all files) | **52.8%** lines · **49%** statements |
| `app.service.ts` coverage | **85%** lines |
| `database.service.ts` coverage | **9.4%** lines |
| E2E / Playwright suite | **None** in repo |
| Mutation testing (Stryker) | Not configured |

---

## 2. QA review — test quality

### 2.1 What is well covered

| Area | Evidence |
|------|----------|
| Auth register/login/refresh/revoke | `app.service.spec.ts`, `auth.test.js` (CI) |
| Cart, min-order, delivery slot | `app.service.spec.ts`, `shared/src/index.spec.ts` |
| Paystack webhook HMAC | `app.service.spec.ts`, `paystack.service.spec.ts` |
| Feedback board | `feedback.service.spec.ts` |
| Remember Me token storage | `auth-session.spec.ts` |
| API client + 401 refresh retry | `api.spec.ts` |

### 2.2 Test smells and gaps

| ID | File / area | Smell | Severity | Recommended fix |
|----|-------------|-------|----------|-----------------|
| QA-GAP-01 | `database.service.ts` | **9% coverage** — SQL regressions ship undetected | **High** | Integration tests against test Postgres: `setSupplierStatus`, `createOrderFromCart`, cart save/load |
| QA-GAP-02 | Frontend | No page/component tests — only `lib/*.spec.ts` | **High** | Smoke tests for login redirect, cart, checkout |
| QA-GAP-03 | `app.service.spec.ts` | Large shared mock fixture (60+ DB mocks) | Medium | Split factories per domain |
| QA-GAP-04 | Auth cross-subdomain | Bearer-over-cookie fix (`fc177d6`) has no automated test | **High** | Guard unit test or integration test for token precedence |
| QA-GAP-05 | Full stack | No Playwright E2E | **High** | Customer → pay → order; supplier fulfill; admin approve |
| QA-GAP-06 | Mutation score | Not measured | Medium | Add Stryker; target ≥60% on `app.service.ts` |

### 2.3 Negative test checklist (manual / Postman)

Use [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md) for API execution.

| ID | Request | Expected |
|----|---------|----------|
| NEG-01 | GET `/admin/dashboard` with customer token | **403** |
| NEG-02 | GET `/cart` without token | **401** |
| NEG-03 | POST `/cart/add` qty = 0 | **400** |
| NEG-04 | GET `/products/not-a-uuid` | **404** |
| NEG-05 | POST `/auth/login` wrong password | **401** |
| NEG-06 | GET `/auth/me` expired token | **401** |
| NEG-07 | POST `/orders` empty cart | **400** |

---

## 3. Bug triage

### 3.1 Fixed — do not reopen

| ID | Issue | Severity | Fix commit |
|----|-------|----------|------------|
| BF-017 | Supplier approve/reject Postgres `42P08` (`text` vs `varchar`) | Major | `00c8601` |
| BF-018 | Admin user modal transparent overlay | Minor | `00dc487` |
| BF-019 | Purchase history crash — NUMERIC qty as string | Major | `85c2765` |
| BF-020 | API crash on weak `JWT_SECRET` (false 502/CORS) | Major | `a25f894` |
| AUTH-01 | Login loop — stale cookie overrides Bearer on `/auth/me` | **Critical** | `fc177d6` |

### 3.2 Open / release blockers

| ID | Category | Severity | Priority | Owner | Action |
|----|----------|----------|----------|-------|--------|
| PAY-01 | Payment / ops | **Critical** | **P0** | Dev + CEO | Paystack keys + webhook on staging; ≥10 test transactions |
| BF-013 | Ops / QA | Major | **P1** | QA | Full staging E2E + `npm run smoke:week4` — record output |
| QA-GAP-01 | Test debt | Major | **P1** | Dev | DB integration tests for SQL paths |
| DOM-01 | Business | Major | **P1** | CEO | `dovachain.com` domain plan (if required for public URL) |
| BF-014 | Design | Trivial | P3 | — | Decorative star ratings — post-MVP |

### 3.3 Login incident classification (reference)

```
Category:     application bug (auth)
Severity:     Critical — blocked admin/supplier login on staging
Root cause:   JWT guard preferred stale httpOnly cookie over fresh Bearer token
Fix:          fc177d6 — prefer Authorization header; establish session from login response
Deploy check: Confirm VPS runs fc177d6 or later before QA sign-off
```

---

## 4. Backend review

### 4.1 Strengths

| Area | Assessment |
|------|------------|
| API design | REST `/api/v1`, 67 routes, role guards, DTO validation (class-validator) |
| Auth | JWT + refresh sessions in PostgreSQL, rate limits on auth routes, cross-site cookies |
| Payments | Paystack init/verify/webhook + HMAC; mock mode without secret |
| Security | Helmet, CORS with credentials, throttling, file upload limits |
| Data | Migrations `001`–`006`; shared min-order helpers |
| Monorepo | `shared/` types consumed by frontend + backend |

### 4.2 Pre-release concerns

| Issue | Risk | Recommendation |
|-------|------|----------------|
| `database.service.ts` ~9% test coverage | **High** | Integration test suite on CI with Postgres service |
| JWT warn-only in production | Medium | Set `STRICT_PRODUCTION_SECRETS=true` before public launch |
| No request correlation IDs | Medium | Add middleware for prod debugging |
| No exported OpenAPI spec | Low | Generate from controller for Postman import |
| Password reset / email verify | Out of MVP | Document as known limitation |

---

## 5. Release 100% gate checklist

### 5.1 Code and deploy

| # | Item | Status |
|---|------|--------|
| 1 | MVP features complete in repo | Done |
| 2 | CHANGELOG v0.5.0 | Done |
| 3 | Staging URLs live | Done |
| 4 | 121 unit tests green (verified 3×) | Done |
| 5 | CI green on `main` | Done |
| 6 | Deploy latest API + web (`fc177d6` login fix) on VPS | **Verify** |
| 7 | `npm run db:migrate` through `006` on staging | **Verify** |
| 8 | `npm run smoke:week4` against staging — log saved | **Open** |

### 5.2 QA execution

| # | Item | Status |
|---|------|--------|
| 9 | Postman 23-step smoke ([DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md)) | **Open** |
| 10 | Customer journey: register → cart → checkout → pay → history | **Open** |
| 11 | Supplier journey: register → approve → product → fulfill | **Open** |
| 12 | Admin journey: users CRUD, supplier approve/reject | **Open** |
| 13 | Mobile smoke (iOS + Android browser) | **Open** |
| 14 | Negative cases NEG-01 → NEG-07 | **Open** |
| 15 | UI test cases ([TEST-CASES.md](./TEST-CASES.md)) | **Open** |

### 5.3 Business and ops

| # | Item | Status |
|---|------|--------|
| 16 | Paystack ≥10 transactions on staging | **Open** |
| 17 | Support contact channel agreed | **Open** |
| 18 | Soft launch date approved by CEO | **Open** |
| 19 | Production domain plan (`dovachain.com`) | **Open** |

**Checklist score:** 5/19 done · **4 verify** · **10 open**

---

## 6. Path to 100%

| Step | Owner | Effort | Unblocks |
|------|-------|--------|----------|
| 1 | Deploy `fc177d6` + `54c3009` on VPS | DevOps | 30 min | QA can test login |
| 2 | QA runs Postman smoke + UI walkthrough | QA | 1 day | Business confidence |
| 3 | Paystack ≥10 txs on staging | Dev + CEO | 1–2 days | Payment gate |
| 4 | Add 5 DB integration tests | Dev | 4–6 hrs | SQL regression safety |
| 5 | Tag `v0.5.1` + sign-off doc update | Dozer | 1 hr | Release closure |

**Estimated time to 100%:** 3–5 business days after QA starts on latest staging deploy.

---

## 7. Sign-off matrix

| Role | Release-ready today? | Condition |
|------|---------------------|-----------|
| **Engineering** | Conditional yes | Code on `main` is shippable; deploy latest + DB migrate |
| **QA** | No | Manual API + UI pass not recorded |
| **CEO / Business** | No | Paystack proof + launch date not set |

---

## Related documents

| Doc | Purpose |
|-----|---------|
| [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md) | API endpoint list for Postman |
| [TEST-CASES.md](./TEST-CASES.md) | UI/UAT scenarios |
| [GUIDE.md](./GUIDE.md) | QA workflow |
| [ENV-SETUP.md](./ENV-SETUP.md) | VPS env vars |
| `dova-company-wiki/current-phase.md` | Stakeholder phase snapshot |
| `dova-company-wiki/docs/BUG_FIXES.md` | Bug fix log |

---

*DOVA — Building a better food supply network from Nigerian farmers to consumers.*
