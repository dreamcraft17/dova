# DOVA — Environment Variables (Server Setup)

Panduan isi `.env` saat deploy / pindah server baru.

**Template mentah:** `tests/vps-backend.env.example`, `tests/vps-frontend.env.example`

---

## Lokasi file

| Service | Path di server |
|---------|----------------|
| Backend | `apps/backend/.env` |
| Frontend | `apps/frontend/.env.local` |
| Root (opsional) | `.env` — script migrate/seed juga baca file ini |

Script `scripts/load-env.js` membaca **root `.env`** lalu **`apps/backend/.env`** (yang belakangan override).

---

## Backend — `apps/backend/.env`

### Wajib

```env
NODE_ENV=production
PORT=4201

USE_IN_MEMORY=false
JWT_SECRET=GANTI_dengan_openssl_rand_hex_32
ADMIN_PASSWORD=admin1234
SUPPLIER_PASSWORD=supplier1234

DATABASE_URL=postgresql://dova:GANTI_DB_PASSWORD@127.0.0.1:5432/dova
# Supabase (pooler) — tambahkan ?sslmode=require di akhir URL
# DATABASE_URL=postgresql://postgres.PROJECT_REF:GANTI_PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres?sslmode=require

FRONTEND_URL=https://dova.dntech.id
CROSS_SITE_COOKIES=true

PAYSTACK_SECRET_KEY=sk_test_GANTI
PAYSTACK_CURRENCY=NGN
PAYSTACK_CALLBACK_URL=https://dova.dntech.id/checkout/verify
```

| Variable | Keterangan |
|----------|------------|
| `PORT` | Port internal API (PM2/nginx proxy ke sini). Sesuaikan dengan nginx config. |
| `JWT_SECRET` | Generate baru: `openssl rand -hex 32` |
| `DATABASE_URL` | Postgres di server baru (Supabase: pakai connection string + `?sslmode=require`) |
| `FRONTEND_URL` | URL publik storefront (tanpa trailing slash) |
| `CROSS_SITE_COOKIES` | `true` jika frontend & API beda subdomain/domain |
| `ADMIN_PASSWORD` / `SUPPLIER_PASSWORD` | Password akun demo; dipakai seed & bootstrap |
| `PAYSTACK_SECRET_KEY` | Secret key Paystack (test: `sk_test_...`, live: `sk_live_...`) |
| `PAYSTACK_CALLBACK_URL` | Halaman verify checkout di frontend |

### Opsional

```env
# Hanya jika Redis benar-benar jalan — kalau tidak ada, JANGAN set (backend fallback tanpa Redis)
# REDIS_URL=redis://127.0.0.1:6379

# PAYSTACK_CHANNELS=card,bank,ussd,bank_transfer
```

### Wajib untuk registrasi customer (production, sejak v0.5.4)

**Opsi B — Gmail (DOVA official):**

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=officialdovachain@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx
EMAIL_FROM=DOVA <officialdovachain@gmail.com>
SUPPORT_EMAIL=officialdovachain@gmail.com
```

`SMTP_PASS` = **App Password** Google (bukan password login). Buat di: Google Account → Security → 2-Step Verification ON → App passwords.

**Opsi A — Resend + domain (alternatif):**

```env
RESEND_API_KEY=re_GANTI
EMAIL_FROM=DOVA <noreply@dova.dntech.id>
SUPPORT_EMAIL=support@dova.dntech.id
```

Tanpa SMTP **atau** Resend + `EMAIL_FROM`, signup customer di production ditolak.

### Opsional — smoke QA otomatis

```env
DOVA_QA_FIXED_OTP=123456
```

Hanya untuk email pola `qa.softlaunch.*@example.com`. Set nilai yang sama saat menjalankan `SMOKE_OTP_CODE=123456 npm run smoke:production`.

### Generate secret

```bash
openssl rand -hex 32
```

---

## Frontend — `apps/frontend/.env.local`

### Wajib (VPS / self-hosted Next.js)

```env
NEXT_PUBLIC_API_URL=https://api.dova.dntech.id/api/v1
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_GANTI
```

| Variable | Keterangan |
|----------|------------|
| `NEXT_PUBLIC_API_URL` | Base URL API + `/api/v1` |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | Public key Paystack (pair dengan `PAYSTACK_SECRET_KEY`) |

> **Penting:** variabel `NEXT_PUBLIC_*` di-embed saat **`npm run build`**. Setelah ganti `.env.local`, wajib build ulang frontend.

### Deploy di Vercel

Set variabel yang sama di **Project Settings → Environment Variables** (bukan `.env.local` di VPS).

---

## Supabase PostgreSQL

Kalau DB pakai **Supabase** (bukan Postgres lokal di VPS):

1. Di Supabase Dashboard → **Settings → Database** → copy **Connection string** (mode **Transaction pooler**, port `5432`).
2. Paste ke `DATABASE_URL` di `apps/backend/.env`.
3. **Wajib** tambahkan SSL di akhir URL:

```env
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres?sslmode=require
```

4. Set `USE_IN_MEMORY=false`.
5. Jalankan migrate + seed **dari server** (atau lokal dengan env yang sama):

```bash
npm run db:migrate
npm run db:reset-logins
```

Password dengan karakter spesial (`!`, `@`, `#`) aman di file `.env` tanpa quote. Jangan commit file `.env` ke git.

