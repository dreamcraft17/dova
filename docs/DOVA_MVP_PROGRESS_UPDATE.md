# DOVA — MVP Progress Update
## For Non-Technical Teams (Business, Operations, Sales, Leadership)

| | |
|---|---|
| **Project** | DOVA — food supply marketplace |
| **Planned period** | 21 July – 17 August 2026 (4 weeks) |
| **Update date** | 23 July 2026 (UI + mobile update) |
| **Prepared by** | Dozer |
| **Audience** | Non-technical teams & business stakeholders |
| **Overall status** | Core MVP features + branded UI are **built**; ready for internal demo on desktop & phone. **Not** ready for public go-live. |

---

## 1. What is DOVA?

**DOVA** is a marketplace that connects **business buyers** with **local food suppliers**, so customers can browse a catalog, place orders, and pay online — while suppliers manage stock and orders, and admins oversee the platform.

**MVP goal (4 weeks):** Prove the business model with a product catalog, several verified suppliers, and successful test payment transactions.

---

## 2. Executive summary

| Question | Short answer |
|---|---|
| Can the product already be tried? | **Yes** — locally / internal demo (sign up, shop, simulated payment, supplier & admin dashboards). Works on **phone and desktop**. |
| Does it look like the agreed Startup design? | **Yes** — green/gold brand, home sections, auth cards, dashboards, cart/checkout restyled. |
| Is it live for the general public? | **Not yet.** Staging/production hosting and managed database are not verified. |
| Can real money be processed? | **Not on a live environment yet.** Paystack is wired; without keys the system uses **simulated payment**. |
| Where are we vs the 4-week plan? | Calendar is still **Week 1**, but **Week 2–3 features + early Week 4 UI polish** are largely in. Remaining: staging, real test payments, launch. |
| What is this update for? | Share current **progress only** — what is done, partial, or not started. |

---

## 3. Who are the users?

| Role | What they do in DOVA |
|---|---|
| **Customer** | Sign up → browse products → cart → checkout & pay → view order history |
| **Supplier** | Register + upload documents → wait for admin approval → manage products & stock → fulfill orders |
| **Administrator** | Approve/reject suppliers → monitor users, products, and orders → view platform overview |

---

## 4. Feature progress (business language)

### Done (demo-ready)

| Area | What it means for the business |
|---|---|
| Sign-up & login | Customers, suppliers, and admins have separate access by role; auth screens use branded cards |
| Product catalog | Search, category filter, product details; ₦ pricing; trust cues on cards |
| Shopping cart | Add / change / remove items; mobile-friendly cart layout |
| Checkout & orders | Delivery form, create order, confirmation, order history |
| Payment (test / demo mode) | Flow exists; local demos use **simulation** if Paystack keys are not set |
| Supplier dashboard | Sidebar dashboard: products, stock, fulfillment |
| Supplier registration | Upload documents; status starts as “pending approval” |
| Admin dashboard | Sidebar: stats, approvals, users/products/orders |
| Public pages & brand | Home (hero, How It Works, featured, supplier CTA, trust), About, Contact, full footer |
| Mobile experience | Hamburger menu, stacked layouts, tables → cards on small screens |

### Partial

| Area | Current progress |
|---|---|
| Live Paystack payments | Integration prepared; multi-transaction verification on staging **not finished** |
| Contact form storage | Contact page exists; messages **not yet fully saved** to storage |
| Shared staging demo data | Seed scripts exist; not yet confirmed on a shared staging environment |
| Minimum order value | Stakeholder asked (pickup ₦3k / delivery ₦5k) — **not built yet** |

### Not yet

| Area | Notes |
|---|---|
| Public go-live / official staging URL | No jointly verified public URL yet |
| Password reset / email verification | Out of MVP scope |
| Real product reviews API, wishlist, discounts, courier tracking | Out of MVP scope (stars on UI are decorative for now) |
| Full browser (E2E) tests & production monitoring | Still Week 4 |

---

## 5. Progress by user journey (detail)

### A. Customer — Done
1. Register a customer account  
2. Log in / log out  
3. Browse the catalog (search, category filter, pagination)  
4. Open product details  
5. Add to cart; update or remove items  
6. Checkout with delivery details  
7. Pay (simulation or Paystack when keys are configured)  
8. See payment / order confirmation  
9. View order list and order detail in the customer area  

### B. Supplier — Done
1. Register as a supplier and upload supporting documents  
2. Wait in **pending** status until admin action  
3. After approval: access supplier dashboard  
4. Create, edit, and remove products  
5. Manage stock (restock / adjustments)  
6. See supplier orders and update fulfillment status  

### C. Admin — Done
1. Log in as admin  
2. View platform summary / stats  
3. Approve or reject pending suppliers  
4. Monitor users, products, and orders  

### D. Public site — Done
- Branded home page (Startup design)  
- About Us / Contact  
- Shared navigation (desktop + mobile drawer) and footer  

---

## 6. Progress vs the 4-week plan

| Week | Planned focus | Current status |
|---|---|---|
| **1** (21–27 Jul) | Foundation: accounts, roles, data structure, site shell | **Complete in product** |
| **2** (28 Jul–3 Aug) | Customer shopping: catalog, cart, pay, order history | **Mostly complete** — staging & live Paystack checks still open |
| **3** (4–10 Aug) | Supplier & admin | **Mostly complete** — joint staging verification still open |
| **4** (11–17 Aug) | Polish, joint testing, production launch | **UI polish advanced early**; staging/launch checks still pending |

**Summary:** Feature + brand delivery is **ahead of the calendar**. Launch readiness is still on the Week 4 track.

---

## 7. Hosting & services (current plan)

| Part | Current plan |
|---|---|
| Customer-facing website | **Vercel** and/or **VPS** (Nginx + Node) |
| Backend system | Separate Node.js server |
| Data & sessions | Managed or VPS PostgreSQL & Redis (Docker not required) |
| Payments | **Paystack** only for MVP (NGN) |

---

## 8. Demo accounts (local / seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Customers register through the sign-up page. Sample catalog (~**20 products**) available in seed/demo.

---

## 9. Quality snapshot

| Check | Status |
|---|---|
| Automated unit tests | **24** passing |
| Authentication smoke checks | Passing |
| Project build / type checks | Passing |
| Mobile-first UI pass | Done (local) |
| Full browser end-to-end on public staging | Not done |
| Production performance / load verification | Not done |

---

## 10. Still open (progress remaining)

| Item | Status |
|---|---|
| Shared staging / official public URL | Pending |
| Live Paystack test transactions verified | Pending |
| Contact form messages saved to storage | Partial |
| Minimum order value (pickup/delivery) | Not started |
| Week 4 joint UAT + production monitoring | Pending |

**Intentionally out of MVP scope:** password reset, email verification, real reviews API, wishlist, discounts, courier tracking.

---

## 11. Bottom line

**MVP features for customer, supplier, and admin — plus branded, mobile-friendly UI — are ready for internal demos and business walkthroughs.**

**Not complete yet:** launch readiness — shared staging, live payment verification, min-order rules, and Week 4 joint testing.

**Related docs:** `CHANGELOG.md`, `BUG_FIXES.md`, `DOVA_SPEC_COMPLIANCE.md`, `DOVA_REPLY_PAYSTACK_AND_MIN_ORDER.md`.

---
