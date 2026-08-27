# DOVA Changelog

All notable changes to the DOVA marketplace project.

## [0.5.2] — 2026-08-27

> **Author:** Dozer  
> **Release:** Production launch — `dova.dntech.id`

### Added
- **`npm run smoke:production`** — automated 23-step API smoke + NEG-01..07 against production (`scripts/smoke-staging-api.js`; alias `smoke:staging` kept).
- **JWT guard tests** — Bearer token preferred over stale cookie (`jwt-auth.guard.spec.ts`).
- **`setSupplierStatus` DB tests** — varchar cast regression coverage.

### Fixed
- **GET `/products/:id`** — invalid UUID returns **404** instead of **500** (Postgres error).

### Verified (production)
- 127 unit tests green · full API smoke pass · VPS @ `v0.5.2` · Paystack `mode: paystack`

**Tag command:** `git tag -a v0.5.2 -m 'Production v0.5.2' && git push origin v0.5.2`

---

## [0.5.1] — 2026-08-27

> **Author:** Dozer  
> **Range:** after `v0.5.0` → `HEAD` · **SemVer bump:** `patch`

### Added
- **Release readiness audit** — combined QA, bug triage, and backend review (`tests/DOVA-RELEASE-READINESS-AUDIT.md`).
- **QA Postman guide** — 67-endpoint checklist for manual API smoke (`tests/DOVA-API-QA-POSTMAN.md`) (`2d35c0c`, `54c3009`).

### Fixed
- **Supplier approve/reject** — Postgres `42P08` type coercion on `setSupplierStatus` (`00c8601`).
- **Staging login loop** — stale API cookie overrode fresh Bearer token on `/auth/me`; guard prefers Authorization header (`fc177d6`).

### Docs
- Removed internal stakeholder / duplicate status docs from app repo (canonical copies live in `dova-company-wiki/`).

**Tag command:** `git tag -a v0.5.1 -m 'Release v0.5.1' && git push origin v0.5.1`

---

## [0.5.0] — 2026-08-26

> **Author:** Dozer  
> **Range:** after `v0.4.0` → `52530da` · **Commits:** 6 · **SemVer bump:** `minor` · **Conventional lint:** 0/6 valid — sections below are manually curated from git history.

### Added
- **Admin user management** — view user detail, edit name/email/phone, change role, reset password, activate/deactivate; self-lockout guards prevent admins from demoting or deactivating themselves (`52530da`).
- **Remember Me** — checkbox now persists login across browser restarts via localStorage and extended refresh token TTL (`2ca18cc`).
- **Email OTP scaffolding (disabled)** — migration `006_email_otp.sql`, shared OTP helpers, verify-email page, and commented backend endpoints; registration remains immediate login-ready (`7bafb35`).
- **Backend hardening** — shared prebuild in dev/CI, JWT env guard, rate limiting, Nest auth guards, cart/order migrations (`004`/`005`), feedback board Postgres persistence, expanded test suite (`f6e4d08`).

### Changed
- **Production boot** — weak/missing `JWT_SECRET` logs a warning instead of crashing the API (fixes false CORS/502 on VPS when env is incomplete) (`a25f894`).

### Fixed
- **Purchase history crash** — Postgres `NUMERIC` quantity returned as string broke `.toFixed()` on `/customer/history` (`85c2765`).

### Deploy notes
- Run `npm run db:migrate` on VPS after pull (migrations `004`, `005`, `006`).
- OTP email verification is **off**; no `RESEND` config required for signup.

### Commit index (audit)

| Hash | Message |
|------|---------|
| `52530da` | Add full admin user management beyond activate/deactivate. |
| `7bafb35` | Scaffold email OTP verification but keep standard registration. |
| `85c2765` | Fix purchase history crash when order quantity is a string from Postgres. |
| `a25f894` | Fix production boot: warn on weak JWT instead of crashing API. |
| `2ca18cc` | Make Remember Me persist login across browser sessions. |
| `f6e4d08` | Harden DOVA backend: shared build, auth guards, and DB migrations. |

