# DOVA — Reply: Paystack Setup & Minimum Order Value

**To:** Product / stakeholder  
**From:** Dozer  
**Date:** 23 July 2026  
**Re:** Paystack connection + Minimum Order Value (basket size)

---

Thanks — glad the documents were useful. Answers to both points below.

---

## 1. How do we connect Paystack?

Payment is already built into DOVA. Checkout can talk to Paystack once account keys are configured. Until then, the app uses a **local mock payment** (no real money charged), which is useful for demos.

### What we need from you

1. A **Paystack account** (start with **Test** mode, then Live).  
2. From the Paystack dashboard → **Settings → API Keys & Webhooks**:
   - **Secret Key** (test first)
   - **Public Key** (if the frontend payment UI needs it)
3. **Webhook URL** pointed at our API, for example:  
   `https://<your-api-host>/api/v1/payments/webhook`  
   Use the same secret so Paystack can notify us when a payment succeeds.
4. Confirm **currency = NGN**.

### What we do on our side

- Put the secret key in the server environment (`PAYSTACK_SECRET_KEY`).  
- Set currency (`PAYSTACK_CURRENCY=NGN`).  
- Register the webhook endpoint and verify signatures.  
- Run a few **test transactions** with you (card / transfer in Paystack test mode).

### Flow (simple)

1. Customer checks out → order is created.  
2. DOVA asks Paystack to start payment.  
3. Customer pays on Paystack.  
4. Paystack confirms (verify + webhook) → order marked **paid**.

If you share **test keys** or invite us to the Paystack workspace, we can connect it and walk through test payments together.

---

## 2. Minimum Order Value (basket size) — is it possible?

**Yes.**

We can enforce a minimum basket before checkout is allowed:

| Fulfillment type   | Minimum basket |
|--------------------|----------------|
| **Pickup**         | ₦3,000         |
| **Home delivery**  | ₦5,000         |

### Behaviour (implemented 24 July 2026)

- Cart / checkout checks the current basket total against the minimum for the selected option.  
- If below the minimum, checkout stays blocked and the customer sees something like:  
  **“Add ₦X more to qualify for checkout.”**  
  where **X** = minimum − current basket total.  
- When the basket reaches the minimum, checkout proceeds as normal (then Paystack).
- Checkout includes **Pickup** vs **Home delivery** choice; amounts above are enforced in shared helpers + API + DB.

**Status:** Built in MVP codebase (see `CHANGELOG` 0.3.0). Paystack still needs your **test keys** for live test txs.

---

## Summary

| Topic | Answer |
|-------|--------|
| Paystack | Already integrated in code; needs your Paystack **test keys** + webhook URL for staging proof |
| Min order value | **Done in code** — Pickup ₦3k / Delivery ₦5k + “Add ₦X more…” |
| Next from you | Share Paystack test access + staging host for go-live checks |

Happy to run staging smoke once keys and host are ready.
