# DOVA — Test Cases

**Author:** Dozer (@dreamraft17) - Software Engineer  
**Updated:** August 2026  
**Automated:** `npm run test` — **146 tests** · `npm run smoke:production` (28 API steps + 10 negative) · `npm run smoke:week4`  
**QA workflow:** see [GUIDE.md](./GUIDE.md)  
**Demo accounts:** admin `admin@dova.local` / `admin1234` · supplier `supplier@dova.local` / `supplier1234`  
**Local URLs:** storefront http://localhost:3001 · API http://localhost:3000/api/v1 · feedback http://localhost:3001/feedback

---

## How to read

| Type | Location | When to run |
|------|----------|-------------|
| **Unit** | `*.spec.ts` under `shared/`, `apps/backend/src/`, `apps/frontend/src/lib/` | Every PR / `npm run test` |
| **Integration smoke** | `apps/backend/test/auth.test.js` | CI + `npm run test:backend` |
| **API smoke** | `scripts/smoke-week4.js` | After deploy / with `npm run dev` |
| **Manual UAT** | Tables below | Production (`dova.dntech.id`), mobile + desktop |

**Pass criteria:** expected result matches; no 5xx; auth cookies set on login; ₦ amounts correct; feedback stays on native `/feedback` (no external FeedLog).

---

## 1. Authentication & roles

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-01 | Customer register | `/auth/register` → valid data | Redirect to `/auth/verify-email`; pending until OTP |
| AUTH-01b | Email verify | Enter 6-digit OTP from inbox | Account active; logged in as customer |
| AUTH-02 | Register validation | Invalid email / short password / mismatch confirm | Error shown; no account |
| AUTH-03 | Duplicate email | Register same email twice | “Email already registered” |
| AUTH-04 | Customer login | `/auth/login` with valid credentials | JWT cookies; redirect by role |
| AUTH-05 | Bad credentials | Wrong password | Generic “Invalid credentials” |
| AUTH-06 | Logout | Click logout | Cookies cleared; protected routes redirect |
| AUTH-07 | Role guard — customer | Customer opens `/admin` | Blocked / redirect |
| AUTH-08 | Role guard — supplier | Unapproved supplier opens `/supplier` products | Blocked until approved |
| AUTH-09 | Checkout login modal | Guest checkout → prompted to login | Modal login; resume checkout after auth |
| AUTH-10 | Forgot password | `/auth/forgot-password` verified email | Generic success message; reset email sent |
| AUTH-11 | Reset password | `/auth/reset-password` with OTP | Password updated; old sessions revoked; login with new password |

**Automated coverage:** `AppService` register/login/refresh/revoke/forgot/reset · `auth.test.js` · smoke steps 24–26

---

## 1b. Automated unit test inventory (Aug 2026)

| File | Tests | Covers |
|------|-------|--------|
| `shared/src/index.spec.ts` | 4 | Email/password validation, roles, min-order helpers |
| `apps/backend/src/app.service.spec.ts` | 40+ | Auth, cart, orders, payments, admin, supplier, webhook |
| `apps/backend/src/feedback.service.spec.ts` | 6 | Posts, votes, comments, changelog, roadmap, admin guard |
| `apps/backend/src/notification.service.spec.ts` | 7 | Supplier email, contact forwarding, provider errors |
| `apps/frontend/src/lib/api.spec.ts` | 4 | API client, errors, FormData |
| `apps/frontend/src/lib/feedlog.spec.ts` | 3 | Native `/feedback` link helpers (`FeedlogLink` contract) |
| `apps/backend/test/auth.test.js` | 1 flow | Register → duplicate → login → refresh → revoke |
| **Total** | **146** | 17 Jest suites + backend auth script |

Run: `npm run test` · Coverage: `npm run test:coverage`

---

## 2. Catalog & search

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| CAT-01 | Browse products | `/products` | Grid loads; ₦ prices; pagination if >12 |
| CAT-02 | Search | Type in search box | Debounced filter by name |
| CAT-03 | Category filter | Select category | List filters |
| CAT-04 | Product detail | Open `/products/[id]` | Name, price, stock, supplier, description |
| CAT-05 | Verified badge | Product from approved supplier | Verified indicator where applicable |
| CAT-06 | Mobile layout | `/products` on phone width | Hamburger nav; readable cards; loading spinner while fetch |

