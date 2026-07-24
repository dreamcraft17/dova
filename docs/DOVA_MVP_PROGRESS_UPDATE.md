# DOVA — MVP Progress Update
## For Non-Technical Teams (Business, Operations, Sales, Leadership)

| | |
|---|---|
| **Project** | DOVA — food supply marketplace |
| **Planned period** | 21 July – 17 August 2026 (4 weeks) |
| **Update date** | 24 July 2026 |
| **Prepared by** | Dozer |
| **Audience** | Non-technical teams & business stakeholders |
| **Overall status** | **MVP codebase 100% complete.** Internal demo ready (desktop & phone). **Public go-live** still needs staging + Paystack proof. |

---

## 1. What is DOVA?

**DOVA** is a marketplace that connects **business buyers** with **local food suppliers**, so customers can browse a catalog, place orders, and pay online — while suppliers manage stock and orders, and admins oversee the platform.

**MVP goal (4 weeks):** Prove the business model with a product catalog, several verified suppliers, and successful test payment transactions.

---

## 2. Executive summary

| Question | Short answer |
|---|---|
| Is the MVP finished in code? | **Yes — 100% codebase** for the agreed MVP scope. |
| Can the product already be tried? | **Yes** — local / internal demo (desktop & phone). |
| Does it look like the Startup design? | **Yes** — brand, home, auth, dashboards, cart/checkout. |
| Is it live for the general public? | **Not yet** — hosting / staging URL not verified. |
| Can real money be processed? | **Not on a live env yet.** Paystack is wired; demo uses **simulation** without keys. |
| Where are we vs the 4-week plan? | **All Week 1–4 product work is in the repo.** Next: ops launch track. |
| What is this update for? | Confirm feature completion vs what still needs business/ops action. |

---

## 3. Who are the users?

| Role | What they do in DOVA |
|---|---|
| **Customer** | Sign up → browse → cart → checkout (pickup/delivery) & pay → order history |
| **Supplier** | Register + docs → admin approval → products (incl. image upload) & stock → fulfill |
| **Administrator** | Approve suppliers → monitor users/products/orders → **Contacts** inbox |

---

## 4. Feature progress (business language)

### Done — MVP complete in code

| Area | What it means for the business |
|---|---|
| Sign-up & login | Role-based access; branded auth cards |
| Product catalog | Search, categories, details; ₦ pricing |
| Shopping cart | Add / change / remove; mobile-friendly |
| Checkout & orders | Pickup **₦3,000** min / delivery **₦5,000** min; history |
| Payment | Paystack wired; simulation without keys |
| Supplier dashboard | Products (image upload), stock, fulfillment |
| Supplier registration | CAC / government ID / optional address proof guidance |
| Admin dashboard | Stats, approvals, users/products/orders, contact inbox |
| Public pages & brand | Home, About, Contact (saved), footer |
| Mobile experience | Hamburger menu; responsive layouts |
| Launch docs (in repo) | Runbook, API notes, smoke script |

### Ops / launch (not code gaps)

| Area | Notes |
|---|---|
| Shared staging / public URL | Needs hosting provision + migrate/seed |
| Live Paystack test txs | Need keys + ≥10 successful test payments |
| Soft launch go/no-go | Business checklist on staging |

### Intentionally out of MVP

Password reset, email verification, real reviews API, wishlist, discounts, courier tracking.

---

## 5. Progress by user journey

All customer / supplier / admin / public journeys listed in earlier updates are **Done** in the product (including contact save, min order, product image upload).

---

## 6. Progress vs the 4-week plan

| Week | Planned focus | Status |
|---|---|---|
| **1** | Foundation | **Complete in codebase** |
| **2** | Customer shopping | **Complete in codebase** |
| **3** | Supplier & admin | **Complete in codebase** |
| **4** | Polish + launch prep | **Features + docs complete in codebase**; live URL / Paystack proof = **ops** |

**Summary:** **MVP codebase = 100%.** Remaining work is launch operations.

---

## 7. Hosting & services (plan)

| Part | Plan |
|---|---|
| Website | Vercel and/or VPS |
| Backend | Node.js |
| Data | PostgreSQL + Redis |
| Payments | Paystack (NGN) |

---

## 8. Demo accounts (local / seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Customers register on the sign-up page. ~20 sample products in seed/demo.

---

## 9. Quality snapshot

| Check | Status |
|---|---|
| Automated unit tests | **27** passing |
| Auth smoke | Passing |
| Build / typecheck | Passing |
| Week 4 smoke helper | `npm run smoke:week4` (API up) |
| E2E on public staging | Ops — pending staging URL |
| Production load tests | Ops — pending |

---

## 10. Still open (ops only)

| Item | Status |
|---|---|
| Shared staging / official public URL | Pending |
| Live Paystack test transactions verified | Pending |
| Soft launch / go-no-go on staging | Pending |

**Codebase items previously open (contact save, min order, image upload) are Done.**

---

## 11. Bottom line

**MVP product code is complete (100%).** Teams can demo end-to-end locally.

**Not complete yet:** public go-live — staging URL, Paystack test proof, soft-launch approval.

**Related:** `CHANGELOG.md`, `BUG_FIXES.md`, `DOVA_SPEC_COMPLIANCE.md`, `DOVA_RUNBOOK.md`, `DOVA_API.md`.
