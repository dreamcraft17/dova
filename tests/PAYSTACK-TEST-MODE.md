# Paystack Test Mode — DOVA

Use **test keys only** until go-live is approved. Paystack test and live use the same API; the key prefix decides the mode.

| Key | Mode |
|-----|------|
| `sk_test_...` / `pk_test_...` | **Test** — no real money |
| `sk_live_...` / `pk_live_...` | Live — real charges |

Docs: [Paystack Transaction API](https://paystack.com/docs/api/transaction/) · [Accept Payments](https://paystack.com/docs/payments/accept-payments/)

---

## 1. Get test keys

1. Log in to [Paystack Dashboard](https://dashboard.paystack.com)
2. Switch to **Test Mode** (toggle top-left)
3. **Settings → API Keys & Webhooks**
4. Copy:
   - **Secret Key** → `sk_test_...` (backend only, never commit)
   - **Public Key** → `pk_test_...` (optional; DOVA redirect flow uses secret on server)

---

## 2. Local development (real Paystack test checkout)

Copy the Paystack test template:

```bash
cp .env.paystack-test.example .env.paystack-test.local
# Edit .env.paystack-test.local — paste sk_test_... and pk_test_...
```

Then merge into your local env files:

**Backend** (`apps/backend/.env`):

```env
USE_IN_MEMORY=true
FRONTEND_URL=http://localhost:3002
PAYSTACK_SECRET_KEY=sk_test_YOUR_KEY_HERE
PAYSTACK_CURRENCY=NGN
PAYSTACK_CALLBACK_URL=http://localhost:3002/checkout/verify
```

**Frontend** (`apps/frontend/.env.local`):

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

Run:

```bash
npm run dev
```

Flow: checkout → Paystack **test** hosted page → redirect to `/checkout/verify?reference=...` → order **paid**.

### Test card (Paystack docs)

| Field | Value |
|-------|--------|
| Card | `4084 0840 8408 4081` |
| Expiry | Any future date |
| CVV | `408` |
| PIN | `0000` |
| OTP | `123456` |

---

## 3. Staging (`dova.dntech.id`)

**Backend (API host):**

```env
USE_IN_MEMORY=false
FRONTEND_URL=https://dova.dntech.id
CROSS_SITE_COOKIES=true
PAYSTACK_SECRET_KEY=sk_test_YOUR_KEY_HERE
PAYSTACK_CURRENCY=NGN
PAYSTACK_CALLBACK_URL=https://dova.dntech.id/checkout/verify
```

**Frontend (Vercel):**

```env
NEXT_PUBLIC_API_URL=https://YOUR_API_HOST/api/v1
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_YOUR_KEY_HERE
```

**Paystack Dashboard → Webhooks (test mode):**

```
POST https://YOUR_API_HOST/api/v1/payments/webhook
```

Enable event: `charge.success`

---

## 4. Mock vs Paystack test

| `PAYSTACK_SECRET_KEY` | Behaviour |
|-------------------------|-----------|
| Empty | **Mock** — skips Paystack, auto-success at `/checkout/verify` |
| `sk_test_...` | **Paystack test** — real test checkout UI |
| `sk_live_...` | Live — do **not** use until launch |

---

## 5. Verify it works

- [ ] Checkout redirects to `checkout.paystack.com` (not mock URL)
- [ ] After test card, land on `/checkout/verify` with success
- [ ] Order status **paid** in `/customer`
- [ ] (Optional) Webhook received — check Paystack dashboard → Webhooks → logs

Target before go-live: **≥10 successful test transactions** on staging (see `tests/GUIDE.md` OPS-03).

---

## 6. Switch to live (later)

1. Paystack Dashboard → Live mode → complete KYC
2. Replace `sk_test_` → `sk_live_`, `pk_test_` → `pk_live_`
3. Update webhook URL to production API
4. Re-run checkout smoke on staging first, then production

Do **not** mix test secret key with live public key.
