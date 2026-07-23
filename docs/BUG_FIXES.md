# DOVA Bug Fixes

Known issues found during MVP / design port work, and their status.

## Fixed — 2026-07-23

| ID | Area | Issue | Fix |
|----|------|-------|-----|
| BF-001 | UI | Marketplace looked unfinished vs stakeholder Startup mockups | Ported DOVA-Startup design into `apps/frontend` (theme, home, auth, dashboards, cart/checkout). |
| BF-002 | UI | Auth pages used plain page forms, not Startup centered cards | Introduced `AuthShell` + login/register/supplier-register card layouts. |
| BF-003 | UI | Admin/supplier screens were flat pages without sidebar IA | Added `DashboardShell` with sidebar tabs matching Startup dashboards. |
| BF-004 | UI | Cart/checkout did not match Startup card + summary layout | Rebuilt cart item rows, order summary panel, and checkout two-column form. |
| BF-005 | UI | Hero/product imagery missing (emoji placeholders only) | Added compressed assets from Startup (`logo`, `farmer`, `supplier`, products). |
| BF-006 | UI | Currency shown as `Rp` while market/Paystack is Nigeria | Display formatting switched to `₦` / `en-NG` across storefront + dashboards. |
| BF-007 | UI | Site header/footer wrapped dashboards and broke Startup full-bleed look | `Layout` `chrome="none"` for admin/supplier dashboards. |
| BF-008 | UX | Product cards lacked trust signals from mockup (origin/stars) | Added supplier/origin meta + star row + verified badge on detail. |
| BF-009 | CSS | Product card padding collided with dashboard form cards after theme rewrite | Split `.card` padding rules vs `.card.product-card` / grid cards. |
| BF-015 | UI | Not mobile-first (desktop CSS + weak HP nav) | Hamburger drawer, mobile-first CSS, cart/table/dashboard polish. |

## Open / known

| ID | Area | Issue | Notes |
|----|------|-------|-------|
| BF-010 | Product | Minimum order value (pickup ₦3,000 / delivery ₦5,000) not implemented | See `DOVA_REPLY_PAYSTACK_AND_MIN_ORDER.md`. |
| BF-011 | Product | Contact form may not fully persist to DB | Spec compliance W4.3. |
| BF-012 | Product | Supplier product image upload still URL-based | Image URL field remains. |
| BF-013 | Ops | E2E / production smoke coverage incomplete | Staging verification pending. |
| BF-014 | Design | Star ratings are decorative (not backed by review API) | Post-MVP reviews feature. |

## How to report

1. Reproduce on local (`frontend` `:3001`, backend as configured).  
2. Note role, page URL, expected vs actual.  
3. Add a row under **Open** (or open a GitHub issue) with ID `BF-XXX`.
