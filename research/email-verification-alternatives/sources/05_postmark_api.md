# Source 05 — Postmark Email API

- URL: https://postmarkapp.com/developer/api/email-api
- Type: primary / provider documentation
- Retrieved: 2026-10-09

## Verbatim evidence

Postmark documents `POST /email` with JSON payload fields such as `From`, `To`, `Subject`, `TextBody`, and `HtmlBody`, authenticated by an `X-Postmark-Server-Token`. Its batch endpoint supports up to 500 messages per call.

## Implication

Postmark is a focused transactional-email API suitable for OTP and password reset. It requires a small adapter because its field names and authentication differ from Resend. It is worth considering when deliverability and transactional separation matter more than using an existing adapter.
