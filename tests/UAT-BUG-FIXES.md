# DOVA — UAT Bug Report & Fixes

**Author:** Dozer (@dreamraft17)  
**Updated:** 21 August 2026  
**QA sources:** `Dova_Chain_Docs/*.xlsx`, `Bug 006.png`, `Bug 007.png`, `Bug 008.png`  
**Latest UAT sprint commit:** `d755a4c` — `Fix UAT bugs: cart badge, password toggle, cheap seed products`  
**Regression tests:** `shared/src/index.spec.ts`, `apps/backend/src/app.service.spec.ts`

---

## Summary

| Bug ID | UAT Module | Severity | Status | Commit |
|--------|------------|----------|--------|--------|
| BUG-001 | Catalog (Chicken category) | Medium | ✅ Fixed | `d0a5b7f` |
| BUG-002 | Cart — Unauthorized add | High | ✅ Fixed | `d0a5b7f` |
| BUG-003 | Cart — login loop on `/cart` | High | ✅ Fixed | `d0a5b7f` |
| BUG-CART-004 | Cart — CART-02 delivery slot | Medium | ✅ Fixed | `771b84f` |
| BUG-CART-005 | Cart — CART-05 stock limit | Medium | ✅ Fixed | `771b84f` |
| BUG-006 | Catalog — wrong product image | Medium | ✅ Fixed | `771b84f` |
| BUG-007 | Checkout — duplicate DB key | High | ✅ Fixed | `771b84f` |
| BUG-008 | Supplier — sees other suppliers' products | High | ✅ Fixed | `771b84f` |
| SUP-03 | Supplier — deleted product still visible | Medium | ✅ Fixed | `771b84f` |
| PAY-02 | Payment — reference idempotency | Medium | ✅ Fixed | `771b84f` |
| BUG-010 | Auth — password eye icon inverted | Minor | ✅ Fixed | `d755a4c` |
| BUG-011 | Cart — badge counts kg not line items | Major | ✅ Fixed | `d755a4c` |
| BUG-012 | Supplier register — password toggle CSS overlap | Minor | ✅ Fixed | `d755a4c` |
| BLOCKER | Catalog — no cheap products for min-order UAT | Major | ✅ Fixed | `d755a4c` |

**UAT PASS (no code defect):** AUTH-01–09, CAT-01–06, CART-01/03/04/06, CHK-01–06, PAY-01/03–05 (latest Excel version), SUP-01/02/04–07.

**Not yet tested by QA (not bugs):** Admin (ADM-01–05), Public/FeedLog (PUB-01–07), Staging Ops (OPS-01–04) — marked *Not Tested* in Excel.

---

## BUG-001 — Wrong Product Category

### Symptoms
- **Chicken Breast / Chicken Breasts** appeared under the **Vegetables** filter
- Should be in the **Meat** category

### Root cause
Staging PostgreSQL had the wrong `category_id`; in-memory seed data was correct but existing DB rows were not updated.

### Fix
- `scripts/seed.js` — update products matching `%chicken%breast%` → Meat
- `apps/backend/src/database.service.ts` — same bootstrap query on backend startup

### Verification
- [ ] **Meat** filter → Chicken appears
- [ ] **Vegetables** filter → Chicken does not appear

---

## BUG-002 — Add to Cart Unauthorized

### Symptoms
User logged in, clicked **Add to cart** → **Unauthorized** error

### Root cause
Frontend relied only on httpOnly cookies. On staging (`dova.dntech.id` ≠ `api.dova.dntech.id`), cookies were not sent cross-origin.

### Fix
- `apps/frontend/src/lib/auth-session.ts` — store tokens in `sessionStorage`
- `apps/frontend/src/lib/api.ts` — send `Authorization: Bearer`
- `apps/backend/src/app.controller.ts` — refresh/logout accept tokens from request body
- Env: `CROSS_SITE_COOKIES=true`

### Verification
- [ ] Login → add to cart → success, no 401

---

## BUG-003 — Cart Page Login Loop

### Symptoms
Header showed logged-in user, but `/cart` asked to log in again

### Root cause
Same as BUG-002 — `/auth/me` and `/cart` returned 401 because cookies did not cross origins

### Fix
Resolved by BUG-002 fix (Bearer token + `AuthContext`)

### Verification
- [ ] Login → open `/cart` → cart loads or shows empty, no redirect loop

---

## BUG-CART-004 — No Delivery Slot Validation Message (CART-02)

