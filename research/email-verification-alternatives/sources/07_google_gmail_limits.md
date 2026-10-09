# Source 07 — Gmail sending limits

- URLs: https://support.google.com/mail/answer/22839?hl=en
- URLs: https://support.google.com/mail/answer/81126?hl=en
- Type: primary / Google documentation
- Retrieved: 2026-10-09

## Verbatim evidence

Google says Gmail limits the number of emails and recipients per day to prevent spam and protect accounts. Its help page gives the common personal Gmail trigger as more than 500 recipients in one email or more than 500 emails in a day, with sending normally available again within 1–24 hours. Google also requires authentication practices such as SPF/DKIM and TLS for senders and recommends gradual volume increases and monitoring reputation.

## Implication

Using a Gmail mailbox as DOVA's transactional sender is the wrong abstraction. The fix should be a transactional email API with a verified DOVA sending domain, not another Gmail account.
