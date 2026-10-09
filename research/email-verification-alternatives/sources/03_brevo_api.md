# Source 03 — Brevo transactional email API

- URLs: https://developers.brevo.com/reference/send-transac-email
- URLs: https://developers.brevo.com/docs/api-limits
- Type: primary / provider documentation
- Retrieved: 2026-10-09

## Verbatim evidence

Brevo documents a transactional email endpoint at `POST /v3/smtp/email` authenticated with an `api-key` header or OAuth bearer token. The API documentation says a request can send inline HTML or use a template. Its rate-limit documentation states the endpoint has a dedicated limit and returns HTTP `429` when a limit is exceeded.

## Implication

Brevo is a viable HTTP API alternative and also exposes SMS/WhatsApp APIs, but DOVA needs a new adapter and provider-specific error handling. The endpoint name contains `smtp`, but the integration is HTTP API-based; this is not a Gmail SMTP connection. Confirm account-level sending quotas and domain/sender setup before production.
