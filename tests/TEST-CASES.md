# DOVA — Test Cases

**Updated:** August 2026  
**Automated:** `npm run test` (Jest unit) · `npm run test:backend` (auth smoke) · `npm run smoke:week4` (API health + contact)  
**Demo accounts:** see `docs/DEMO-ACCOUNTS.md` (admin / supplier seeded in dev)

---

## How to read

| Type | Location | When to run |
|------|----------|-------------|
| **Unit** | `*.spec.ts` under `shared/`, `apps/backend/src/`, `apps/frontend/src/lib/` | Every PR / `npm run test` |
| **Integration smoke** | `apps/backend/test/auth.test.js` | CI + `npm run test:backend` |
| **API smoke** | `scripts/smoke-week4.js` | After deploy / with `npm run dev` |
| **Manual UAT** | Tables below | Staging soft-launch, mobile + desktop |

**Pass criteria:** expected result matches; no 5xx; auth cookies set on login; ₦ amounts correct.

---

## 1. Authentication & roles

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| AUTH-01 | Customer register | `/auth/register` → valid name, email, password ≥8, confirm match | Redirect/dashboard; role customer |
| AUTH-02 | Register validation | Invalid email / short password / mismatch confirm | Error shown; no account |
| AUTH-03 | Duplicate email | Register same email twice | “Email already registered” |
| AUTH-04 | Customer login | `/auth/login` with valid credentials | JWT cookies; redirect by role |
| AUTH-05 | Bad credentials | Wrong password | Generic “Invalid credentials” |
| AUTH-06 | Logout | Click logout | Cookies cleared; protected routes redirect |
| AUTH-07 | Role guard — customer | Customer opens `/admin` | Blocked / redirect |
| AUTH-08 | Role guard — supplier | Unapproved supplier opens `/supplier` products | Blocked until approved |
| AUTH-09 | Checkout login modal | Guest checkout → prompted to login | Modal login; resume checkout after auth |

**Automated coverage:** `AppService` register/login/refresh/revoke · `auth.test.js`

---

## 2. Catalog & search

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| CAT-01 | Browse products | `/products` | Grid loads; ₦ prices; pagination if >12 |
| CAT-02 | Search | Type in search box | Debounced filter by name |
| CAT-03 | Category filter | Select category | List filters |
| CAT-04 | Product detail | Open `/products/[id]` | Name, price, stock, supplier, description |
| CAT-05 | Verified badge | Product from approved supplier | Verified indicator where applicable |
| CAT-06 | Mobile layout | `/products` on phone width | Hamburger nav; readable cards |

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

**Automated coverage:** `addCart`, `updateCart`, delivery slot merge, quantity validation

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

**Automated coverage:** mock initialize/verify/webhook in `AppService` specs

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

**Automated coverage:** supplier CRUD, stock, fulfillment transitions, approval flow

---

## 7. Admin

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| ADM-01 | Dashboard stats | `/admin` | Users, suppliers, products, orders counts |
| ADM-02 | Approve supplier | Pending list → approve | Supplier active; can add products |
| ADM-03 | Reject supplier | Reject with reason | Supplier inactive |
| ADM-04 | Users / products / orders | Admin tables | List + toggle active |
| ADM-05 | Contacts inbox | Submit contact form → admin tab | Message visible |

**Automated coverage:** supplier approval, contact submission

---

## 8. Public pages & FeedLog

| ID | Scenario | Steps | Expected |
|----|----------|-------|----------|
| PUB-01 | Home | `/` | Hero, featured, CTA |
| PUB-02 | About / Contact | Static pages | Render; contact persists |
| PUB-03 | Footer links | All footer links | Correct routes |
| PUB-04 | Feedback link (guest) | `NEXT_PUBLIC_FEEDLOG_URL` set | Nav + footer **Feedback** opens FeedLog portal |
| PUB-05 | Feedback SSO (logged in) | `FEEDLOG_SSO_SECRET` + FeedLog SSO secret match | **Feedback** → `/api/v1/feedback/sso` → FeedLog signed in |
| PUB-06 | No FeedLog URL | Env empty | Feedback links hidden |
| PUB-07 | Dashboard Feedback | Admin / supplier / customer logged in | Feedback entry points visible when URL set |

**Automated coverage:** `getFeedlogUrl()` · `getFeedlogFeedbackHref()` · `feedlog.util` JWT · contact smoke script

---

## 9. Staging go-live (ops)

| ID | Scenario | Expected |
|----|----------|----------|
| OPS-01 | `GET /api/v1/health` | `{ status: "ok" }` |
| OPS-02 | `npm run smoke:week4` against staging API | Pass |
| OPS-03 | ≥10 Paystack test transactions | All verify + webhook |
| OPS-04 | Mobile smoke customer → supplier → admin | Full journey on phone |

See also `docs/STAGING-GO-LIVE.md` (wiki mirror).

---

## Running automated tests

```bash
npm run test              # all unit tests
npm run test:coverage     # with coverage report
npm run test:backend      # compiled auth integration
npm run smoke:week4       # requires API on :3000
```

**CI:** `.github/workflows/ci.yml` runs build, typecheck, unit + backend tests on every push/PR.
