# DOVA — API Endpoint List for QA (Postman / Insomnia)

> **Status:** Active · **Last updated:** 2026-08-27 · **Author:** Dozer  
> **Base path:** `/api/v1` · **Source:** `apps/backend/src/app.controller.ts` (HEAD `fc177d6`)

This document is for **manual API testing** by QA — Postman, Insomnia, Bruno, or `curl`. For UI/UAT scenarios, see [TEST-CASES.md](./TEST-CASES.md).

---

## Environment

| Env | Base URL | Storefront |
|-----|----------|------------|
| **Staging** | `https://api.dova.dntech.id/api/v1` | https://dova.dntech.id |
| **Local** | `http://localhost:3000/api/v1` | http://localhost:3001 |

### Postman — recommended variables

| Variable | Example |
|----------|---------|
| `baseUrl` | `https://api.dova.dntech.id/api/v1` |
| `accessToken` | *(auto-fill after login)* |
| `refreshToken` | *(auto-fill after login)* |
| `orderId` | *(set after create order)* |
| `productId` | *(from GET /products)* |
| `supplierProfileId` | *(from GET /admin/suppliers/pending)* |

### Auth in Postman

Staging uses **separate subdomains** (frontend ≠ API). For API tests, use the **Bearer token** from the login response body — do not rely on cookies alone.

1. `POST {{baseUrl}}/auth/login` with JSON body (see § Auth).
2. Copy `accessToken` from the response → set `{{accessToken}}`.
3. Collection auth type: **Bearer Token** = `{{accessToken}}`.
4. Required header: `Content-Type: application/json` (except multipart).

**Demo accounts**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | `admin1234` |
| Supplier | `supplier@dova.local` | `supplier1234` |
| Customer | Register via API or UI | password ≥ 8 characters |

### Rate limits (auth)

| Group | Limit |
|-------|-------|
| `POST /auth/login`, `/auth/register` | 10 req / minute / IP |
| `POST /auth/refresh` | 20 req / minute / IP |

---

## Endpoint summary (67 routes)

| Group | Public | Customer | Supplier | Admin | Mixed auth |
|-------|--------|----------|----------|-------|------------|
| Count | 18 | 12 | 11 | 14 | 12 |

---

## 1. Health & config

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 1 | GET | `/health` | — | **P0** smoke |
| 2 | GET | `/payments/config` | — | P1 |
| 3 | GET | `/feedback/config` | — | P2 |

**Expected — GET `/health`**

```json
{ "status": "ok", "service": "dova-api" }
```

Status: **200**

---

## 2. Auth

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 4 | POST | `/auth/register` | — | P0 |
| 5 | POST | `/auth/login` | — | **P0** |
| 6 | POST | `/auth/logout` | Bearer / cookie | P1 |
| 7 | POST | `/auth/refresh` | refresh body/cookie | P1 |
| 8 | GET | `/auth/me` | Bearer | **P0** |

> OTP (`/auth/verify-otp`, `/auth/resend-otp`) is **disabled** in production — skip.

### Sample — POST `/auth/register`