**Automated coverage:** `listProducts` pagination (≥20 seed products)

---

## 3. Cart & delivery slot

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| CART-01 | Add to cart | Product detail → select slot → Add | Item in cart with slot |
| CART-02 | Slot required | Add without morning/evening | Toast/error “select delivery slot” |
| CART-03 | Update quantity | `/cart` increase/decrease | Subtotal + total recalc |
| CART-04 | Change slot | Toggle morning/evening on line item | Slot persisted |
| CART-05 | Stock limit | Quantity > available stock | Error |
| CART-06 | Empty cart | Remove all items | Empty state; checkout blocked |

**Automated coverage:** `addCart`, `updateCart`, `removeCart`, delivery slot merge, quantity validation, empty cart guard

---

## 4. Checkout & minimum order

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| CHK-01 | Delivery min ₦5,000 | Basket ₦4,999 delivery | Blocked; “Add ₦X more…” |
| CHK-02 | Delivery at min | Basket ≥ ₦5,000 delivery | Checkout allowed |
| CHK-03 | Pickup min ₦3,000 | Basket ₦2,999 pickup | Blocked |
| CHK-04 | Pickup at min | Basket ≥ ₦3,000 pickup | Checkout allowed; default hub address OK |
| CHK-05 | Required fields | Missing name/phone/address (delivery) | Validation error |
| CHK-06 | Guest blocked | Not logged in | Login modal or redirect |

**Automated coverage:** `minOrderMessage`, `minOrderShortfall`, pickup/delivery `createOrder` guards

---

## 5. Payments (Paystack / mock)

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| PAY-01 | Mock flow (no secret key) | Checkout → pay | Redirect `/checkout/verify`; order **paid** |
| PAY-02 | Mock idempotency | Initialize payment twice same order | Same reference reused |
| PAY-03 | Paystack test (keys set) | Checkout → Paystack test card | Paystack page → verify → **paid** |
| PAY-04 | Webhook | Paystack `charge.success` to `/payments/webhook` | Order marked paid (signature valid) |
| PAY-05 | Order history | `/customer` after pay | Order listed with paid status |

**Automated coverage:** mock initialize/verify/webhook · Paystack HMAC signature validation · idempotency

---

## 6. Supplier

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| SUP-01 | Register | `/auth/supplier-register` + docs | Status **pending** |
| SUP-02 | Pending dashboard | Login before approval | Limited / pending message |
| SUP-03 | Product CRUD | Add/edit/delete product | Reflected in catalog when active |
| SUP-04 | Image upload | Multipart JPG/PNG/WEBP ≤5MB | Image stored/displayed |
| SUP-05 | Stock adjust | Restock / damage | Stock history updated |
| SUP-06 | Fulfillment | pending/paid → processing → shipped → delivered | Valid transitions only |
| SUP-07 | Stock on purchase | Customer buys product | Supplier stock decreases |

**Automated coverage:** supplier CRUD, stock, fulfillment transitions, approval + rejection flow

---

## 7. Admin

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| ADM-01 | Dashboard stats | `/admin` | Users, suppliers, products, orders counts |
| ADM-02 | Approve supplier | Pending list → approve | Supplier active; can add products |
| ADM-03 | Reject supplier | Reject with reason | Supplier inactive |
| ADM-04 | Users / products / orders | Admin tables | List + toggle active |
| ADM-05 | Contacts inbox | Submit contact form → admin tab | Message visible |
| ADM-06 | Feedback — status & reply | Admin → **Feedback** tab | Change status dropdown; official reply posts to idea |
| ADM-07 | Feedback — publish changelog | Admin → Feedback → Publish changelog form | New entry on `/feedback/changelog` |

**Automated coverage:** supplier approval/rejection, admin dashboard/users/products/orders, contact submission, `FeedbackService`

---