**Keamanan:** jangan share connection string di chat/issue — rotate password di Supabase jika sudah terlanjur bocor.

---

Update di [Paystack Dashboard](https://dashboard.paystack.com):

| Setting | Nilai |
|---------|-------|
| **Webhook URL** | `POST https://api.dova.dntech.id/api/v1/payments/webhook` |
| **Event** | `charge.success` |
| **Callback** | Sudah di-handle via `PAYSTACK_CALLBACK_URL` / env backend |

Ganti `api.dova.dntech.id` jika hostname API berbeda.

---

## Setelah `.env` siap

Jalankan dari **root repo** (`~/dova` atau `/var/www/dntech/dova`), bukan dari `apps/backend` saja — package `dova-shared` harus di-build dulu.

```bash
cd ~/dova   # atau /var/www/dntech/dova

npm install
npm run db:migrate
npm run db:seed           # perbaiki image_url + data demo

# Build semua (shared → backend → frontend)
npm run build

pm2 restart dova-backend dova-frontend --update-env
```

Kalau build per-workspace:

```bash
npm run build -w dova-shared
npm run build -w dova-backend
npm run build -w dova-frontend
```

---

## Demo login (default)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@dova.local` | nilai `ADMIN_PASSWORD` (default `admin1234`) |
| Supplier | `supplier@dova.local` | nilai `SUPPLIER_PASSWORD` (default `supplier1234`) |

Reset password demo ke env:

```bash
npm run db:reset-logins
```

---

## Checklist pindah server

- [ ] Postgres baru + `DATABASE_URL`
- [ ] `JWT_SECRET` baru
- [ ] `FRONTEND_URL` & `NEXT_PUBLIC_API_URL` sesuai domain baru
- [ ] `PAYSTACK_CALLBACK_URL` + webhook Paystack di-update
- [ ] `REDIS_URL` dihapus jika server baru **tanpa** Redis
- [ ] DNS + SSL nginx untuk FE & API
- [ ] `npm run build` frontend setelah `.env.local` final
- [ ] `pm2 restart ... --update-env`
- [ ] Test: `/api/v1/health`, login admin, checkout Paystack test

---

## Contoh lengkap (staging dntech.id)

### `apps/backend/.env`

```env
NODE_ENV=production
PORT=4201

USE_IN_MEMORY=false
JWT_SECRET=a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456
ADMIN_PASSWORD=admin1234
SUPPLIER_PASSWORD=supplier1234

DATABASE_URL=postgresql://dova:STRONG_PASSWORD@127.0.0.1:5432/dova

FRONTEND_URL=https://dova.dntech.id
CROSS_SITE_COOKIES=true

PAYSTACK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXX
PAYSTACK_CURRENCY=NGN
PAYSTACK_CALLBACK_URL=https://dova.dntech.id/checkout/verify
```

### `apps/frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=https://api.dova.dntech.id/api/v1
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXXXX
```

**Jangan commit file `.env` / `.env.local` yang berisi secret ke git.**
