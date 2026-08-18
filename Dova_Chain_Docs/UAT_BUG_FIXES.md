# DOVA — UAT Bug Report & Fixes

**Author:** Dozer (@dreamraft17)  
**Updated:** 17 Agustus 2026  
**Sumber QA:** `Dova_Chain_Docs/*.xlsx`, `Bug 006.png`, `Bug 007.png`, `Bug 008.png`  
**Commit terakhir (UAT sprint):** `771b84f` — `Fix UAT bugs: cart validation, checkout, supplier catalog, and images`

---

## Ringkasan

| Bug ID | Modul UAT | Severity | Status | Commit |
|--------|-----------|----------|--------|--------|
| BUG-001 | Catalog (Chicken category) | Medium | ✅ Fixed | `d0a5b7f` |
| BUG-002 | Cart — Unauthorized add | High | ✅ Fixed | `d0a5b7f` |
| BUG-003 | Cart — login loop di `/cart` | High | ✅ Fixed | `d0a5b7f` |
| BUG-CART-004 | Cart — CART-02 delivery slot | Medium | ✅ Fixed | `771b84f` |
| BUG-CART-005 | Cart — CART-05 stock limit | Medium | ✅ Fixed | `771b84f` |
| BUG-006 | Catalog — gambar produk salah | Medium | ✅ Fixed | `771b84f` |
| BUG-007 | Checkout — duplicate key DB | High | ✅ Fixed | `771b84f` |
| BUG-008 | Supplier — lihat produk orang lain | High | ✅ Fixed | `771b84f` |
| SUP-03 | Supplier — delete masih tampil | Medium | ✅ Fixed | `771b84f` |
| PAY-02 | Payment — idempotency reference | Medium | ✅ Fixed | `771b84f` |

**UAT PASS (tidak ada defect code):** AUTH-01–09, CAT-01–06, CART-01/03/04/06, CHK-01–06, PAY-01/03–05 (versi Excel terbaru), SUP-01/02/04–07.

**Belum di-test QA (bukan bug):** Admin (ADM-01–05), Public/FeedLog (PUB-01–07), Staging Ops (OPS-01–04) — status *Not Tested* di Excel.

---

## BUG-001 — Kategori Produk Salah

### Gejala
- **Chicken Breast / Chicken Breasts** muncul di filter **Vegetables**
- Seharusnya di kategori **Meat**

### Root cause
Data PostgreSQL staging punya `category_id` salah; seed in-memory sudah benar tapi data lama belum diperbaiki.

### Fix
- `scripts/seed.js` — update produk `%chicken%breast%` → Meat
- `apps/backend/src/database.service.ts` — bootstrap query yang sama saat backend start

### Verifikasi
- [ ] Filter **Meat** → Chicken muncul
- [ ] Filter **Vegetables** → Chicken tidak muncul

---

## BUG-002 — Add to Cart Unauthorized

### Gejala
User sudah login, klik **Add to cart** → error **Unauthorized**

### Root cause
Frontend hanya pakai httpOnly cookie. Di staging (`dova.dntech.id` ≠ `api.dova.dntech.id`), cookie tidak terkirim cross-origin.

### Fix
- `apps/frontend/src/lib/auth-session.ts` — simpan token di `sessionStorage`
- `apps/frontend/src/lib/api.ts` — kirim `Authorization: Bearer`
- `apps/backend/src/app.controller.ts` — refresh/logout terima token dari body
- Env: `CROSS_SITE_COOKIES=true`

### Verifikasi
- [ ] Login → add to cart → sukses, tidak 401

---

## BUG-003 — Cart Page Login Loop

### Gejala
Header menampilkan user login, tapi `/cart` minta login lagi

### Root cause
Sama dengan BUG-002 — `/auth/me` dan `/cart` return 401 karena cookie tidak cross-origin

### Fix
Teratasi oleh fix BUG-002 (Bearer token + `AuthContext`)

### Verifikasi
- [ ] Login → buka `/cart` → cart tampil atau kosong, tanpa redirect loop

---

## BUG-CART-004 — Tidak Ada Pesan Validasi Delivery Slot (CART-02)

### Gejala
User klik **Add to cart** tanpa memilih Morning/Evening → tombol tidak bereaksi, **tidak ada pesan error**

### Root cause
Tombol `disabled` saat slot belum dipilih, sehingga `onClick` tidak jalan dan toast tidak pernah muncul.

### Fix
- `apps/frontend/src/pages/products/[id].tsx`
  - Tombol Add to cart **tetap aktif**
  - Validasi onClick: toast error + pesan inline merah *"Please select a delivery slot"*
- `apps/backend/src/app.service.ts` — `addCart()` throw `BadRequestException` jika slot kosong

### Verifikasi
- [ ] Klik Add to cart tanpa slot → muncul pesan error (toast + teks di halaman)

---

## BUG-CART-005 — Qty Melebihi Stok Tanpa Peringatan (CART-05)

### Gejala
Stok 20 kg, user input 22 kg → produk "masuk cart" dengan qty 20 kg **tanpa peringatan**

### Root cause
Frontend clamp qty di `onBlur` tanpa memberitahu user; backend pernah silent-cap dengan `Math.min()` saat merge cart item.

### Fix
- **Frontend** (`products/[id].tsx`): validasi sebelum submit; toast **warning** saat qty > stok; pesan inline error
- **Backend** (`app.service.ts`): tolak qty > stok dengan pesan `Only X kg available in stock` (tidak silent-cap)

