# DOVA API (MVP)

Base URL: `{API}/api/v1` (local default `http://localhost:3000/api/v1`)

Auth: HTTP-only cookies `accessToken` / `refreshToken` (credentials: include).

## Public

| Method | Path | Notes |
|--------|------|-------|
| GET | `/health` | Liveness |
| POST | `/auth/register` | Customer |
| POST | `/auth/login` | Sets cookies |
| POST | `/auth/logout` | Clears cookies |
| POST | `/auth/refresh` | Refresh access |
| GET | `/auth/me` | Current user |
| GET | `/categories` | |
| GET | `/products` | `search`, `categoryId`, `page`, `limit` |
| GET | `/products/:id` | |
| POST | `/contact` | `{ name, email, message }` → stored |
| POST | `/suppliers/register` | multipart + `verificationDocs` |

## Customer

| Method | Path |
|--------|------|
| GET/POST/PUT/DELETE | `/cart`, `/cart/add`, `/cart/items/:id` |
| POST | `/orders` — body includes `fulfillmentType`: `pickup` \| `delivery` |
| GET | `/orders`, `/orders/:id` |
| POST | `/payments/initialize` |
| GET/POST | `/payments/verify` |
| POST | `/payments/webhook` | Paystack |

**Minimum order (NGN):** pickup **3000**, delivery **5000**. Under minimum → `400` with “Add ₦X more…”.

## Supplier

| Method | Path |
|--------|------|
| GET | `/suppliers/status` |
| GET/POST/PUT/DELETE | `/suppliers/products` — POST/PUT accept multipart `image` |
| PUT | `/suppliers/products/:id/stock` |
| GET | `/suppliers/orders` |
| PUT | `/suppliers/orders/:itemId/status` |

## Admin

| Method | Path |
|--------|------|
| GET | `/admin/dashboard` |
| GET/POST | `/admin/suppliers/pending`, `…/approve`, `…/reject` |
| GET/PUT | `/admin/users`, `…/active` |
| GET/PUT | `/admin/products`, `…/active` |
| GET | `/admin/orders` |
| GET | `/admin/contacts` | Contact form inbox |
