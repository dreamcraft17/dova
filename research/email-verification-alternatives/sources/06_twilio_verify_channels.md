# Source 06 — Twilio Verify channels

- URLs: https://www.twilio.com/docs/verify/api
- URLs: https://www.twilio.com/docs/verify/api/verification
- URLs: https://www.twilio.com/docs/verify/authentication-channels?display=embedded
- Type: primary / provider documentation
- Retrieved: 2026-10-09

## Verbatim evidence

Twilio Verify supports SMS, voice, WhatsApp, email, passkeys, TOTP, push, and other verification channels. The Verify API exposes start-verification and check-verification operations. The email channel requires additional configuration and the email integration uses Twilio SendGrid.

## Implication

Twilio Verify can replace DOVA's locally generated/stored OTP lifecycle with a managed verification lifecycle and provide SMS/WhatsApp fallback. It also increases vendor coupling and per-verification cost, and its email path still depends on SendGrid configuration. For DOVA, it is best treated as a later fallback or a channel expansion, not the first fix for Gmail limits.
