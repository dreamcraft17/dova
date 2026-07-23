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

### Behaviour

- Cart / checkout checks the current basket total against the minimum for the selected option.  
- If below the minimum, checkout stays blocked and the customer sees something like:  
  **“Add ₦X more to qualify for checkout.”**  
  where **X** = minimum − current basket total.  
- When the basket reaches the minimum, checkout proceeds as normal (then Paystack).

### One product note

The current MVP checkout is mainly **delivery-style** (name, address, phone).  
To apply the **two different minimums** correctly, we should add a clear choice at checkout:

- **Pickup**, or  
- **Home delivery**

Then apply ₦3,000 or ₦5,000 accordingly. That is a straightforward addition.

Please confirm the amounts below are final, and we can include this in the next build:

- [ ] Pickup minimum = **₦3,000**  
- [ ] Home delivery minimum = **₦5,000**  
- [ ] Message copy: *“Add ₦X more to qualify for checkout.”* (or your preferred wording)

---

## Summary

| Topic | Answer |
|-------|--------|
| Paystack | Already integrated in code; needs your Paystack **test keys** + webhook URL to go live in test mode |
| Min order value | **Yes, possible** — Pickup ₦3k / Delivery ₦5k + “Add ₦X more…” message |
| Next from you | Share Paystack test access + confirm the minimums |

Happy to proceed on both once you confirm.
