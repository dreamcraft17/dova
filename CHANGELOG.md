# Changelog

> **Author:** Dozer

All notable changes to this project will be documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), and this project adheres to [Semantic Versioning](https://semver.org/).

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

<!-- recommended-semver-bump: minor -->

## [v0.5.3] - 2026-08-27

### Changed
- Reframed the production domain (dova.dntech.id) messaging across docs — no longer described as staging.
- Finalized production wording in the README environment and deployment sections.

### Documentation
- Added a soft launch sign-off audit and staging smoke test results.

## [v0.5.2] - 2026-08-27

### Added
- Added soft launch readiness gates: a staging smoke test script, a UUID generation fix, and new guard tests.

## [v0.5.1] - 2026-08-27

### Fixed
- Fixed supplier approve/reject actions failing due to a Postgres type-coercion issue.
- Fixed a staging login loop caused by stale API cookies overriding Bearer tokens.

### Documentation
- Added a QA Postman endpoint checklist for manual API testing (later rewritten in English).
- Added a release readiness audit and changelog for v0.5.1.

## [v0.5.0] - 2026-08-26

### Added
- Hardened the DOVA backend: shared build pipeline, auth guards, and DB migrations.
- Added full admin user management beyond simple activate/deactivate.
- Added "Remember Me" so login persists across browser sessions.
- Scaffolded email OTP verification (kept behind standard registration for this release).

### Fixed
- Fixed production boot to warn on a weak JWT secret instead of crashing the API.
- Fixed a purchase-history crash when order quantity came back as a string from Postgres.
- Fixed the admin user modal to render as a proper overlay card.

## [v0.4.0] - 2026-08-24

First tagged release — ports and stabilizes the DOVA MVP storefront, checkout, and admin flows built up over the initial development sprint.

### Added
- Shipped the mobile-first storefront UI (ported from DOVA-Startup) with loading animations and responsive layout across all pages.
- Added delivery slot selection, a cart quantity guard, and a reusable login/checkout modal.
- Integrated Paystack checkout aligned with the official API, including test mode and a "Complete payment" action for pending orders.
- Replaced the external FeedLog widget with a native DOVA feedback board (create, vote, comments, changelog page).
- Added product status tabs (Available / Low Stock / Hidden) with a hide/restore flow on the supplier and admin dashboards.
- Added a "My Orders" page and a customer profile page.
- Added a show/hide password toggle on auth forms, and a demo login/password reset seed script.

### Fixed
- Fixed numerous UAT bugs: cart auth on cross-origin staging, cart badge and decimal-quantity validation, product image fallbacks, supplier catalog, and a mismatched chicken category.
- Fixed backend crashes when Redis is unavailable and hardened the Redis fallback against uncaught errors.
- Fixed mobile layout issues: desktop/mobile navbar and header layout, a hamburger menu not responding to taps, an unreadable button, and text responsiveness across viewports.
- Fixed a duplicate-key error on order items by generating a unique UUID (BUG-007).
- Fixed local `.env` loading for CORS on VPS/PM2 deployments.
- Fixed a broken deploy by building the shared package before backend and frontend.
- Fixed liquid products displaying in kilograms instead of litres.

### Changed
- Improved investor-demo resilience: non-blocking emails, a Paystack timeout, and fixed checkout for non-customer roles.
- Customers are now redirected to /products after login.

### Documentation
- Rewrote the README with accurate setup steps, routes, and documentation links.
- Added an ENV-SETUP guide for new server deployments.