### Symptoms
User clicked **Add to cart** without selecting Morning/Evening → button did nothing, **no error message**

### Root cause
Button was `disabled` when no slot was selected, so `onClick` never fired and the toast never appeared.

### Fix
- `apps/frontend/src/pages/products/[id].tsx`
  - **Add to cart** button stays enabled
  - onClick validation: error toast + inline red text *"Please select a delivery slot"*
- `apps/backend/src/app.service.ts` — `addCart()` throws `BadRequestException` if slot is missing

### Verification
- [ ] Click Add to cart without a slot → error message appears (toast + on-page text)

---

## BUG-CART-005 — Quantity Over Stock With No Warning (CART-05)

### Symptoms
Stock 20 kg, user entered 22 kg → product "added to cart" at 20 kg **with no warning**

### Root cause
Frontend clamped quantity on `onBlur` without notifying the user; backend previously silent-capped with `Math.min()` when merging cart items.

### Fix
- **Frontend** (`products/[id].tsx`): validate before submit; **warning** toast when qty > stock; inline error message
- **Backend** (`app.service.ts`): reject qty > stock with `Only X kg available in stock` (no silent cap)

### Verification
- [ ] Enter 22 kg (stock 20) → clear error, not added silently
- [ ] Add 20+2 kg to the same line item → cumulative stock error

---

## BUG-006 — Wrong Product Image (Farm Milk)

### Symptoms
**Farm Milk** (Dairy) page showed a **vegetables** photo instead of milk

### Root cause
All seed products used a **single Unsplash URL** (produce market photo).

### Fix
- `shared/src/product-images.ts` — per-product image mapping + category fallbacks
- `scripts/seed.js` + `database.service.ts` bootstrap — update legacy `image_url` values
- `apps/backend/src/app.service.ts` — in-memory catalog uses `productImageUrl()`

### Verification
- [ ] Farm Milk → dairy/milk image
- [ ] Other products → images match their categories

---

## BUG-007 — Checkout Failed (`order_items_pkey` duplicate key)

### Symptoms
Click **Confirm Order** → DB error:  
`duplicate key value violates unique constraint "order_items_pkey"`

### Root cause
When creating an order, **cart_items** IDs were reused as **order_items** primary keys. A second order or retry caused UUID collisions.

### Fix
- `apps/backend/src/database.service.ts` — `INSERT INTO order_items` **without** cart ID; let DB generate a new UUID (`RETURNING id`)
- `apps/backend/src/app.service.ts` — user-friendly error if the constraint is still hit

### Verification
- [ ] Repeat checkout / multi-item orders → success, no duplicate key
- [ ] `curl https://api.dova.dntech.id/api/v1/health` → 200

---

## BUG-008 — Supplier Dashboard Showed All Products

### Symptoms
Supplier logged in → **Products** dashboard listed the entire marketplace, not just their own products

### Root cause
In-memory fallback to `this.products` (all demo catalog items) in DB mode; supplier endpoints lacked strict role guards.

### Fix
- `apps/backend/src/app.service.ts` — `supplierProducts()` reads DB only when `database.enabled`, no in-memory fallback
- `apps/backend/src/database.service.ts` — query filters by `supplier_id` + joins `supplier_profiles`
- `apps/backend/src/app.controller.ts` — all `/suppliers/*` routes require `supplier` role
- `apps/frontend/src/pages/supplier.tsx` — page restricted to `supplier` role only

### Verification
- [ ] Supplier A only sees Supplier A's products
- [ ] Supplier B does not see Supplier A's products

---

## SUP-03 — Deleted Product Still Visible on Supplier Dashboard (Hidden)

### Symptoms
After **Remove**, the item still appeared in the supplier table with **Hidden** status

### Root cause
Soft-delete (`is_active = false`) but `listSupplierProducts` did not filter by `is_active`.

### Fix
- `listSupplierProducts` → `WHERE p.is_active = TRUE`
- In-memory: `supplierProducts()` filters `p.isActive`

### Verification
- [ ] Delete product → removed from supplier list (not shown as Hidden)

---

## BUG-010 — Password Eye Icon Inverted

### Symptoms
- Password **visible** showed **EyeOff**; **hidden** showed **Eye**
- Affected login, register, checkout login modal, and supplier `PasswordInput`

### Root cause
Toggle logic used `visible ? EyeOff : Eye` — opposite of common UX convention.

### Fix
- `shared/src/index.ts` — `passwordToggleState()` (visible → Eye, hidden → EyeOff)
- Auth forms + `PasswordInput.tsx` use shared helper
- `shared/src/index.spec.ts` — regression test

