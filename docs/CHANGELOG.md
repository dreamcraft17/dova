# DOVA Changelog

All notable changes to the DOVA marketplace project.

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
