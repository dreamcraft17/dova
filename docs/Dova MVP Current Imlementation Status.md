# DOVA — MVP Status Report
## For Non-Technical Teams (Business, Operations, Sales, Leadership)

| | |
|---|---|
| **Project** | DOVA — food supply marketplace |
| **Planned period** | 21 July – 17 August 2026 (4 weeks) |
| **Report date** | 23 July 2026 |
| **Prepared by** | Dozer |
| **Audience** | Non-technical teams & business stakeholders |
| **Overall status** | Core MVP features are **built**; ready for internal demo. **Not** ready for public go-live. |

---

## 1. What is DOVA? (one sentence)

**DOVA** is a marketplace that connects **business buyers** with **local food suppliers**, so customers can browse a catalog, place orders, and pay online — while suppliers manage stock and orders, and admins oversee the platform.

**MVP goal (4 weeks):** Prove the business model with a product catalog, several verified suppliers, and successful test payment transactions.

---

## 2. Executive summary (read this first)

| Question | Short answer |
|---|---|
| Can the product already be tried? | **Yes** — locally / internal demo (sign up, shop, simulated payment, supplier & admin dashboards). |
| Is it live for the general public? | **Not yet.** Staging/production hosting and managed database are not verified. |
| Can real money be processed? | **Not on a live environment yet.** Paystack is wired; without production keys the system uses **simulated payment** (no real charges). |
| Where are we vs the 4-week plan? | Calendar is still **Week 1**, but **Week 2–3 features are largely already in the codebase**. Remaining: staging verification, real test payments, and Week 4 polish. |
| What do non-tech teams need to do? | Confirm demo accounts, shared test environment, go/no-go for staging, and a joint review date. |

---

## 3. Who are the users?

| Role | What they do in DOVA |
|---|---|
| **Customer** | Sign up → browse products → cart → checkout & pay → view order history |
| **Supplier** | Register + upload documents → wait for admin approval → manage products & stock → fulfill orders |
| **Administrator** | Approve/reject suppliers → monitor users, products, and orders → view platform overview |

---

## 4. MVP feature status (business language)

### Done (demo-ready)

| Area | What it means for the business |
|---|---|
| Sign-up & login | Customers, suppliers, and admins have separate access by role |
| Product catalog | Customers can search, filter by category, and open product details |
| Shopping cart | Add / change / remove items before checkout |
| Checkout & orders | Delivery form, create order, confirmation page, order history |
| Payment (test mode) | Payment flow exists; local demos use **simulation** if Paystack keys are not set |
| Supplier dashboard | Add/edit/remove products, manage stock, update order fulfillment status |
| Supplier registration | Upload documents (PDF/JPG/PNG); status starts as “pending approval” |
| Admin dashboard | Stats, supplier approvals, monitor users/products/orders |
| Public pages | Home, About Us, Contact, navigation & footer |

### Partial / needs business confirmation

| Area | Notes |
|---|---|
| Live Paystack payments | Code is ready; needs Paystack account keys + **≥10 successful test transactions** on staging |
| Contact form storage | Contact UI exists, but messages are **not yet saved** to the database |
| Shared staging demo data | Scripts for 20 products + 5 test suppliers exist; need to run on a shared staging database |

### Not yet (out of MVP scope or waiting on Week 4)

| Area | Notes |
|---|---|
| Public go-live / official staging URL | No jointly verified public URL yet |
| Password reset / email verification | Out of MVP scope |
| Product reviews, wishlist, discounts, courier tracking | Out of MVP scope |
| Full customer email notifications | Not an MVP must-have |
| Full browser (E2E) tests & production monitoring | Planned for Week 4 |

---

## 5. User journeys (for team demos)

### A. Customer
1. Register a customer account  
2. Browse the catalog and open a product  
3. Add to cart → checkout  
4. Pay (simulation or Paystack test)  
5. View status in the customer dashboard  