**Tag command:** `git tag -a v0.5.0 -m 'Release v0.5.0' && git push origin v0.5.0`

---

## [0.4.0] — 2026-08-24

> **Range:** after `0.3.0` (2026-07-24) → `a33e8e0` · **Commits (no merge):** 63 · **SemVer bump:** `minor` · **Conventional lint:** 16/64 valid — sections below merge auto-parser output + full commit pass.

### Added
- **My Orders** page (`66a19a4`) and **customer profile** page (`2020000`).
- Checkout **modal login** for guests + reusable modal (`2d5ea55`, `d5262e6`).
- **Delivery slot** selection + warning when missing (`86312a7`, `6470e18`).
- **Complete payment** action for pending orders (`a33e8e0`).
- Supplier product **status tabs** — hide/restore flow (`947beb2`).
- Admin **Available / Low Stock / Hidden** inventory tabs (`b41ff1d`).
- Show/hide **password toggle** on auth forms (`0fc6d65`, `d5bd108`).
- Paystack aligned with **official API + test mode** (`0245cf1`, `1aebc40`).
- **Native feedback board** at `/feedback` — replaces external FeedLog (`c4d1938`).
- Cart **quantity cap** when over limit (`b84d805`).
- **`tests/ENV-SETUP.md`** for new server deploy (`924fa98`).
- Demo **login reset script** + seed password sync (`4db8a3d`, `160cfdd`).
- **`.env.dev` templates** for copy-paste local setup (`749cdd7`).
- DOVA navbar logo as **favicon** (`80a5220`).
- Reusable **product card** component (`62dc97e`).

### Changed
- **Admin menu re-layout** + two-row header (`bc4fa7b`, `2512054`).
- **Mobile-first responsive** pass across all pages (`26a2309`, `b8b20b7`, `3532ea7`, `c1dc679`).
- Liquid products display in **litres** instead of kg (`6faf855`).
- Post-login redirect to **`/products`** (`9b7beb7`).
- Product search **debounced** (`d84840e`).
- Support contact phone → **+234 903 269 6825** (`2bea2d1`).
- Deploy pipeline: **build `shared`** before backend/frontend (`1145a14`).
- Investor-demo **resilience** — non-blocking email, Paystack timeout, checkout role guard (`ca1b78e`).
- README + stakeholder **partnership docs** updated (`10110e4`, `1aebc40`).

### Fixed
- **BUG-007:** unique UUID for `order_items.id` on re-order (`e87495b`).
- **Cart auth** on cross-origin staging + chicken category filter (`d0a5b7f`, `08b65bb`, `771b84f`).
- **CORS / `.env` load** on VPS/PM2 (`191cfd1`).
- **Redis** unavailable — no backend crash (`9b028cf`, `df29ae3`).
- **UAT batch:** cart badge, decimal qty, product tabs, supplier catalog, images (`d755a4c`, `8f06c78`, `771b84f`, `c6ed808`).
- Mobile **hamburger menu** not responding to taps (`48f2dda`).
- Desktop **header/nav** layout after mobile-first refactor (`d5eb686`, `64f8750`).
- Broken **product images** + alt-text fallback (`b7c6e58`, `43e1afc`).
- Password toggle inheriting login button styles (`d548b3b`).
- Product list / search bar / filter **centering** on `/products` (`498580c`, `b5bcefe`, `b5c4667`, `94747cc`).
- Unreadable **Explore Marketplace** button on About (`369f4f2`).
- Feedback/changelog **nested route imports** (`a50bfcb`, `9cef54e`).
- Restore **Set to Active** button label on admin (`9b7beb7`).

### Commit index (audit)

<details>
<summary>63 commits since 0.3.0 — click to expand</summary>

