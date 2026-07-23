# DOVA — MVP Status Report
## For Non-Technical Teams (Business, Operations, Sales, Leadership)

| | |
|---|---|
| **Project** | DOVA — food supply marketplace |
| **Planned period** | 21 July – 17 August 2026 (4 weeks) |
| **Report date** | 23 July 2026 (design + mobile update) |
| **Prepared by** | Dozer |
| **Audience** | Non-technical teams & business stakeholders |
| **Overall status** | Core MVP + Startup-branded UI **built**; internal demo ready (desktop & mobile). **Not** public go-live. |

---

## 1. What is DOVA? (one sentence)

**DOVA** is a marketplace that connects **business buyers** with **local food suppliers**, so customers can browse a catalog, place orders, and pay online — while suppliers manage stock and orders, and admins oversee the platform.

**MVP goal (4 weeks):** Prove the business model with a product catalog, several verified suppliers, and successful test payment transactions.

---

## 2. Executive summary (read this first)

| Question | Short answer |
|---|---|
| Can the product already be tried? | **Yes** — local / internal demo, including **phone layout**. |
| Design aligned with Startup mockups? | **Yes** — brand, home, auth, dashboards, cart/checkout. |
| Is it live for the general public? | **Not yet.** |
| Can real money be processed? | **Not on live env yet** (Paystack wired; mock without keys). |
| Where are we vs the 4-week plan? | Features + early UI polish **ahead**; launch readiness still Week 4. |
| What do non-tech teams need to do? | Confirm demo accounts, staging, go/no-go, Paystack owner, review date. |

---

## 3. Who are the users?

| Role | What they do in DOVA |
|---|---|
| **Customer** | Sign up → browse → cart → checkout & pay → order history |
| **Supplier** | Register + docs → approval → products & stock → fulfill orders |
| **Administrator** | Approve suppliers → monitor users, products, orders |

---

## 4. MVP feature status (business language)

### Done (demo-ready)

| Area | What it means for the business |
|---|---|
| Sign-up & login | Role-based access; branded auth cards |
| Product catalog | Search, categories, details; ₦ display |
| Cart & checkout | Full purchase path; mobile-friendly |
| Payment (test mode) | Simulation locally; Paystack when keys set |
| Supplier & admin dashboards | Sidebar layouts matching Startup design |
| Supplier verification docs | Form explains accepted types: CAC, government ID, optional address proof |
| Public pages | Full branded home + About + Contact + footer |
| Mobile | Hamburger menu; layouts optimized for small screens |

### Partial / needs business confirmation

| Area | Notes |
|---|---|
| Live Paystack payments | Need keys + **≥10 successful test txs** on staging |
| Contact form storage | UI exists; DB save still incomplete |
| Shared staging demo data | Seeds exist; need shared staging DB |
| Minimum order (pickup/delivery) | Requested by stakeholder; not built — see reply draft |

### Not yet

| Area | Notes |
|---|---|
| Public go-live / staging URL | Pending |
| Password reset / email verification | Out of MVP |
| Real reviews / wishlist / discounts / tracking | Out of MVP |
| E2E on public staging + prod monitoring | Week 4 |

---

## 5. User journeys (for team demos)

### A. Customer
1. Register → browse → product → cart → checkout → pay → dashboard  

### B. Supplier
1. Register + docs (CAC / ID / address listed on form) → admin approves → products → fulfill orders  

### C. Admin
1. Login → approve suppliers → review stats / orders  

**Demo accounts:**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Customers: register via the registration page.

**Tip:** Also open the demo on a phone (or Chrome device mode) to review the mobile UI.

---

## 6. Progress vs the 4-week plan

| Week | Planned focus | Current status |
|---|---|---|
| **1** | Foundation | **Done in code** |
| **2** | Customer shopping | **Mostly ready** — staging/Paystack open |
| **3** | Supplier & admin | **Mostly ready** — staging open |
| **4** | Polish + launch | **UI polish advanced**; launch checks pending |

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

- **24** unit tests passing  
- Auth smoke + build/typecheck passing  
- Mobile-first UI implemented locally  

Not yet: E2E on public staging, production load tests.

---

## 9. Decisions needed from non-technical teams

1. Main demo/staging source of truth  
2. Owners (product, content, supplier ops, launch approval)  
3. When non-tech can try staging  
4. Official staging admin/supplier emails  
5. Who provides Paystack test keys / how many txs before go-live  
6. Content readiness (About/Contact/catalog)  
7. Internal demo + Week 4 go/no-go date  
8. Confirm whether **minimum order rules** (pickup/delivery) are in MVP  

---

## 10. Risks & blockers

| Risk | Business impact | Ask |
|---|---|---|
| No shared staging | Can’t self-test | Provision staging + demo soon |
| Paystack untested with test money | Payment risk at launch | 10+ successful test payments |
| Contact form doesn’t store messages | Lost leads | Fix before soft launch |
| Min order not built | Stakeholder expectation gap | Confirm scope / timeline |

---

## 11. Recommended next steps

### This week
1. Internal demo (customer → supplier → admin) on **desktop and phone**  
2. Decide staging + Paystack owners  
3. Confirm min-order scope  

### Toward soft launch
1. Staging + DB  
2. Paystack test mode  
3. Soft UAT  
4. Contact persist + min order (if in scope)  
5. Go/no-go checklist  

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

**Related:** `DOVA MVP PROGRESS UPDATE.md`, `CHANGELOG.md`, `BUG_FIXES.md`, `DOVA_REPLY_PAYSTACK_AND_MIN_ORDER.md`, `DOVA_REPLY_SUPPLIER_VERIFICATION_DOCS.md`.
