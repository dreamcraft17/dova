# DOVA — MVP Status Report
## For Non-Technical Teams (Business, Operations, Sales, Leadership)

| | |
|---|---|
| **Project** | DOVA — food supply marketplace |
| **Planned period** | 21 July – 17 August 2026 (4 weeks) |
| **Report date** | 24 July 2026 |
| **Prepared by** | Dozer |
| **Audience** | Non-technical teams & business stakeholders |
| **Overall status** | **MVP codebase 100% complete.** Internal demo ready. **Not** public go-live. |

---

## 1. What is DOVA? (one sentence)

**DOVA** is a marketplace that connects **business buyers** with **local food suppliers**, so customers can browse a catalog, place orders, and pay online — while suppliers manage stock and orders, and admins oversee the platform.

**MVP goal (4 weeks):** Prove the business model with a product catalog, several verified suppliers, and successful test payment transactions.

---

## 2. Executive summary (read this first)

| Question | Short answer |
|---|---|
| Is MVP finished in code? | **Yes — 100% codebase.** |
| Can the product already be tried? | **Yes** — local / internal demo, including **phone**. |
| Design aligned with Startup mockups? | **Yes.** |
| Is it live for the general public? | **Not yet.** |
| Can real money be processed? | **Not on live env yet** (Paystack wired; mock without keys). |
| Where are we vs the 4-week plan? | **All product weeks Done in repo**; launch = staging + Paystack proof. |
| What do non-tech teams need to do? | Staging owners, Paystack test keys, go/no-go date. |

---

## 3. Who are the users?

| Role | What they do in DOVA |
|---|---|
| **Customer** | Sign up → browse → cart → checkout & pay → order history |
| **Supplier** | Register + docs → approval → products & stock → fulfill |
| **Administrator** | Approve suppliers → monitor users/products/orders → Contacts inbox |

---

## 4. MVP feature status (business language)

### Done — MVP complete in code

| Area | What it means |
|---|---|
| Sign-up & login | Role-based; branded auth cards |
| Product catalog | Search, categories, details; ₦ |
| Cart & checkout | Pickup/delivery + min order rules |
| Payment (test mode) | Simulation locally; Paystack when keys set |
| Supplier & admin dashboards | Sidebar layouts; image upload; contact inbox |
| Supplier verification docs | CAC, government ID, optional address proof |
| Public pages | Home + About + Contact (saved) + footer |
| Mobile | Hamburger; responsive layouts |
| Launch docs in repo | Runbook, API notes, smoke script |

### Ops / launch (not missing features)

| Area | Notes |
|---|---|
| Live Paystack payments | Need keys + ≥10 successful test txs on staging |
| Shared staging URL | Seeds exist; need shared host + DB |
| Soft launch approval | Go/no-go checklist |

### Out of MVP

Password reset, email verification, real reviews / wishlist / discounts / tracking.

---

## 5. User journeys (for team demos)

### A. Customer
Register → browse → product → cart → checkout (pickup/delivery) → pay → dashboard  

### B. Supplier
Register + docs → admin approves → products (image upload) → fulfill orders  

### C. Admin
Login → approve suppliers → review stats / orders / **Contacts**  

**Demo accounts:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Customers: register via the registration page. Also try on a phone.

---

## 6. Progress vs the 4-week plan

| Week | Planned focus | Current status |
|---|---|---|
| **1** | Foundation | **Done in codebase** |
| **2** | Customer shopping | **Done in codebase** |
| **3** | Supplier & admin | **Done in codebase** |
| **4** | Polish + launch prep | **Features + docs Done in codebase**; live verify = **ops** |

---

## 7. Hosting & services

| Part | Current plan |
|---|---|
| Website | Vercel and/or VPS |
| Backend | Node.js |
| Data | Postgres + Redis |
| Payments | Paystack (NGN) |

---

## 8. What has been tested

- **27** unit tests passing  
- Auth smoke + build/typecheck passing  
- `npm run smoke:week4` available when API is up  
- Mobile-first UI implemented locally  

Not yet: E2E on public staging, production load tests (ops).

---

## 9. Decisions needed from non-technical teams

1. Main demo/staging source of truth  
2. Owners (product, content, supplier ops, launch approval)  
3. When non-tech can try staging  
4. Official staging admin/supplier emails  
5. Who provides Paystack test keys / how many txs before go-live  
6. Content readiness (About/Contact/catalog)  
7. Soft-launch go/no-go date  

*(Minimum order rules are already built: pickup ₦3,000 / delivery ₦5,000.)*

---

## 10. Risks & blockers

| Risk | Business impact | Ask |
|---|---|---|
| No shared staging | Can’t self-test | Provision staging + demo soon |
| Paystack untested with test money | Payment risk at launch | 10+ successful test payments |

---

## 11. Recommended next steps

### This week
1. Internal demo (customer → supplier → admin) on desktop and phone  
2. Decide staging + Paystack owners  
3. After deploy: `npm run smoke:week4` against staging API  

### Toward soft launch
1. Staging + DB (`npm run db:migrate`)  
2. Paystack test mode  
3. Soft UAT + go/no-go checklist  

---

## 12. Go / no-go checklist

- [ ] Official staging URL  
- [ ] Customer pay → view order  
- [ ] Supplier register → approve → fulfill  
- [ ] ≥10 Paystack test txs  
- [ ] Admin approvals on staging  
- [ ] Contact / support channel agreed  
- [ ] Mobile smoke check on staging  
- [ ] Soft launch date approved  

---

**Related:** `DOVA MVP PROGRESS UPDATE.md`, `CHANGELOG.md`, `BUG_FIXES.md`, `DOVA_RUNBOOK.md`, `DOVA_SPEC_COMPLIANCE.md`.