```json
{
  "fullName": "QA Tester",
  "email": "qa.tester+001@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

| Case | Expected |
|------|----------|
| Valid | **201** — user object, no tokens (register only) |
| Duplicate email | **400** — Email already registered |
| Password < 8 | **400** validation error |

### Sample — POST `/auth/login`

```json
{
  "email": "admin@dova.local",
  "password": "admin1234",
  "rememberMe": true
}
```

| Case | Expected |
|------|----------|
| Valid admin | **201** — `{ user, accessToken, refreshToken }` |
| Wrong password | **401** — Invalid credentials |
| Inactive user | **401** — Invalid credentials |

**Postman test script (login):**

```javascript
if (pm.response.code === 201) {
  const j = pm.response.json();
  pm.environment.set('accessToken', j.accessToken);
  pm.environment.set('refreshToken', j.refreshToken);
}
```

### Sample — POST `/auth/refresh`

```json
{ "refreshToken": "{{refreshToken}}" }
```

Expected: **201** — new `accessToken` + `refreshToken`

### Sample — GET `/auth/me`

Header: `Authorization: Bearer {{accessToken}}`

Expected: **200** — user profile (role, email, isActive)

---

## 3. Catalog (public)

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 9 | GET | `/categories` | — | P0 |
| 10 | GET | `/products` | — | **P0** |
| 11 | GET | `/products/:id` | — | P0 |

**Query — GET `/products`**

| Param | Example |
|-------|---------|
| `search` | `rice` |
| `categoryId` | *(UUID from /categories)* |
| `page` | `1` |
| `limit` | `20` |

Expected: **200** — `{ data: [...], pagination: { page, limit, total } }`

---

## 4. Cart & orders (customer)

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 12 | GET | `/cart` | customer | P0 |
| 13 | POST | `/cart/add` | customer | **P0** |
| 14 | PUT | `/cart/items/:id` | customer | P1 |
| 15 | DELETE | `/cart/items/:id` | customer | P1 |
| 16 | POST | `/orders` | customer | **P0** |
| 17 | GET | `/orders` | customer | P0 |
| 18 | GET | `/orders/:id` | customer | P0 |

### Sample — POST `/cart/add`

```json
{
  "productId": "{{productId}}",
  "quantity": 2,
  "deliverySlot": "morning"
}
```

| Case | Expected |
|------|----------|
| Valid | **201** — cart updated |
| Missing delivery slot | **400** |
| Qty > stock | **400** |
| Non-customer token (admin) | **403** |

### Sample — POST `/orders`

```json
{
  "deliveryName": "QA Buyer",
  "deliveryAddress": "12 Test Street, Lagos",
  "deliveryPhone": "+2348012345678",
  "fulfillmentType": "delivery"
}
```

**Minimum order (NGN):** pickup **₦3,000** · delivery **₦5,000**

| Case | Expected |
|------|----------|
| Cart below minimum | **400** — “Add ₦X more…” |
| Valid delivery | **201** — order + `orderId` |
| Pickup | `fulfillmentType: "pickup"` — address optional |

---

## 5. Payments (customer + webhook)

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 19 | POST | `/payments/initialize` | customer | **P0** |
| 20 | GET | `/payments/verify?reference=` | customer | P0 |
| 21 | POST | `/payments/verify?reference=` | customer | P0 |
| 22 | POST | `/payments/webhook` | Paystack HMAC | P2 (ops) |

### Sample — POST `/payments/initialize`

```json
{
  "orderId": "{{orderId}}",
  "amount": 550000
}
```

> Amount is in **kobo** (₦5,500 = `550000`). Confirm against the order response.

| Case | Expected |
|------|----------|
| Valid + Paystack key set | **201** — authorization URL / reference |
| Mock mode (no secret) | **201** — mock reference |
| Order not owned by user | **403/404** |

**Webhook:** requires `x-paystack-signature` header — test via Paystack dashboard or skip in manual QA.

---

## 6. Supplier

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 23 | POST | `/suppliers/register` | — (multipart) | P1 |
| 24 | GET | `/suppliers/status` | supplier | P0 |
| 25 | GET | `/suppliers/products` | supplier | P0 |
| 26 | POST | `/suppliers/products` | supplier (multipart) | P1 |
| 27 | PUT | `/suppliers/products/:id` | supplier (multipart) | P1 |
| 28 | DELETE | `/suppliers/products/:id` | supplier | P1 |
| 29 | PUT | `/suppliers/products/:id/activate` | supplier | P1 |
| 30 | PUT | `/suppliers/products/:id/stock` | supplier | P1 |
| 31 | GET | `/suppliers/products/:id/stock-history` | supplier | P2 |
| 32 | GET | `/suppliers/orders` | supplier | P0 |
| 33 | PUT | `/suppliers/orders/:itemId/status` | supplier | P0 |

### Sample — POST `/suppliers/register` (form-data)

| Field | Value |
|-------|-------|
| `businessName` | QA Farm Ltd |
| `contactName` | QA Contact |
| `email` | `supplier.qa+001@example.com` |
| `password` | `password123` |
| `phone` | `+2348012345678` |
| `verificationDocs` | *(PDF/JPG/PNG file ≤ 5 MB)* |

Expected: **201** — `{ status: "pending", id }`

### Sample — PUT `/suppliers/orders/:itemId/status`

```json
{ "status": "processing" }
```

Allowed flow: `processing` → `shipped` → `delivered`

---

## 7. Admin

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 34 | GET | `/admin/dashboard` | admin | P0 |
| 35 | GET | `/admin/suppliers/pending` | admin | P0 |
| 36 | POST | `/admin/suppliers/:id/approve` | admin | **P0** |
| 37 | POST | `/admin/suppliers/:id/reject` | admin | P1 |
| 38 | GET | `/admin/users` | admin | P0 |
| 39 | GET | `/admin/users/:id` | admin | P1 |
| 40 | PUT | `/admin/users/:id` | admin | P1 |
| 41 | POST | `/admin/users/:id/reset-password` | admin | P1 |
| 42 | PUT | `/admin/users/:id/active` | admin | P1 |
| 43 | GET | `/admin/products` | admin | P0 |
| 44 | PUT | `/admin/products/:id/active` | admin | P1 |
| 45 | GET | `/admin/orders` | admin | P0 |
| 46 | GET | `/admin/contacts` | admin | P1 |

**Query — GET `/admin/orders`:** `status`, `search`

### Sample — POST `/admin/suppliers/:id/reject`

```json
{ "reason": "Document unclear — please re-upload CAC." }
```

### Sample — PUT `/admin/users/:id`

```json
{
  "fullName": "Updated Name",
  "email": "user@example.com",
  "phoneNumber": "+2348012345678",
  "role": "customer",
  "isActive": true
}
```

### Sample — PUT `/admin/users/:id/active`

```json
{ "active": false }
```

| Case | Expected |
|------|----------|
| Admin deactivates own account | **400** |
| Valid toggle | **200** |

### Sample — POST `/admin/users/:id/reset-password`

```json
{ "password": "newpassword123" }
```

---

## 8. Contact (public)

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 47 | POST | `/contact` | — | P1 |

```json
{
  "name": "QA Visitor",
  "email": "visitor@example.com",
  "message": "Testing contact form from Postman."
}
```

Expected: **201** — appears in `GET /admin/contacts`

---

## 9. Feedback board

| # | Method | Path | Auth | QA priority |
|---|--------|------|------|-------------|
| 48 | GET | `/feedback/posts` | — | P1 |
| 49 | GET | `/feedback/posts/:id` | — | P1 |
| 50 | GET | `/feedback/roadmap` | — | P2 |
| 51 | POST | `/feedback/posts` | optional | P1 |
| 52 | POST | `/feedback/posts/:id/vote` | login | P1 |
| 53 | PUT | `/feedback/posts/:id/status` | admin | P1 |
| 54 | GET | `/feedback/posts/:id/comments` | — | P2 |
| 55 | POST | `/feedback/posts/:id/comments` | optional | P2 |
| 56 | POST | `/feedback/posts/:id/official-reply` | admin | P2 |
| 57 | GET | `/feedback/changelog` | — | P2 |
| 58 | GET | `/feedback/changelog/:slug` | — | P2 |
| 59 | POST | `/feedback/changelog` | admin | P2 |

**Query — GET `/feedback/posts`:** `sort=votes|new`, `search=`

### Sample — POST `/feedback/posts`

```json
{
  "title": "Bulk order discount",
  "description": "Would love tiered pricing for orders above ₦50,000.",
  "authorName": "QA User",
  "authorEmail": "qa@example.com"
}
```

### Sample — PUT `/feedback/posts/:id/status`

```json
{ "status": "planned" }
```

Values: `open` | `planned` | `in_progress` | `done`

---

## Smoke test order (QA — ~30 min)

Run in sequence; save IDs to environment variables.

```
1.  GET  /health
2.  POST /auth/login          (admin) → save tokens
3.  GET  /auth/me
4.  GET  /categories
5.  GET  /products            → save productId
6.  POST /auth/register       (new customer) → login as customer
7.  POST /cart/add
8.  GET  /cart
9.  POST /orders              → save orderId
10. POST /payments/initialize
11. GET  /orders
12. POST /auth/login          (supplier)
13. GET  /suppliers/products
14. GET  /suppliers/orders
15. POST /auth/login          (admin)
16. GET  /admin/dashboard
17. GET  /admin/suppliers/pending → approve if any pending
18. GET  /admin/users
19. GET  /admin/orders
20. POST /contact
21. GET  /admin/contacts
22. GET  /feedback/posts
23. POST /auth/logout
```

---

## Negative test checklist

| ID | Request | Expected |
|----|---------|----------|
| NEG-01 | GET `/admin/dashboard` with customer token | **403** |
| NEG-02 | GET `/cart` without token | **401** |
| NEG-03 | POST `/cart/add` qty = 0 | **400** |
| NEG-04 | GET `/products/not-a-uuid` | **404** |
| NEG-05 | POST `/auth/login` wrong password | **401** |
| NEG-06 | GET `/auth/me` expired / invalid token | **401** |
| NEG-07 | POST `/orders` with empty cart | **400** |

---

## Quick curl (copy-paste)

```bash
BASE=https://api.dova.dntech.id/api/v1

# Health
curl -s "$BASE/health"

# Login + save token (jq)
TOKEN=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@dova.local","password":"admin1234","rememberMe":true}' \
  | jq -r '.accessToken')

curl -s -H "Authorization: Bearer $TOKEN" "$BASE/auth/me"
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/admin/dashboard"
```

---

## References

| Doc | Path |
|-----|------|
| API summary (wiki) | `dova-company-wiki/docs/API.md` |
| UI test cases | [TEST-CASES.md](./TEST-CASES.md) |
| QA workflow | [GUIDE.md](./GUIDE.md) |
| Paystack test mode | [PAYSTACK-TEST-MODE.md](./PAYSTACK-TEST-MODE.md) |
| Deploy / env | [ENV-SETUP.md](./ENV-SETUP.md) |

---

*DOVA — Building a better food supply network from Nigerian farmers to consumers.*