### Verifikasi
- [ ] Input 22 kg (stok 20) → error jelas, tidak add silently
- [ ] Add 20+2 kg ke item yang sama → error cumulative stock

---

## BUG-006 — Gambar Produk Salah (Farm Milk)

### Gejala
Halaman **Farm Milk** (Dairy) menampilkan foto **sayuran**, bukan susu

### Root cause
Semua produk seed memakai **satu URL Unsplash** (foto produce market).

### Fix
- `shared/src/product-images.ts` — mapping gambar per produk + fallback per kategori
- `scripts/seed.js` + `database.service.ts` bootstrap — update `image_url` lama
- `apps/backend/src/app.service.ts` — in-memory catalog pakai `productImageUrl()`

### Verifikasi
- [ ] Farm Milk → gambar dairy/susu
- [ ] Produk lain → gambar sesuai kategori

---

## BUG-007 — Checkout Gagal (duplicate key `order_items_pkey`)

### Gejala
Klik **Confirm Order** → error DB:  
`duplicate key value violates unique constraint "order_items_pkey"`

### Root cause
Saat buat order, ID **cart_items** dipakai ulang sebagai primary key **order_items**. Order kedua / retry → bentrok UUID.

### Fix
- `apps/backend/src/database.service.ts` — `INSERT INTO order_items` **tanpa** ID cart; biarkan DB generate UUID baru (`RETURNING id`)
- `apps/backend/src/app.service.ts` — pesan error user-friendly jika constraint masih terpicu

### Verifikasi
- [ ] Checkout berulang / multi-item → order sukses, tidak duplicate key
- [ ] `curl https://api.dova.dntech.id/api/v1/health` → 200

---

## BUG-008 — Supplier Dashboard Tampilkan Semua Produk

### Gejala
Supplier login → dashboard **Products** menampilkan katalog seluruh marketplace, bukan milik supplier sendiri

### Root cause
Fallback in-memory ke `this.products` (semua produk demo) saat mode DB; endpoint supplier tanpa role guard ketat.

### Fix
- `apps/backend/src/app.service.ts` — `supplierProducts()` hanya baca DB saat `database.enabled`, tanpa fallback in-memory
- `apps/backend/src/database.service.ts` — query filter `supplier_id` + join `supplier_profiles`
- `apps/backend/src/app.controller.ts` — semua route `/suppliers/*` wajib role `supplier`
- `apps/frontend/src/pages/supplier.tsx` — halaman hanya untuk role `supplier`

### Verifikasi
- [ ] Supplier A hanya lihat produk Supplier A
- [ ] Supplier B tidak lihat produk Supplier A

---

## SUP-03 — Produk Deleted Masih Tampil di Supplier (Hidden)

### Gejala
Setelah **Remove** produk, item masih ada di tabel supplier dengan status **Hidden**

### Root cause
Soft-delete (`is_active = false`) tapi `listSupplierProducts` tidak filter `is_active`.

### Fix
- `listSupplierProducts` → `WHERE p.is_active = TRUE`
- In-memory: `supplierProducts()` filter `p.isActive`

### Verifikasi
- [ ] Delete produk → hilang dari daftar supplier (bukan status Hidden)

---

## PAY-02 — Payment Reference Tidak Reused (Mock Idempotency)

### Gejala
Initialize payment 2× untuk order yang sama → QA tidak bisa verifikasi reference sama (terutama setelah reload / DB mode)

### Root cause
Reuse hanya cek `this.payments` in-memory; jika map kosong tapi `order.paymentReference` ada di DB, reference baru dibuat.

### Fix
- `apps/backend/src/app.service.ts` — `initializePayment()` repopulate cache dari `order.paymentReference` dan return reference yang sama untuk order `pending`

### Verifikasi
- [ ] Pay → back → Pay lagi (order sama) → `reference` identik

---

## Deployment Staging

```env
# apps/backend/.env
FRONTEND_URL=https://dova.dntech.id
CROSS_SITE_COOKIES=true
USE_IN_MEMORY=false
DATABASE_URL=postgresql://...
# REDIS_URL — opsional; backend tetap jalan tanpa Redis (commit df29ae3+)
PORT=4201
```

```bash
cd /var/www/dntech/dova
git pull
npm run build --workspace=dova-shared
npm run build --workspace=dova-backend
npm run build --workspace=dova-frontend
node scripts/seed.js          # perbaiki kategori chicken + gambar produk
pm2 restart dova-backend dova-frontend --update-env
```

---

## Test Otomatis

```bash
npm test   # 79 tests pass (unit + backend auth)
```

---

## Referensi File QA

| File | Isi |
|------|-----|
| `Dova_Chain_Docs/1 Authentication.xlsx` | AUTH UAT + semua sheet modul |
| `Dova_Chain_Docs/2 Catalog and search.xlsx` | Workbook UAT lengkap (sama struktur) |
| `Dova_Chain_Docs/3 Cart and delivery slot.xlsx` | CART-01–06, Bug report |
| `Dova_Chain_Docs/4 Checkout and Minimum Order.xlsx` | CHK + Payment + Supplier hasil test |
| `Dova_Chain_Docs/5 Payment.xlsx` | PAY-01–05 (Paystack test PASS versi terbaru) |
| `Dova_Chain_Docs/Bug 006.png` | Screenshot gambar Farm Milk salah |
| `Dova_Chain_Docs/Bug 007.png` | Screenshot checkout duplicate key |
| `Dova_Chain_Docs/Bug 008.png` | Screenshot supplier lihat semua produk |
| `tests/GUIDE.md` | Panduan QA manual |
| `tests/TEST-CASES.md` | Test case lengkap |
