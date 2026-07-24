# DOVA Changelog

All notable changes to the DOVA marketplace project.

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
