# Source 02 — Resend API and pricing

- URL: https://resend.com/features/email-api
- URL: https://resend.com/pricing
- Type: primary / provider documentation
- Retrieved: 2026-10-09

## Verbatim evidence

Resend describes itself as an email API and publishes an API-based send flow. Its current pricing page lists a Free plan with 3,000 transactional emails/month and a 100-email/day limit, and a Pro plan with 50,000 emails/month and no daily email limit.

## Implication

Resend removes the Gmail SMTP dependency, but does not remove provider quotas. It is the lowest-code option for DOVA because the adapter already exists. The daily cap must be compared against expected OTP volume, including resend attempts and password resets.