| Hash | Message |
|------|---------|
| `a33e8e0` | Add Complete payment action for pending orders. |
| `1aebc40` | Improve Paystack checkout and add stakeholder partnership docs. |
| `bc4fa7b` | re-layout admin menu |
| `10110e4` | update readme.md |
| `2020000` | profile page |
| `66a19a4` | feat: My Orders page |
| `2c730e2` | Stop tracking .DS_Store |
| `d755a4c` | Fix UAT bugs: cart badge, password toggle, cheap seed products |
| `8f06c78` | Fix cart decimal-quantity validation and product-tab bugs found in review |
| `b41ff1d` | Add Available/Low Stock/Hidden product tabs to admin dashboard |
| `9b7beb7` | Redirect customers to /products after login; restore 'Set to Active' button text |
| `ca1b78e` | Improve investor-demo resilience: non-blocking emails, Paystack timeout, fix checkout for non-customer roles |
| `c6ed808` | some bug fix |
| `48f2dda` | Fix mobile hamburger menu not responding to taps |
| `43e1afc` | Fix missing Link import in ProductCard after ProductImage change |
| `1145a14` | Build shared package before backend and frontend on deploy |
| `924fa98` | Add ENV-SETUP guide for new server deployment |
| `b7c6e58` | Fix broken product images and alt-text fallback display |
| `64f8750` | Fix desktop navbar by wrapping brand and nav in header-inner |
| `d5eb686` | Fix desktop header layout after mobile-first changes |
| `2bea2d1` | Update support contact phone to +234 903 269 6825 |
| `b8b20b7` | Improve mobile layout across all viewport sizes |
| `6faf855` | Show liquid products in litres instead of kilograms |
| `b5c4667` | fix: text responsive |
| `26a2309` | Make all DOVA pages mobile-first responsive |
| `947beb2` | feat: add product status tabs with hide/restore flow for supplier dashboard |
| `4db8a3d` | Add demo login reset script and sync passwords on bootstrap |
| `e87495b` | fix BUG-007: generate unique UUID for order_items id to prevent duplicate key error |
| `d5bd108` | add hide unhide password |
| `2512054` | Fix admin header layout with two-row navigation bar |
| `160cfdd` | Reset demo account passwords when running seed |
| `10ff8bd` | asd |
| `d548b3b` | Fix show-password toggle inheriting login button styles |
| `80a5220` | Use DOVA navbar logo as site favicon |
| `0fc6d65` | Add show/hide password toggle on auth forms |
| `d5262e6` | Fix product page build: restore showLoginModal state |
| `771b84f` | Fix UAT bugs: cart validation, checkout, supplier catalog, and images |
| `df29ae3` | Harden Redis fallback against uncaught error events |
| `9b028cf` | Fix backend crash when Redis is unavailable |
| `191cfd1` | fix: load backend .env reliably for CORS on VPS/PM2 |
| `0668c99` | asd |
| `0245cf1` | feat: align Paystack integration with official API and test mode setup |
| `716a2ef` | add FE server log |
| `b84d805` | do not add to cart if the qty over limit |
| `6470e18` | add warning if not choose delivery slot yet |
| `d0a5b7f` | fix: resolve cart auth on cross-origin staging and chicken category bug |
| `94747cc` | fix: small screen |
| `d84840e` | debounce on search |
| `3532ea7` | redesign |
| `a50bfcb` | Fix changelog page import paths for nested route. |
| `c4d1938` | Replace external FeedLog with native DOVA feedback board. |
| `08b65bb` | Fix cart auth bugs, integrate FeedLog, and expand test coverage. |
| `9cef54e` | feedlog bug fix |
| `c1dc679` | new design |
| `8341828` | update |
| `bbcc103` | docs: FeedLog setup without local Docker |
| `6b92a81` | feat: wire optional FeedLog feedback links in storefront nav |
| `86312a7` | feat: add delivery slot |
| `369f4f2` | fix: unreadable Explore Marketplace button in about us |
| `2d5ea55` | feat: add modal login for checkout if not login yet, add reausable modal |
| `498580c` | fix: responsive in porduct list |
| `b5bcefe` | fix: search bar, filter category and product list not center in /products |
| `62dc97e` | chore: reusable product card |
| `749cdd7` | chore(dev): ship .env.dev templates so local setup is copy-paste, update README quick start. |

</details>

