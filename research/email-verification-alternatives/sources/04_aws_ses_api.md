# Source 04 — Amazon SES API

- URLs: https://docs.aws.amazon.com/ses/latest/APIReference/API_SendEmail.html
- URLs: https://docs.aws.amazon.com/en_en/ses/latest/dg/quotas.html
- Type: primary / provider documentation
- Retrieved: 2026-10-09

## Verbatim evidence

SES `SendEmail` queues email through an API and requires a verified sender address or domain. In the sandbox, AWS says recipients must also be verified. AWS documents sandbox quotas of 200 emails per 24 hours and 1 email per second; production quotas vary by account and can be requested for increase.

## Implication

SES is a strong cost/scaling candidate if DOVA is already operating in AWS, but sandbox exit, IAM, domain verification, bounce handling, and reputation monitoring create more setup than Resend. It is not a magic bypass for limits.