## 8. Public pages & navigation

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| PUB-01 | Home | `/` | Hero, featured, CTA |
| PUB-02 | About / Contact | Static pages | Render; contact persists |
| PUB-03 | Footer links | All footer links | Correct routes |
| PUB-04 | Feedback nav link | Header **Feedback** (`FeedlogLink`) | `/feedback` same tab, same origin |
| PUB-05 | Customer dashboard CTA | `/customer` → feedback callout | Opens `/feedback` |
| PUB-06 | Supplier/admin shell link | Logged-in supplier or admin sidebar | **Feedback** → `/feedback` |
| PUB-07 | Roadmap / changelog | `/feedback/roadmap`, `/feedback/changelog` | Columns + release notes |
| PUB-08 | Loading states | Open cart, product, feedback pages | Spinner/skeleton; no indefinite blank |

**Automated coverage:** `getFeedlogUrl()` · `getFeedlogFeedbackHref()` · `isFeedlogSameOrigin()` · contact smoke script

---

## 9. Native feedback board (Feedlog integrated)

> External FeedLog app removed. All cases use **`/feedback`** on the DOVA storefront. No SSO / proxy / `NEXT_PUBLIC_FEEDLOG_*` env.

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| FEED-01 | Board loads | Open `/feedback` | List of ideas; sort controls; search |
| FEED-02 | Guest submit | Submit idea with name (not logged in) | Idea appears; default status **open** |
| FEED-03 | Auth submit | Submit while logged in | Author tied to account |
| FEED-04 | Vote once | Log in → vote | Count +1 |
| FEED-05 | Duplicate vote | Vote same idea again | Error / no double count |
| FEED-06 | Search | Search keyword | Filters title/description |
| FEED-07 | Post detail | `/feedback/[id]` | Description, votes, status badge |
| FEED-08 | Comments | Add comment on detail page | Thread updates; guest or auth |
| FEED-09 | Roadmap columns | `/feedback/roadmap` | Ideas grouped: open, planned, in_progress, done |
| FEED-10 | Changelog detail | Click entry on `/feedback/changelog` | `/feedback/changelog/[slug]` full body |

**API routes (prefix `/api/v1`):**  
`GET/POST /feedback/posts` · `GET /feedback/posts/:id` · `POST .../vote` · `GET/POST .../comments` · `POST .../official-reply` · `PUT .../status` · `GET /feedback/roadmap` · `GET/POST /feedback/changelog` · `GET /feedback/changelog/:slug`

**Automated coverage:** `FeedbackService` (6 tests) · `feedlog.spec.ts` (3 tests)

**Storage (MVP):** in-memory when `USE_IN_MEMORY=true` (default dev). PostgreSQL migration `003_feedlog_extensions.sql` documents optional shared DB with legacy FeedLog schema — not required for UAT.

---

## 10. Staging go-live (ops)

| ID | Scenario | Expected |
|----|----------|----------|
| OPS-01 | `GET /api/v1/health` | `{ status: "ok" }` |
| OPS-02 | `npm run smoke:week4` against staging API | Pass |
| OPS-03 | ≥10 Paystack test transactions | All verify + webhook |
| OPS-04 | Mobile smoke customer → supplier → admin → feedback | Full journey on phone |

See also internal runbook / staging docs (wiki mirror if available).

---

## Running automated tests

```bash
npm run test              # all unit tests (146)
npm run test:coverage     # with coverage report
npm run test:backend      # compiled auth integration
npm run smoke:week4       # requires API on :3000
```

**CI:** `.github/workflows/ci.yml` runs build, typecheck, unit + backend tests on every push/PR.

---

## Feedlog helper reference (for dev/QA)

| Function | Behavior |
|----------|----------|
| `isFeedlogEnabled()` | Always `true` (native board) |
| `getFeedlogUrl()` | Returns `/feedback` |
| `getFeedlogFeedbackHref()` | Same-origin href; `/roadmap` return → `/feedback/roadmap` |
| `isFeedlogSameOrigin()` | Always `true` |
| `getFeedlogSsoPath()` | **Deprecated** — returns `null` |

UI component: `FeedlogLink` — used in `Layout`, `DashboardShell`, `customer.tsx`.
