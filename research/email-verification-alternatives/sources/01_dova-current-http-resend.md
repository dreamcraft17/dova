# Source 01 — Implementasi DOVA saat ini

- Type: primary / local code
- File: `apps/backend/src/mail.util.ts`
- Relevance: menentukan opsi migrasi paling kecil

## Evidence

`isEmailProviderConfigured()` menganggap provider siap jika `EMAIL_FROM` tersedia dan salah satu dari SMTP lengkap atau `RESEND_API_KEY` tersedia.

`sendViaResend()` mengirim `POST https://api.resend.com/emails` dengan `Authorization: Bearer <RESEND_API_KEY>` dan JSON `from`, `to`, `subject`, `text`, `html`, serta `reply_to`.

`sendEmail()` memilih SMTP hanya jika `usesSmtp()` true; jika tidak, ia memilih Resend.

## Implication

DOVA sudah memiliki adapter HTTP Resend. Menghapus/menonaktifkan `SMTP_HOST`, `SMTP_USER`, dan `SMTP_PASS`, lalu mengisi `RESEND_API_KEY` + `EMAIL_FROM`, cukup untuk menguji jalur non-SMTP tanpa rewrite registration flow.