### B. Supplier
1. Register as a supplier + upload documents  
2. Admin approves  
3. Add products and set stock  
4. Process orders (e.g. processing → shipped → delivered)  

### C. Admin
1. Log in as admin  
2. Approve / reject suppliers  
3. Review platform summary and orders  

**Demo accounts (local / seed environment):**

| Role | Email | Password |
|---|---|---|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |

Customers: register via the registration page.

---

## 6. Progress vs the 4-week plan

| Week | Planned focus | Current status |
|---|---|---|
| **1** (21–27 Jul) | Foundation: sign-up/login, roles, data structure, site shell | **Done in code** — live staging still waiting on infrastructure |
| **2** (28 Jul–3 Aug) | Customer shopping: catalog, cart, pay, order history | **Mostly ready in code** — real Paystack tests & staging not done |
| **3** (4–10 Aug) | Supplier & admin | **Mostly ready in code** — joint staging verification not done |
| **4** (11–17 Aug) | Polish, testing, production deploy, monitoring | **Not started** — main path toward launch |

**Bottom line:** Feature work is **ahead of the calendar**, but **launch readiness** (hosting, real payments, joint UAT) is still on the Week 4 track.

---

## 7. Hosting & services (plain language)

| Part | Current plan |
|---|---|
| Customer-facing website | Planned on **Vercel** |
| Backend system | Separate Node.js server |
| Data & sessions | Managed database & cache (Docker is not part of the current workflow) |
| Payments | **Paystack** only for MVP |

---

## 8. What has been tested (quality evidence)

- **24** automated unit tests passing  
- Backend authentication smoke test passing  
- Project build & typecheck passing  

Not yet: full browser end-to-end tests on public staging, or production performance/load checks.

---

## 9. Decisions needed from non-technical teams

Please confirm / decide:

1. **Shared source of truth** — which project version is the main one for demo & staging?  
2. **Ownership** — who leads product, content, supplier ops, sales, and launch approval?  
3. **Shared test environment** — when can non-tech teams try the full flow on staging?  
4. **Initial accounts** — official staging admin & supplier emails (not only `@dova.local`).  
5. **Paystack** — who provides the test account/keys? How many test transactions before go-live?  
6. **Content** — are About/Contact/catalog texts ready for staging?  
7. **Review schedule** — when is the internal demo review and Week 4 go/no-go?

---

## 10. Risks & blockers (plain language)

| Risk | Business impact | Ask from the team |
|---|---|---|
| No shared staging yet | Non-tech teams cannot self-test | Provision staging + schedule a demo soon |
| Paystack not tested with real test money | Payment failure risk at launch | Schedule 10+ successful test payments before soft launch |
| Repo / ownership not finalized | Duplicate work or wrong version | Decide the main source this week |
| Contact form does not store messages | Website leads may be lost | Fix before soft launch |

---

## 11. Recommended next steps

### This week (business + ops)
1. Schedule a **30–45 minute internal demo** (customer → supplier → admin).  
2. Decide staging owner, Paystack test owner, and official admin accounts.  
3. Prepare a list of **5 test suppliers** and initial catalog content (if not ready).  

### Toward soft launch
1. Live staging + shared database.  
2. Paystack test-mode payment checks.  
3. Soft UAT by business/ops (use journeys in section 5).  
4. Fix contact form so messages are stored.  
5. Week 4 go/no-go using the checklist below.

---

## 12. Go / no-go checklist (for leadership)

Check before public soft launch:

- [ ] Official staging URL is available and accessible to the team  
- [ ] Customer demo → pay → view order succeeds  
- [ ] Supplier demo: register → approved → products → fulfill order  
- [ ] ≥10 successful Paystack test transactions  
- [ ] Admin can approve/reject suppliers on staging  
- [ ] Contact / support channel agreed  
- [ ] Operational owner for launch day agreed  
- [ ] Soft launch date approved by all stakeholders  

--- 