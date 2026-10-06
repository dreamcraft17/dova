# Dova Engineering Health Report

> **Status:** Active · **Date:** 2026-09-05 (updated) · **Author:** Dozer

## Summary

Snapshot lintas empat area — bug triage, kualitas test, riwayat rilis, dan review kode — untuk basis kode `dova` pada HEAD (35 commit di atas tag `v0.5.3`), plus status penyelesaian dari rekomendasi High-priority (lihat [Update — Rekomendasi High selesai](#update--rekomendasi-high-selesai-2026-09-05) di bawah).

- **Baseline bersih:** seluruh test suite dan typecheck backend/frontend PASS; tidak ada bug aktif untuk ditriase saat ini.
- **Gap uji terbesar sudah ditutup:** `createOrderFromCart`/`adjustStock` di `database.service.spec.ts` dan `assertExternalImageUrl`/cabang lain di `file-validation.spec.ts` kini punya test DB-layer dan boundary-case penuh — lihat update di bawah.
- **`AppService` (127 method) sudah dipecah** menjadi 8 service domain (Auth, Catalog, Cart, Order, OrderPayment, Supplier, Admin, Contact) via facade pattern — lihat update di bawah. `AppController` (23 method) masih belum dipecah.
- **Tidak ada temuan keamanan nyata** dari code reviewer — semua flag "critical" (hardcoded secret, SQL concatenation) dan finding "high" (blocking async call) adalah false positive dari tooling, sudah diverifikasi manual (lihat detail di bawah).
- Siap rilis **v0.6.0** (minor bump) begitu draft changelog di bawah disetujui.

---

## 1. Bug Triage (`ai-bug-triage`)

Sumber: `npm run test:unit` (25 suite, 183 test) dan `npm run typecheck -w apps/backend` / `-w apps/frontend` dijalankan di HEAD.

| Check | Hasil |
|---|---|
| Unit test suite | 25/25 suite PASS, 183/183 test PASS |
| Typecheck backend | PASS (exit 0) |
| Typecheck frontend | PASS (exit 0) |

**Kesimpulan:** tidak ada failure untuk difingerprint, diklasifikasi, atau dibuatkan tiket saat ini. Pipeline triage tidak punya input untuk diproses — jalankan ulang skill ini setelah ada kegagalan CI atau laporan bug baru.

---

## 2. QA Review — Kualitas Test (`ai-qa-review`)

Batch audit membaca penuh 14 dari 25 file spec (56%), diprioritaskan pada file terbesar dan area sensitif uang/keamanan: auth, payment, upload file, dan mail.

### Smell sistemik

1. **Coverage timpang parah di file paling berisiko.** `database.service.ts` (572 baris, ~60 method uang/stok) hanya diuji ~9 method di `database.service.spec.ts`. `createOrderFromCart` (guard stok & minimum order, `FOR UPDATE` locking) dan `adjustStock` (decrement dengan guard `stock_quantity+$1>=0`) **tidak punya test langsung di layer DB**.
2. **Happy-path-only pada validasi file/URL yang security-relevant.** `file-validation.spec.ts` tidak menguji `assertExternalImageUrl` (boundary SSRF-adjacent), cabang default-throw `extensionForMime`, cabang empty-buffer, dan deteksi WEBP. `upload-storage.service.spec.ts` hanya 1 test happy-path — jalur penolakan file invalid sebelum ditulis ke disk tidak diuji.
3. **Duplikasi setup manual.** `app.service.spec.ts` punya ~10 blok try/finally hampir identik untuk save/restore `PAYSTACK_SECRET_KEY` (baris 504-626, 920-1021) — butuh factory `withEnv()`.
4. **Password default lemah hardcoded di source** (`admin1234` / `supplier1234` fallback di bootstrap `database.service.ts`) tidak diuji maupun di-guard oleh `env-guard.ts`.
5. **Boundary/negative testing tipis pada aritmatika uang & idempotency webhook.** `paystack.service.spec.ts` tidak menguji `amountToSubunit` untuk rounding pecahan, `parseMetadata` dengan JSON malformed, atau cabang fallback `channelLabel`.

**Reliability dimension bersih** di seluruh sampel: tidak ada sleep-based wait, tidak ada order dependency, semua external service di-mock pada boundary.

**Gate otomatis yang disarankan:** ambang Stryker mutation-testing (mis. minimum 70%) khusus untuk file kritikal uang/keamanan — `database.service.ts`, `paystack.service.ts`, `file-validation.ts`, `app.service.ts` — dijalankan sebagai CI job terpisah yang lebih lambat, bukan di tiap PR.

### Temuan per file

| File | Severity | Temuan | Fix yang disarankan |
|---|---|---|---|
| `database.service.spec.ts` | **High** | Tidak ada test DB-layer untuk `createOrderFromCart`, `adjustStock`, `updateSupplierOrderStatus`, `listProducts`, `bootstrap` | Tambah test stok-exceeded, min-order shortfall, concurrent decrement; extract shared `makePool()` fixture |
| `file-validation.spec.ts` | **High** | `assertExternalImageUrl` nol test (SSRF-adjacent) | `it.each` untuk empty buffer, WEBP accept, PDF-diklaim-tapi-PNG-content, `assertExternalImageUrl` dengan `javascript:`/`file:`/malformed URL harus throw, `https:` valid harus lolos |
| `upload-storage.service.spec.ts` | Medium | Hanya happy path | Test file invalid ditolak sebelum I/O, `saveSupplierDocument` happy-path, `validateExternalImageUrl` reject non-http(s) |
| `paystack.service.spec.ts` | Medium | `amountToSubunit` rounding, `parseMetadata` malformed JSON, `channelLabel` fallback branch tidak diuji | Tambah boundary test untuk ketiganya |
| `app.service.spec.ts` | Medium (readability) | Duplikasi setup env Paystack ~10x; sisanya coverage kuat (webhook signature, idempotency, min-order, role enforcement, cascading delete) | Extract `withEnv()`/helper setup |
| `jwt-auth.guard`, `auth-session`, `mail.util`, `email-templates`, `bcrypt-cost`, `env-guard`, `otp`, `notification.service`, `api.spec`, `payment.spec` | Low | Sudah baik; catatan minor: jalur gagal Resend di `mail.util` belum ditest, `auth-session` belum test storage-throws di private browsing, `bcrypt-cost` belum test upper boundary >15 | Tambahan minor, tidak mendesak |

---

## 3. Changelog & Versi (`changelog-generator`)

- Tag terakhir: `v0.5.3`
- Commit baru sejak tag: **35 commit**
- Rekomendasi bump: **minor → v0.6.0** (ada `feat` baru, tidak ada breaking change)
- `CHANGELOG.md` **belum ada** di root project — draft di bawah menunggu approval sebelum ditulis.

### Draft `CHANGELOG.md` — v0.6.0

```markdown
## [v0.6.0] - 2026-09-05

### Added
- api: expose v1 discovery and OpenAPI for integrators.
- auth: verify email inline on register page
- admin: allow user delete with order cascade and Customer copy.
- auth: verify email in Profile and send branded OTP mail.
- frontend: redesign login and register auth pages.
- auth: add Google sign-in for customers and hybrid supplier registration.
- add self-service profile edit and in-app password change.
- allow admins to delete users without order history.
- add customer forgot-password flow with email OTP.
- send OTP and notifications via Gmail SMTP.
- enable required email OTP verification on production.

### Changed
- docs: move all documentation to dova-comp-wiki SSOT.

### Fixed
- catalog: insert missing seed SKUs without overwriting live stock.
- dev: align backend .env.dev CORS with frontend port 3001.
- auth: show registration success as centered modal.
- auth: show register success message and verify secure password storage.
- supplier: disk upload storage, validation, and product CRUD hardening.
- auth: auto-resend verification OTP on unverified login.
- auth: redirect unverified login attempts to verify-email.
- smoke: accept 201 from forgot-password and reset-password endpoints.
- smoke: retry /health until API is ready after PM2 restart.
- harden admin user delete with transactional guards and canDelete API.
- accept 201 from verify-otp in production smoke script.
```

**Catatan:** draft ini belum ditulis ke `CHANGELOG.md` — menunggu approval Dozer sebelum di-commit/di-tag.

---

## 4. Code Review (`code-reviewer`)

Analisis: PR analyzer (`v0.5.3..HEAD`) + code quality checker (`apps/`, TypeScript).

### PR Analyzer

- 114 file berubah, +4460/-6525 baris, 35 commit
- Complexity score: **9 (Critical)** — didorong oleh volume perubahan, bukan satu file bermasalah
- **Temuan "critical" (hardcoded_secrets, sql_concatenation)** di `app.service.spec.ts`, `app.service.test-doubles.ts`, `mail.util.spec.ts`, `scripts/smoke-production-api.js` — **diverifikasi manual sebagai false positive**: semuanya literal password test (`password123`), nama variabel token/JWT di test/smoke script, dan kata kunci SQL yang muncul di teks non-query. Tidak ada secret asli atau SQL injection nyata.
- **High (nyata):** `app.service.ts` — ada blocking call pada operasi async; perlu ditinjau potensi deadlock.
- **Medium:** `console.log`/debug statement tertinggal di `app.service.ts` (3x) dan `database.service.ts` (2x); satu penggunaan tipe `any` di `app.service.ts`.

### Code Quality Checker

- 129 file dianalisis, **average score 95.6 (Grade A)**, 0 SOLID violation eksplisit, 237 code smell (mayoritas magic-number minor di file test/fixture)

| File | Skor | Grade | Isu utama |
|---|---|---|---|
| `apps/backend/src/app.service.ts` | 60 | **D** | God class: `AppService` punya **127 method** (batas wajar 20) — kandidat kuat dipecah jadi beberapa service (mis. `OrderService`, `AuthService`, `AdminService`, `PaymentService`). Banyak magic number (`1000`, `604800`, `62000000000`, dll) sebaiknya jadi named constant (mis. `MS_PER_SECOND`, `ORDER_TOKEN_TTL_SECONDS`) |
| `apps/backend/src/app.controller.ts` | 70 | C | God class: `AppController` punya **23 method** (batas 20). Magic number seperti `1024` (byte size), `900000`/`604800000` (durasi ms) sebaiknya jadi named constant |
| `feedback.service.ts`, `database.service.ts`, `paystack.service.ts`, beberapa halaman frontend | 81–88 | B | Tidak ada isu kritis, hanya minor |

---

## Update — Rekomendasi High selesai (2026-09-05)

Keempat item High priority dari rilis laporan sebelumnya sudah dikerjakan dan diverifikasi (full suite + typecheck backend/frontend tetap hijau setelah setiap perubahan).

1. **Test DB-layer untuk `createOrderFromCart` dan `adjustStock`** — ✅ selesai. Menambahkan 8 test baru di `database.service.spec.ts`: stok-exceeded, min-order shortfall, decrement stok + commit pada order valid, rollback saat cart kosong (untuk `createOrderFromCart`); restock, damage (delta negatif), rollback saat insufficient stock, dan release client pada rollback (untuk `adjustStock`). Total suite ini sekarang 17 test (dari 9).
2. **Test untuk `assertExternalImageUrl` dan cabang lain di `file-validation.ts`** — ✅ selesai. Menambah 18 test baru di `file-validation.spec.ts`, mencakup: `assertExternalImageUrl` (http/https valid, URL malformed, protokol `javascript:`/`file:`/`ftp:` ditolak), `extensionForMime` (semua mapping + unsupported-mime throw), WEBP detection, empty-buffer, dan claimed-mime-di-luar-set-yang-diizinkan untuk `assertProductImage`/`assertSupplierDocument`. Total suite ini sekarang 21 test (dari 3).
   - **Catatan keamanan tambahan (belum ditindaklanjuti):** `assertExternalImageUrl` hanya memvalidasi skema `http`/`https`, belum memblokir target ke alamat internal/private (mis. `http://169.254.169.254`, `http://localhost`, IP privat) — celah SSRF yang lebih dalam dari sekadar validasi skema. Test yang ditambahkan mendokumentasikan perilaku saat ini; perbaikan (allowlist/DNS-resolve check) belum dilakukan karena di luar cakupan "tambah test" dan berpotensi mengubah perilaku produksi.
3. **Tinjau blocking call async di `app.service.ts`** — ✅ selesai, **hasil: false positive**. Finding "high" dari `pr_analyzer.py` (`csharp_blocking_async`, pola regex `.Result`/`.Wait()`) ternyata cocok dengan `...result` — operator spread objek TypeScript di baris `return { message: 'Account created successfully.', ...result };` (kini di `auth.service.ts`), bukan pemanggilan `.Result` ala C#. Tidak ada blocking call atau risiko deadlock nyata di codebase ini. Tidak ada perubahan kode diperlukan.
4. **Pecah `AppService` (127 method, grade D)** — ✅ selesai. Direfactor dengan pola facade agar **tanpa breaking change**:
   - State in-memory (`users`, `products`, `orders`, dst.) dipindah ke `AppStateService` baru.
   - Logic dipecah jadi 8 service domain baru: `AuthService`, `CatalogService`, `CartService`, `OrderService`, `OrderPaymentService`, `SupplierService`, `AdminService`, `ContactService` (plus `notifySafely` jadi util murni di `notify-safely.util.ts`).
   - `AppService` sekarang jadi facade tipis: constructor signature, seluruh method publik, dan field publik (via getter) **identik** dengan sebelumnya — sehingga `app.controller.ts`, `jwt-auth.guard.ts`, `roles.guard.ts`, `app.module.ts`, dan `app.service.test-doubles.ts` **tidak perlu diubah sama sekali**. 1022 baris test lama di `app.service.spec.ts` tetap lulus tanpa modifikasi.
   - Hasil code-quality-checker setelah refactor: `app.service.ts` naik dari **60/D → 86/B** (72 method — mayoritas delegator satu baris untuk menjaga backward-compat; getter/setter dihitung sebagai method oleh tool).
   - File baru: `app-state.service.ts`, `notify-safely.util.ts`, `auth.service.ts`, `catalog.service.ts`, `cart.service.ts`, `order.service.ts`, `order-payment.service.ts`, `supplier.service.ts`, `admin.service.ts`, `contact.service.ts`.
   - Verifikasi: `npm run test` (209 test) dan `npm run typecheck` backend + frontend — semua PASS.

---

## Update 2 — Follow-up selesai: split `AuthService` & `AppController` (2026-09-05)

Kedua item follow-up opsional dari update sebelumnya sudah dikerjakan, dengan pola yang sama (facade untuk service, multi-controller untuk NestJS controller) agar **tanpa breaking change**. Diverifikasi ulang setelah setiap perubahan: `npm run test` (209 test) dan `npm run typecheck` backend + frontend tetap PASS.

### `AuthService` dipecah lebih lanjut (62/D, 52 method → 100/A)

`AuthService` (hasil pecahan `AppService` sebelumnya) masih terlalu besar karena menampung 4 concern berbeda dalam satu class. Dipecah jadi 4 service baru, dengan `AuthService` jadi facade tipis:

- **`UserDirectoryService`** — `makeUser`, `publicUser`, `findUser`, `syncUserRecord` (primitif identitas user, dipakai lintas domain).
- **`SessionService`** — `tokensFor`, `login`, `refresh`, `revoke`, `userFromToken`, `requireRole`, plus method baru `issueSession()` yang mengonsolidasikan logic terbitkan-token-dan-simpan-sesi yang sebelumnya diduplikasi persis di `login`/`register`/`verifyOtp`.
- **`RegistrationService`** (88/B, 24 method — sedikit di atas ambang 20, wajar karena OTP registrasi punya banyak state kecil untuk Redis vs in-memory fallback) — `sendRegistrationCode`, `register`, `verifyOtp`, `resendOtp`, dan helper OTP pendingnya.
- **`AccountService`** — `forgotPassword`, `resetPassword`, `updateProfile`, `changePassword`.
- **`qa-smoke-otp.util.ts`** — helper kecil `qaSmokeOtpCode` (dipakai `RegistrationService` dan `AccountService`) diekstrak jadi pure function agar tidak dua class saling bergantung untuk satu helper 3 baris.

`AuthService` sekarang facade 100/A. Constructor signature (`jwt, database, redis, state`) dan seluruh method publik tidak berubah, sehingga `AppService`, `OrderService`, `OrderPaymentService`, `AdminService` — yang semuanya bergantung pada `AuthService` — tidak perlu diubah.

### `AppController` dipecah jadi 7 controller per domain (70/C, 23 method → semua A/B)

NestJS mendukung banyak `@Controller()` dalam satu module tanpa memengaruhi routing (route dicocokkan lewat path/method decorator, bukan lewat nama class), jadi split ini **lebih rendah risiko** dibanding split service — cukup pindahkan method dan path string apa adanya, tanpa perlu pola facade/delegasi:

| Controller baru | Route group | Skor |
|---|---|---|
| `AuthController` | `auth/*` (register, login, OTP, password, profile) | 84/B |
| `CatalogCartController` | `categories`, `products`, `cart/*`, `orders/*` | 100/A |
| `PaymentController` | `payments/*` (config, initialize, verify, webhook) | 100/A |
| `SupplierController` | `suppliers/*` (register, products, stock, orders) | 96/A |
| `AdminController` | `admin/*` (dashboard, users, products, orders, contacts) | 100/A |
| `ContactController` | `contact` | 100/A |
| `FeedbackController` | `feedback/*` (posts, comments, roadmap, changelog) | 100/A |
| `AppController` (sisa) | `/`, `health`, `openapi.json` — 3 method saja | 100/A |

`app.module.ts` diupdate untuk mendaftarkan ketujuh controller baru. Tidak ada path route yang berubah — semua string path (`'auth/login'`, `'admin/users/:id'`, dst.) dipindah persis. `app.controller.spec.ts` (test untuk `apiIndex`/`health`/`openapi`) tidak perlu diubah karena constructor `AppController` dan ketiga method itu tetap ada di file yang sama.

**Follow-up yang masih terbuka (opsional, dampak kecil):** `RegistrationService` sedikit di atas ambang 20 method (24) — bisa dipecah lagi jadi "registration OTP" vs "resend OTP" jika mau skor sempurna, tapi tidak krusial untuk maintainability saat ini.

---

## Rekomendasi Prioritas

### High

Semua item High dari laporan awal sudah selesai — lihat [Update — Rekomendasi High selesai](#update--rekomendasi-high-selesai-2026-09-05) di atas.

### Medium

5. Extract factory `withEnv()` untuk menghapus duplikasi ~10 blok setup/restore `PAYSTACK_SECRET_KEY` di `app.service.spec.ts`. *(ai-qa-review)*
6. Tambah test happy-path & rejection-path untuk `upload-storage.service.spec.ts` (`saveSupplierDocument`, validasi sebelum I/O). *(ai-qa-review)*
7. Tambah boundary test untuk `amountToSubunit`, `parseMetadata`, dan `channelLabel` di `paystack.service.spec.ts`. *(ai-qa-review)*
8. ~~Pecah `AppController` (23 method, grade C)~~ — ✅ selesai, lihat [Update 2](#update-2--follow-up-selesai-split-authservice--appcontroller-2026-09-05) di atas. Sisa: ganti magic number durasi/byte-size dengan named constant di `app.service.ts`/`app.controller.ts` (belum dikerjakan; `SessionService` hasil split sudah memakai named constant untuk TTL token sebagai contoh). *(code-reviewer)*
9. Bersihkan `console.log`/debug statement dan penggunaan `any` yang tertinggal di `app.service.ts` dan `database.service.ts`. *(code-reviewer)*
10. Tinjau dan ganti password default hardcoded (`admin1234`/`supplier1234`) dengan requirement env var wajib + guard. *(ai-qa-review)*
11. Setujui draft `CHANGELOG.md` v0.6.0 di atas, lalu commit dan tag rilis. *(changelog-generator)*

### Tindak lanjut yang disarankan

- Setup Stryker mutation-testing threshold (≥70%) sebagai CI job terpisah untuk `database.service.ts`, `paystack.service.ts`, `file-validation.ts`, `app.service.ts`.
- Jalankan ulang `ai-bug-triage` setiap ada kegagalan CI baru — pipeline saat ini tidak punya input karena semua test hijau.
