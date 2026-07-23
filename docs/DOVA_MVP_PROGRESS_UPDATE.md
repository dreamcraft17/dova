# DOVA — MVP Progress Update
## For Non-Technical Teams (Business, Operations, Sales, Leadership)

| | |
|---|---|
| **Project** | DOVA — food supply marketplace |
| **Planned period** | 21 July – 17 August 2026 (4 weeks) |
| **Update date** | 23 July 2026 |
| **Prepared by** | Dozer |
| **Audience** | Non-technical teams & business stakeholders |
| **Overall status** | Core MVP features are **built**; ready for internal demo. **Not** ready for public go-live. |

---

## 1. What is DOVA?

**DOVA** is a marketplace that connects **business buyers** with **local food suppliers**, so customers can browse a catalog, place orders, and pay online — while suppliers manage stock and orders, and admins oversee the platform.

**MVP goal (4 weeks):** Prove the business model with a product catalog, several verified suppliers, and successful test payment transactions.

---

## 2. Executive summary

| Question | Short answer |
|---|---|
| Can the product already be tried? | **Yes** — locally / internal demo (sign up, shop, simulated payment, supplier & admin dashboards). |
| Is it live for the general public? | **Not yet.** Staging/production hosting and managed database are not verified. |
| Can real money be processed? | **Not on a live environment yet.** Paystack is wired; without production keys the system uses **simulated payment** (no real charges). |
| Where are we vs the 4-week plan? | Calendar is still **Week 1**, but **Week 2–3 features are largely already in the codebase**. Remaining open items are mainly staging verification, real test payments, and Week 4 polish. |
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
| Sign-up & login | Customers, suppliers, and admins have separate access by role |
| Product catalog | Customers can search, filter by category, and open product details |
| Shopping cart | Add / change / remove items before checkout |
| Checkout & orders | Delivery form, create order, confirmation page, order history |
| Payment (test / demo mode) | Payment flow exists; local demos use **simulation** if Paystack keys are not set |
| Supplier dashboard | Add/edit/remove products, manage stock, update order fulfillment status |
| Supplier registration | Upload documents (PDF/JPG/PNG); status starts as “pending approval” |
| Admin dashboard | Stats, supplier approvals, monitor users/products/orders |
| Public pages | Home, About Us, Contact, navigation & footer |

### Partial

| Area | Current progress |
|---|---|
| Live Paystack payments | Integration is prepared in the product; live/test-key verification with multiple successful transactions is **not finished** |
| Contact form storage | Contact page exists; messages are **not yet fully saved** to storage |
| Shared staging demo data | Scripts for sample products and test suppliers exist; not yet confirmed on a shared staging environment |

### Not yet

| Area | Notes |
|---|---|
| Public go-live / official staging URL | No jointly verified public URL yet |
| Password reset / email verification | Out of MVP scope |
| Product reviews, wishlist, discounts, courier tracking | Out of MVP scope |
| Full customer email notifications | Not an MVP must-have |
| Full browser (E2E) tests & production monitoring | Planned under Week 4 |

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
   (e.g. processing → shipped → delivered)

### C. Admin — Done
1. Log in as admin  
2. View platform summary / stats  
3. Approve or reject pending suppliers  
4. Monitor users, products, and orders  

### D. Public site — Done
- Home page  
- About Us  
- Contact page  
- Shared navigation and footer across pages  

---

## 6. Progress vs the 4-week plan

| Week | Planned focus | Current status |
|---|---|---|
| **1** (21–27 Jul) | Foundation: accounts, roles, data structure, site shell | **Complete in product** |
| **2** (28 Jul–3 Aug) | Customer shopping: catalog, cart, pay, order history | **Mostly complete in product** — shared staging & live Paystack checks still open |
| **3** (4–10 Aug) | Supplier & admin | **Mostly complete in product** — joint staging verification still open |
| **4** (11–17 Aug) | Polish, joint testing, production launch, monitoring | **Not started** |

**Summary:** Feature delivery is **ahead of the calendar**. Launch readiness (hosting, real payment verification, joint UAT) is still on the Week 4 track.

---

## 7. Hosting & services (current plan)

| Part | Current plan |
|---|---|
| Customer-facing website | Planned on **Vercel** |
| Backend system | Separate Node.js server |
| Data & sessions | Managed database & cache (Docker is not part of the current workflow) |
| Payments | **Paystack** only for MVP |

---

## 8. Demo accounts (local / seed)

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Customers register through the sign-up page.  
Sample catalog data (about **20 products**) is available in the demo/seed setup. Additional test-supplier seed data also exists for supplier scenarios.

---

## 9. Quality snapshot

| Check | Status |
|---|---|
| Automated unit tests | **24** passing |
| Authentication smoke checks | Passing |
| Project build / type checks | Passing |
| Full browser end-to-end on public staging | Not done |
| Production performance / load verification | Not done |

---

## 10. Still open (progress remaining)

| Item | Status |
|---|---|
| Shared staging / official public URL | Pending |
| Live Paystack test transactions verified | Pending |
| Contact form messages saved to storage | Partial |
| Week 4 polish, joint UAT, production monitoring | Pending |

**Intentionally out of MVP scope:** password reset, email verification, reviews, wishlist, discounts, courier tracking.

---

## 11. Bottom line

**MVP features for customer, supplier, and admin are largely ready for internal progress demos and business walkthroughs.**

**Not complete yet:** launch readiness — shared staging, live payment verification, and Week 4 polish / joint testing.

---

