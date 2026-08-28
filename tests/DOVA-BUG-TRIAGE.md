# DOVA — Bug Triage (Semua Fitur)

> **Status:** Active · **Last updated:** 2026-08-28 · **Author:** Dozer  
> **Repo HEAD:** `8fb5b5e` · **Environment:** Production (`dova.dntech.id` / `api.dova.dntech.id`)  
> **Metode:** AI bug triage pipeline — fingerprint deterministik + klasifikasi + routing QA

Dokumen ini merangkum status triage **seluruh modul MVP DOVA**: coverage otomatis, gap manual UAT, fingerprint regression, dan backlog ticket yang perlu human approval sebelum dieksekusi.

**Dokumen terkait:** [TEST-CASES.md](./TEST-CASES.md) · [UAT-BUG-FIXES.md](./UAT-BUG-FIXES.md) · [DOVA-API-QA-POSTMAN.md](./DOVA-API-QA-POSTMAN.md) · [DOVA-RELEASE-READINESS-AUDIT.md](./DOVA-RELEASE-READINESS-AUDIT.md) · [GUIDE.md](./GUIDE.md)

---

## Summary

| Metrik | Nilai |
|--------|-------|
| Fitur MVP | **10 modul** · ~67 API routes |
| Unit tests | **146/146 pass** (`npm run test`, 2026-08-28) |
| Coverage global | **~52%** (target QA: 80%) |
| UAT bugs historis | **14 fixed** · **0 open P0/P1** |
| Production smoke (log terakhir) | **PASS** — 23+7 neg (2026-08-27); smoke script **28+10** (deploy + re-run pending) |
| Manual UAT belum jalan | **Admin (ADM-01–07)**, **Feedback (FEED-01–10)**, **Mobile ops (OPS-04)** |

**Verdict triage:** Core journey (register → OTP → cart → order → pay init → supplier → admin API) **stabil**. Risiko utama: **gap QA manual**, **smoke belum di-update di prod**, dan **ketergantungan env** (SMTP Gmail App Password, Paystack live).

---

## Production URLs

| Service | URL |
|---------|-----|
| Storefront | https://dova.dntech.id |
| API | https://api.dova.dntech.id/api/v1 |
| Health | https://api.dova.dntech.id/api/v1/health |

---

## Feature matrix — status triage

| Modul | Routes / pages | Auto test | Smoke | UAT manual | Status |
|-------|----------------|-----------|-------|------------|--------|
| **1. Auth & roles** | 10 API + 6 pages | ✅ Kuat | ✅ Partial | ✅ PASS | 🟢 Low risk |
| **2. Catalog** | 3 API + 2 pages | ✅ | ✅ | ✅ PASS | 🟢 Low risk |
| **3. Cart & slot** | 4 API + 1 page | ✅ + regressions | ✅ | ✅ PASS | 🟢 Low risk |
| **4. Checkout & min order** | 1 API + 2 pages | ✅ | ✅ | ✅ PASS | 🟢 Low risk |
| **5. Payments** | 5 API + verify page | ✅ mock + HMAC | ✅ init only | ⚠️ PAY-03 live | 🟡 Medium |
| **6. Supplier** | 11 API + 2 pages | ✅ CRUD/fulfillment | ✅ partial | ✅ PASS | 🟢 Low risk |
| **7. Admin** | 14 API + 1 page | ✅ incl. delete user | ✅ + DELETE | ❌ Not tested | 🟡 Medium |
| **8. Feedback board** | 13 API + 5 pages | ✅ 6 unit | ✅ GET only | ❌ Not tested | 🟡 Medium |
| **9. Public / contact** | 2 API + 4 pages | ✅ | ✅ | Partial | 🟢 Low risk |
| **10. Ops / health** | health, migrate, PM2 | ✅ env-guard | ✅ | ⚠️ OPS-04 mobile | 🟡 Medium |

---

## Component ownership (routing)

| Component | Path utama | Owner |
|-----------|------------|-------|
| Auth | `apps/backend/src/app.service.ts`, `apps/frontend/src/pages/auth/*` | Backend + Frontend |
| Commerce | cart, orders, payments | Backend |
| Supplier | `supplier.tsx`, `/suppliers/*` | Fullstack |
| Admin | `admin.tsx`, `AdminUserModal.tsx` | Fullstack |
| Feedback | `feedback.service.ts`, `pages/feedback/*` | Backend |
| Ops | VPS env, PM2, migrations | Dozer (deploy) |

---

## Per-modul — fingerprint & klasifikasi

### 1. Auth & roles

