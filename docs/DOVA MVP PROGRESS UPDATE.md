# DOVA — MVP Progress Update

**From:** Dozer  
**Date:** 24 July 2026  
**For:** Business, Ops, Sales, and leadership  
**Note:** Progress update — MVP **codebase is complete**; this is not a go-live announcement.

---

**MVP codebase: 100% complete.** Week 1–4 product features are in the repo (shopping, supplier/admin, Startup UI, contact save, min order, product image upload, runbook/smoke). You can walk every main flow on a local/internal build.

We are **not** live for the public yet, and we are **not** taking real money yet until staging + Paystack proof.

Quick picture:

- MVP features in code: **yes (100%)**  
- Internal demo: yes (desktop + mobile)  
- Brand UI (Startup): yes  
- Public live site: no  
- Real payment charges: no (simulation unless Paystack keys are set)  
- Shared staging URL: not ready yet  

---

## Reminder — what DOVA is

DOVA is the food-supply marketplace: buyers browse and order from local suppliers; suppliers manage catalog and fulfillment; admins approve suppliers and oversee the platform.

---

## Who uses it

**Customers** sign up, browse, cart, checkout (pickup min ₦3,000 / delivery min ₦5,000), pay, and view orders.

**Suppliers** register with documents, wait for approval, then manage products (including image upload), stock, and fulfillment.

**Admins** approve suppliers, monitor users/products/orders, and see **Contact** form submissions.

---

## What’s already working

All agreed MVP journeys are in the product: auth, catalog, cart/checkout/Paystack (mock without keys), orders, supplier/admin dashboards, public pages, contact persist, min order, image upload, mobile-first UI.

**Demo logins (local / seed):**

- Admin: `admin@dova.local` / `admin1234`  
- Supplier: `supplier@dova.local` / `supplier1234`  
- Customer: register on the sign-up page  

~20 sample products available in seed/demo.

---

## Where we are against the 4-week plan

| Week | Status |
|------|--------|
| 1 Foundation | **Complete in codebase** |
| 2 Customer shop | **Complete in codebase** |
| 3 Supplier + admin | **Complete in codebase** |
| 4 Polish + launch prep | **Features + docs complete in codebase**; live URL / Paystack proof = **ops** |

---

## What’s not finished yet (ops only)

- Shared public / staging URL  
- Round of live Paystack *test* payments (≥10)  
- Soft-launch go/no-go on staging  

Out of MVP on purpose: password reset, email verification, real reviews API, wishlist, discounts, courier tracking.

---

## Hosting (as planned)

Vercel and/or VPS for the site; Node backend; Postgres/Redis; Paystack only. See `docs/DOVA_RUNBOOK.md` and `docs/DOVA_VPS_DEPLOY.md`.

---

## Checks we’ve already run

27 unit tests passing; auth smoke; build/typecheck; `npm run smoke:week4` available when API is up. Full browser E2E on a public staging URL and production load checks are still ahead (ops).

---