**Auto-parser baseline** (conventional commits only — 13 bullets): see `generate_changelog.py --input commits --next-version 0.4.0`.

---

## [0.3.0] — 2026-07-24

### Week 4 / MVP codebase complete
- Contact form persists to `contact_submissions` (DB) or in-memory; Admin **Contacts** inbox (`GET /admin/contacts`).
- Minimum order value: pickup **₦3,000** / delivery **₦5,000** with checkout fulfillment choice; enforced in shared helpers + API + DB path.
- Orders store `fulfillment_type` (`002_week4.sql`); migrate script applies all `database/migrations/*.sql`.
- Supplier product create/update accepts multipart **image** upload (JPG/PNG/WEBP, 5 MB) in addition to optional URL.
- Optional Resend notification for contact messages when email env is set.

### Docs & ops
- Added `DOVA_RUNBOOK.md`, `DOVA_API.md`, `scripts/smoke-week4.js` (`npm run smoke:week4`).
- Spec compliance + progress docs mark **MVP codebase = 100%**; remaining items are staging/Paystack go-live (ops).

---

## [0.2.2] — 2026-07-23

### Supplier registration UX
- Added on-form guidance for verification documents (CAC / government ID / optional address proof; PDF/JPG/PNG max 5 MB).
- Shows selected file name after choose.

### Docs
- Added `DOVA_REPLY_SUPPLIER_VERIFICATION_DOCS.md` (stakeholder reply).
- Progress, status, compliance, README, and bug fixes updated for document guidance.

---

## [0.2.1] — 2026-07-23

### Mobile-first UI
- Viewport meta + theme-color.
- Hamburger drawer navigation (mobile); desktop nav from 900px up.
- Layouts rewritten mobile-first (hero, grids, cart, checkout, dashboards).
- Tables collapse to labeled cards under 640px.
- Touch targets (~44px), overflow clipping, sticky cart icon in header.

### Docs
- Progress / status / compliance docs refreshed for Startup UI + mobile-first (23 Jul afternoon).
- Added `DOVA_VPS_DEPLOY.md` for single-server deploy steps.
- `BUG_FIXES.md` restored BF-009 and recorded BF-015.

---

## [0.2.0] — 2026-07-23

### Design — DOVA-Startup UI port
- Ported Startup mockup visual system into the Next.js frontend (Poppins, green `#0F6B43`, gold `#D8B24A`, cream `#F8FAF8`).
- Rebuilt homepage: hero with farmer image, How It Works, Featured Products (API-backed), Become a Supplier CTA, Why Choose DOVA.
- New sticky nav + multi-column footer (Quick Links, Contact, Suppliers).
- Auth screens redesigned as centered cards (`AuthShell`): login, register, supplier register.
- Admin & supplier dashboards redesigned with sidebar navigation (`DashboardShell`), stats cards, and data tables.
- Cart & checkout restyled to match Startup layouts (item cards, order summary, two-column checkout).
- Customer orders page uses table layout; order detail uses checkout-style summary.
- Product cards/detail: supplier meta, star rating display, verified badge.
- Added compressed brand assets under `apps/frontend/public/images/`.
- UI currency display aligned to Naira (`₦`).

### Frontend
- Added `AuthShell` and `DashboardShell` shared components.
- `Layout` supports `chrome="none"` for full-bleed dashboard pages.
- About / Contact / Products pages restyled for brand consistency.

### Backend / platform (included in this release batch)
- Notification service wiring and related auth/database updates.
- Migration / seed adjustments (`001_init.sql`, `scripts/seed.js`, `scripts/seed-week3.js`).
- Spec compliance and MVP progress docs added under `docs/`.

### Docs
- `DOVA_SPEC_COMPLIANCE.md` — PRD/SRS/SDD vs implementation audit.
- MVP progress updates (technical + non-technical).
- Stakeholder reply draft: Paystack + minimum order value.

---

## [0.1.0] — earlier

- Initial MVP push: NestJS backend, Next.js frontend, cart/checkout, Paystack flow, supplier/admin basics (`131ee7b`).