| Fingerprint | Anchor | Category | Severity | Status |
|-------------|--------|----------|----------|--------|
| `a1b2-auth-401-unverified` | Login sebelum verify OTP | Application (by design) | Minor | ✅ Expected |
| `c3d4-auth-smtp-535` | `[Mail] SMTP send failed: auth failed` | Environment | Major | ⚠️ Ops — Gmail App Password |
| `e5f6-auth-register-blocked` | Signup ditolak, email provider tidak configured | Environment | Critical | Guard prod OK |
| `g7h8-auth-forgot-nosmoke` | `/auth/forgot-password` tidak ada di smoke | Test gap | Minor | ✅ Fixed — smoke 24–26 |

**Regression:** BUG-002/003 (Bearer token), forgot/reset password unit tests ✅

---

### 2. Catalog & search

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `cat-001-meat-vegetables` | Chicken di filter Vegetables | ✅ Fixed BUG-001 |
| `cat-006-wrong-image` | Gambar Farm Milk salah | ✅ Fixed BUG-006 |
| `cat-500-invalid-uuid` | Invalid product id → 500 | ✅ Fixed PROD-01 → 404 |

---

### 3. Cart & delivery slot

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `cart-004-no-slot` | Add tanpa delivery slot | ✅ Fixed BUG-CART-004 |
| `cart-005-over-stock` | Qty > stock | ✅ Fixed BUG-CART-005 |
| `cart-011-badge-kg` | Badge cart hitung kg bukan line items | ✅ Fixed BUG-011 |

---

### 4. Checkout & minimum order

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `chk-007-dup-pkey` | `order_items_pkey` duplicate | ✅ Fixed BUG-007 |
| `chk-min-delivery-5000` | Checkout delivery < ₦5,000 | ✅ Tested |
| `chk-min-pickup-3000` | Checkout pickup < ₦3,000 | ✅ Tested |

---

### 5. Payments (Paystack)

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `pay-002-dup-ref` | Duplicate payment reference | — | ✅ Fixed |
| `pay-webhook-no-sig` | Webhook tanpa HMAC | Security | ✅ Rejected by design |
| `pay-live-card-unverified` | PAY-03 kartu live belum UAT | Test gap | **P1** |
| `pay-webhook-smoke-missing` | Webhook tidak di smoke script | Test gap | P2 |

---

### 6. Supplier portal

| Fingerprint | Issue | Status |
|-------------|-------|--------|
| `sup-008-all-products` | Lihat produk supplier lain | ✅ Fixed BUG-008 |
| `sup-003-deleted-visible` | Produk deleted masih tampil | ✅ Fixed |
| `sup-approve-42p08` | Postgres cast saat approve | ✅ Fixed BF-017 |

**Gap:** Multipart upload tidak di smoke production.

---

### 7. Admin panel

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `adm-not-uat` | ADM-01–07 belum manual UAT | Test gap | **P1** |
| `adm-delete-new` | DELETE user (`8fb5b5e`) | Needs smoke re-run | P0 setelah deploy |
| `adm-ui-no-rtl` | `AdminUserModal`, `admin.tsx` tanpa component test | Test gap | P2 |

**Smoke coverage (kode terbaru, belum verified di prod log):**

- DELETE pending user (no orders) → 200
- NEG-08: customer token → 403
- NEG-09: admin self-delete → 400

---

### 8. Feedback board (native)

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `feed-not-uat` | FEED-01–10 belum manual | Test gap | **P1** |
| `feed-smoke-get-only` | Smoke hanya `GET /feedback/posts` | Test gap | P2 |
| `feed-vote-dup` | Double vote | — | ✅ Unit tested |

---

### 9. Public & contact

| Fingerprint | Status |
|-------------|--------|
| `contact-persist` | ✅ Smoke POST + admin GET |
| `pub-mobile-layout` | ⚠️ OPS-04 belum | P2 |

---

### 10. Ops & infrastructure

| Fingerprint | Issue | Category | Priority |
|-------------|-------|----------|----------|
| `ops-smoke-stale` | Log smoke 23+7; kode 26+9 | Test gap | **P0** re-run |
| `ops-migration-007` | Password reset migration | Ops | ✅ jika sudah migrate |
| `ops-doc-drift` | TEST-CASES.md test count | Docs | Trivial | ✅ Fixed |

---

## Regression watch — dedup registry

Jika fingerprint match ticket yang sudah **closed**, **reopen sebagai regression** dan naikkan priority.

| Bug ID | Fingerprint prefix | Reopen jika |
|--------|-------------------|-------------|
| BUG-002/003 | `auth-401-cart-crossorigin` | Cart/add 401 padahal sudah login |
| BUG-007 | `checkout-order_items_pkey` | Duplicate key saat checkout |
| BUG-008 | `supplier-wrong-product-list` | Supplier lihat SKU orang lain |
| PROD-01 | `products-invalid-uuid-500` | `GET /products/not-uuid` → 500 |
| BF-017 | `supplier-approve-42P08` | Approve supplier error Postgres |

Historis lengkap: [UAT-BUG-FIXES.md](./UAT-BUG-FIXES.md)

---

## Open backlog — suggested tickets (human approval)

