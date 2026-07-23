# DOVA — MVP Progress Update

**From:** Dozer  
**Date:** 23 July 2026 (afternoon update)  
**For:** Business, Ops, Sales, and leadership  
**Note:** Progress update only — not a launch plan.

---

We’re still inside the first week of the 4-week MVP window (21 Jul – 17 Aug), but shopping, supplier/admin, and the **storefront look-and-feel** are already in good shape for internal demos. You can walk the main flows on a local/internal build. We’re **not** live for the public yet, and we’re **not** taking real money yet.

Quick picture:

- Internal demo: yes (desktop + **mobile**)  
- Brand UI (Startup design): yes  
- Public live site: no  
- Real payment charges: no (demo uses simulated payment unless Paystack keys are connected)  
- Feature work: ahead of the calendar  
- Shared staging URL for everyone: not ready yet  

---

## Reminder — what DOVA is

DOVA is the food-supply marketplace: buyers browse and order from local suppliers online; suppliers manage their catalog and fulfill orders; admins approve suppliers and keep an eye on the platform.

The MVP is meant to prove that loop works — catalog, a few verified suppliers, and paid test orders — not every nice-to-have feature.

---

## Who uses it

**Customers** sign up, browse products, use a cart, check out, pay, and check their orders later.

**Suppliers** register (with documents), wait for approval, then manage products, stock, and order fulfillment.

**Admins** approve or reject suppliers and can see users, products, and orders across the platform.

---

## What’s already working

### Customers
Sign-up, login, and logout are in. Product browsing works (search, categories, product pages). Cart works. Checkout creates an order. There’s a confirmation step and order history in the customer area. Payment is connected end-to-end in the product; on the current demo it runs as a **simulated** payment so we don’t charge real money until Paystack is set up properly. Currency in the UI is **₦ (Naira)**.

### Suppliers
Registration with document upload is in. The form explains accepted verification documents (CAC / Business Name Registration, government ID such as NIN/National ID/Driver’s Licence/Passport, or optional address proof — PDF/JPG/PNG, max 5 MB). New suppliers start as pending. Once an admin approves them, they get a **sidebar dashboard**: add/edit/remove products, adjust stock, and move orders through fulfillment (e.g. processing → shipped → delivered).

### Admins
Admin login and a **sidebar dashboard** are in — platform overview, supplier approve/reject, and visibility into users, products, and orders.

### Public pages & design
Home, About Us, Contact, plus shared header/footer, match the **DOVA-Startup** brand direction (green/gold, Poppins, hero imagery, How It Works, featured products, supplier CTA, trust section). Auth uses centered login/register cards. The site is **mobile-first** (hamburger menu, stacked layouts, tables that turn into cards on small screens).

We also have sample catalog data for demos (around 20 products) and demo logins for admin and supplier if you want to click around.

**Demo logins (local / seed):**

- Admin: `admin@dova.local` / `admin1234`  
- Supplier: `supplier@dova.local` / `supplier1234`  
- Customer: register a new account on the sign-up page  

---

## Where we are against the 4-week plan

**Week 1** (foundation — accounts, roles, basic site): done in the product.

**Week 2** (customer shop + checkout): mostly done. What’s still missing here is mainly proving it on a shared staging setup and running real Paystack *test* transactions.

**Week 3** (supplier + admin): mostly done. Same story — needs to be checked together on staging, not just on a local demo.

**Week 4** (polish, fuller testing, production launch): **UI polish started early** (Startup design + mobile-first). Staging, Paystack live tests, E2E, and production launch still open.

So: the product and presentation side of the MVP is further along than the calendar suggests. The “is this ready to show customers / take payments for real” side is still open.

---

## What’s not finished yet

- No shared public / staging URL that the whole team can use yet  
- Paystack is prepared in the product, but we haven’t finished a proper round of live test payments  
- The Contact page is there, but contact messages aren’t fully saved yet  
- Minimum order value (pickup/delivery thresholds) not built yet — see stakeholder reply draft  
- Broader launch checks (full walkthrough on staging, production monitoring, etc.) are still ahead of us  

Things we deliberately left out of this MVP (so nobody expects them yet): password reset, email verification, real product reviews API, wishlist, discounts, courier tracking.

---

## Hosting (as currently planned)

The customer site can go on **Vercel** or a **VPS** (Node + Nginx + Postgres/Redis). The backend runs as a separate Node process. Database and session storage are planned as managed or VPS-local services. Payments for MVP stay on Paystack only. We’re not using Docker in the day-to-day workflow for this project.

See also: `Readme.md` (setup), `docs/CHANGELOG.md`, `docs/BUG_FIXES.md`.

---

## Checks we’ve already run

Automated unit tests are passing (24). Auth smoke checks pass. The project builds cleanly. Frontend typecheck passes after the design + mobile pass. We have **not** finished full browser testing on a public staging site, and we have **not** done production performance checks.

---