### Verification
- [ ] Hidden password → EyeOff, `aria-label="Show password"`
- [ ] Visible password → Eye, `aria-label="Hide password"`

---

## BUG-011 — Cart Badge Shows Total kg, Not Line Items

### Symptoms
Adding 5 kg of one product showed cart badge **5** instead of **1**

### Root cause
`CartContext` summed `item.quantity` instead of counting distinct cart lines.

### Fix
- `shared/src/index.ts` — `cartBadgeCount(cart)` returns `items.length`
- `apps/frontend/src/context/CartContext.tsx` — uses `cartBadgeCount`
- `shared/src/index.spec.ts` — regression test

### Verification
- [ ] Add 5 kg of one product → header badge shows **1**
- [ ] Add second product → badge shows **2**

---

## BUG-012 — Password Toggle Overlaps Submit Button (Supplier Register)

### Symptoms
Password visibility button stretched full-width like the green submit button on supplier registration

### Root cause
CSS `.supplier-card button { width: 100% }` did not exclude `.password-toggle` class variants.

### Fix
- `apps/frontend/src/styles/globals.css` — exclude `.password-toggle-btn` and `.password-toggle` from submit button styles

### Verification
- [ ] `/auth/supplier-register` — eye button inside password field, not full-width

---

## BLOCKER — No Cheap Products for Minimum-Order UAT

### Symptoms
QA could not test pickup (₦3,000) or delivery (₦5,000) minimum thresholds; cheapest product was ₦17,000+

### Fix
- **UAT Sample Greens** — ₦1,500/kg (2 kg = pickup min)
- **UAT Sample Grain Pack** — ₦2,500/kg (2 kg = delivery min)
- `apps/backend/src/app.service.spec.ts` + `shared/src/index.spec.ts` — regression tests

### Verification
- [ ] 2 kg UAT Sample Greens → pickup checkout at ₦3,000
- [ ] 2 kg UAT Sample Grain Pack → delivery checkout at ₦5,000
- [ ] Run `npm run db:seed` on staging after deploy

---

## PAY-02 — Payment Reference Not Reused (Mock Idempotency)

### Symptoms
Initialize payment twice for the same order → QA could not confirm the same reference (especially after reload / in DB mode)

### Root cause
Reuse only checked in-memory `this.payments`; if the map was empty but `order.paymentReference` existed in DB, a new reference was created.

### Fix
- `apps/backend/src/app.service.ts` — `initializePayment()` repopulates cache from `order.paymentReference` and returns the same reference for `pending` orders

### Verification
- [ ] Pay → back → Pay again (same order) → identical `reference`

---

## Staging Deployment

```env
# apps/backend/.env
FRONTEND_URL=https://dova.dntech.id
CROSS_SITE_COOKIES=true
USE_IN_MEMORY=false
DATABASE_URL=postgresql://...
# REDIS_URL — optional; backend runs without Redis (commit df29ae3+)
PORT=4201
```

```bash
cd /var/www/dntech/dova
git pull
npm run build --workspace=dova-shared
npm run build --workspace=dova-backend
npm run build --workspace=dova-frontend
node scripts/seed.js          # fix chicken category + product images
pm2 restart dova-backend dova-frontend --update-env
```

---

## Automated Tests

```bash
npm test   # 92 tests pass (unit + backend auth)
```

---

## QA Reference Files

| File | Contents |
|------|----------|
| `Dova_Chain_Docs/1 Authentication.xlsx` | AUTH UAT + all module sheets |
| `Dova_Chain_Docs/2 Catalog and search.xlsx` | Full UAT workbook (same structure) |
| `Dova_Chain_Docs/3 Cart and delivery slot.xlsx` | CART-01–06, Bug report |
| `Dova_Chain_Docs/4 Checkout and Minimum Order.xlsx` | CHK + Payment + Supplier test results |
| `Dova_Chain_Docs/5 Payment.xlsx` | PAY-01–05 (Paystack test PASS in latest version) |
| `Dova_Chain_Docs/Bug 006.png` | Screenshot — wrong Farm Milk image |
| `Dova_Chain_Docs/Bug 007.png` | Screenshot — checkout duplicate key |
| `Dova_Chain_Docs/Bug 008.png` | Screenshot — supplier sees all products |
| `tests/GUIDE.md` | Manual QA guide |
| `tests/TEST-CASES.md` | Full test case list |