| ID | Title | Category | Severity | Priority | Action |
|----|-------|----------|----------|----------|--------|
| **TRI-001** | Re-run `smoke:production` setelah deploy `8fb5b5e` | Test gap | Major | **P0** | Run + simpan log |
| **TRI-002** | UAT Admin ADM-01–07 manual di production | Test gap | Major | **P1** | Checklist QA |
| **TRI-003** | UAT Feedback FEED-01–10 | Test gap | Major | **P1** | Checklist QA |
| **TRI-004** | Smoke: forgot-password + reset-password | Test gap | Minor | P2 | ✅ Done |
| **TRI-005** | Postman doc: `/auth/forgot-password`, `/auth/reset-password` | Docs | Trivial | P2 | ✅ Done |
| **TRI-006** | Paystack live card PAY-03 | Test gap | Major | P1 | 1× transaksi manual |
| **TRI-007** | Mobile smoke OPS-04 | Test gap | Minor | P2 | Browser phone |
| **TRI-008** | Playwright E2E checkout + admin (QA-GAP-05) | Test gap | Minor | P2 | Scaffold |
| **TRI-009** | Frontend page RTL tests | Test gap | Minor | P3 | AdminUserModal, checkout |
| **TRI-010** | Coverage 52% → 80% | Tech debt | Minor | P3 | Incremental |

### Bukan bug kode (ops / env)

| Issue | Remediation |
|-------|-------------|
| SMTP `535 BadCredentials` | Set `SMTP_PASS` = Gmail App Password 16 char (bukan password login) |
| User stuck pending register | Admin → Users → Delete account (shipped `5488101` / `8fb5b5e`) |
| Smoke OTP gagal | Set `DOVA_QA_FIXED_OTP` di server + `SMOKE_OTP_CODE` lokal — lihat [ENV-SETUP.md](./ENV-SETUP.md) |

---

## Smoke vs unit — gap map

| Endpoint group | Unit | Smoke | Manual UAT |
|----------------|------|-------|------------|
| Auth register / OTP / login | ✅ | ✅ | ✅ |
| Auth forgot / reset | ✅ | ✅ | ❌ |
| Cart / checkout / order | ✅ | ✅ | ✅ |
| Payment initialize | ✅ | ✅ | Partial |
| Payment webhook | ✅ | ❌ | ❌ |
| Supplier CRUD | ✅ | Partial | ✅ |
| Admin CRUD + delete | ✅ | ✅ (kode baru) | ❌ |
| Feedback full CRUD | ✅ | GET only | ❌ |

```
Automated well  ████████████░░░░░░░░  ~60%
Manual only     ░░░░░░░░░░░░████████  Admin UI, Feedback UI, Mobile
Not covered     ░░░░░░░░░░░░░░░░████  E2E browser, forgot-password smoke
```

---

## Severity × priority (referensi)

| Severity | Definisi | Contoh DOVA |
|----------|----------|-------------|
| **Critical** | Sistem unusable, data loss, no workaround | Payment semua gagal, signup blocked tanpa SMTP |
| **Major** | Core feature broken, workaround ada | Admin delete gagal, checkout error |
| **Minor** | Non-core, cosmetic + functional | Sort tidak persist, tooltip clip |
| **Trivial** | Cosmetic only | Typo label |

| Priority | SLA contoh |
|----------|------------|
| **P0** | Same day — blocks release/prod |
| **P1** | Sprint ini |
| **P2** | Sprint berikutnya |
| **P3** | Backlog |

---

## Immediate actions (P0–P1)

### P0 — Setelah deploy `8fb5b5e`

```bash
# Lokal (butuh OTP env)
SMOKE_OTP_CODE=123456 npm run smoke:production

# VPS deploy
cd ~/dova && git pull && npm ci && npm run build && pm2 restart dova-api dova-web --update-env
```

Log disimpan ke `tests/smoke-production-latest.log`.

### P1 — Manual UAT

| Modul | Test IDs | URL |
|-------|----------|-----|
| Admin | ADM-01–07 | https://dova.dntech.id/admin |
| Feedback | FEED-01–10 | https://dova.dntech.id/feedback |
| Payment live | PAY-03 | Checkout → Paystack test/live card |

Detail skenario: [TEST-CASES.md](./TEST-CASES.md)

---

## Menjalankan automated checks

```bash
npm run test              # 146 unit tests
npm run test:coverage     # coverage report (~52% global)
npm run smoke:production  # production API (butuh SMOKE_OTP_CODE)
npm run smoke:week4       # health + contact persist
```

Demo accounts: admin `admin@dova.local` / `admin1234` · supplier `supplier@dova.local` / `supplier1234`

---

## Changelog dokumen

| Date | Change |
|------|--------|
| 2026-08-28 | TRI-004/005 closed — forgot/reset smoke + Postman; TEST-CASES count 146 |
