# DOVA — Spec Compliance Check
## PRD / SRS / SDD vs current codebase

**Checked:** 23 July 2026 (updated after Startup UI + mobile-first pass)  
**Against:** `DOVA_PRD_AGGRESSIVE_4W.md`, `DOVA_SRS_AGGRESSIVE_4W.md`, `DOVA_SDD_AGGRESSIVE_4W.md`, `DOVA_SUMMARY_4W.md`  
**Override in force:** `DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md` (supersedes Docker / DigitalOcean deploy sections)  
**UI reference:** DOVA-Startup mockups (ported into Next.js)

---

## Short answer

**No — not fully aligned with every PRD/SRS/SDD requirement.**

The **core MVP product flows** and **branded public/dashboard UI** are largely implemented.  
Gaps are mainly **Week 4 launch bar**, some **SRS detail ACs**, **Contact DB persist**, **min order**, and **older SDD hosting** text (Vercel/VPS override applies).

| Lens | Rough fit |
|------|-----------|
| Must-have product journeys (PRD) | ~85–90% in code |
| Storefront / dashboard UI (Startup) | ~95%+ of mockup intent |
| Mobile usability | Done (mobile-first pass) |
| SRS FR acceptance criteria (strict) | ~60% fully DONE · ~80% if PARTIAL counts half |
| Launch / Definition of Done (SRS §8–10) | Far from complete |
| Tech stack (after Vercel override) | Mostly aligned |

---

## Compliance by week (SRS FRs)

### Week 1 — Foundation

| FR | Status | Notes |
|----|--------|-------|
| W1.1 Customer registration | Done | Email/password, bcrypt, customer role |
| W1.2 Login | Done | JWT cookies, role redirect; branded auth card |
| W1.3 Logout | Done | Cookie clear + revoke |
| W1.4 Roles & permissions | Done | Backend 403 + frontend guards |
| W1.5 Database schema | Done | Migration `001_init.sql` |
| W1.6 Frontend boilerplate | Partial | Next.js + TS; **custom CSS** (not Tailwind v4 / Axios) — intentional |
| W1.7 CI/CD | Partial | GitHub Actions; no Docker/DO (matches override) |

### Week 2 — Customer purchase

| FR | Status | Notes |
|----|--------|-------|
| W2.1 Browse products | Done* | Grid + pagination; verified/star cues on UI (*decorative stars) |
| W2.2 Search | Done | Debounced search |
| W2.3 Product details | Done* | Works + verified badge; qty UX close enough |
| W2.4 Shopping cart | Done | Mobile-first cart layout |
| W2.5 Checkout | Done | Two-column → stacks on mobile |
| W2.6 Payment verification | Done | Verify + webhook; **mock** if no Paystack key |
| W2.7 Order history | Done | Table → card layout on small screens |

### Week 3 — Supplier & admin

| FR | Status | Notes |
|----|--------|-------|
| W3.1 Supplier registration | Partial | Upload + pending; email send optional |
| W3.2 Supplier dashboard | Done | Sidebar shell matching Startup |
| W3.3 Product CRUD | Partial | CRUD yes; **image URL only — no file upload/resize** |
| W3.4 Stock management | Done | Adjustments; stock decreases on purchase |
| W3.5 Order fulfillment | Done | Status workflow |
| W3.6 Admin dashboard | Done | Sidebar + stats + tables |
| W3.7 Supplier approval | Partial | Approve/reject; email if Resend configured |

### Week 4 — Public pages & launch

| FR | Status | Notes |
|----|--------|-------|
| W4.1 Home | Done | Hero, How It Works, featured (API), supplier CTA, trust |
| W4.2 About | Done | Branded static page |
| W4.3 Contact | Partial | Form exists; **does not write to `contact_submissions`** |
| W4.4 Footer | Done | Quick Links, Contact, Suppliers columns |
| W4.5 Comprehensive testing | Partial | Unit/smoke yes; **no E2E** |
| W4.6 Production deployment | Not done | Vercel/VPS docs exist; live prod not verified |
| W4.7 Launch docs / monitoring | Partial | README + changelog/bugfix; no full runbook/Swagger |

**Score (updated):** ~18 Done · ~9 Partial · 1 Not done (~80% weighted, ~60% strict Done-only).

---

## PRD must-haves vs reality

| Must-have | In product? |
|-----------|-------------|
| Customer register / login / roles | Yes |
| Browse / search / product details | Yes |
| Cart / checkout / Paystack | Yes (mock without keys) |
| Order history | Yes |
| Supplier register / dashboard / CRUD / stock / fulfillment | Yes (image upload gap) |
| Admin dashboard / supplier approval | Yes |
| Home / About / Contact / Footer | Yes pages; Contact **persist** still incomplete |
| Mobile-usable storefront | Yes (hamburger + responsive) |
| 20+ sample products | Yes |
| 5+ test suppliers | Yes (`db:seed:week3`) |
| 10+ successful Paystack test txs | **Not verified** |
| Min order pickup/delivery | **Not built** |

---

## SDD / stack drift

| Original SDD / PRD | Current repo |
|--------------------|--------------|
| DigitalOcean + Docker | **Overridden** → Vercel and/or VPS Node |
| NestJS 10 | NestJS **11** |
| Next.js 16 + React 19 | Present |
| Tailwind CSS v4 | **Not used** (custom CSS / Startup tokens) |
| Axios | **Not used** (`fetch`) |
| PostgreSQL + Redis | Supported; local often `USE_IN_MEMORY=true` |
| Paystack | Implemented (+ mock) |

---

## Biggest gaps (if goal = “fully match SRS” / launch)

1. **Production / staging verification** (W4.6)  
2. **Contact form DB persistence** (W4.3)  
3. **E2E + runbook / monitoring** (W4.5, W4.7)  
4. **Supplier product image upload** (W3.3)  
5. **Minimum order value** (stakeholder ask — not in original SRS week list)  
6. **Sync old PRD/SDD hosting sections** with Vercel/VPS override  

---

## Bottom line

- **Product + brand MVP path:** strong for internal demos (desktop & mobile).  
- **Spec/launch complete:** not yet — Contact save, staging, Paystack proof, min order, E2E.  
- **UI:** Startup design + mobile-first treated as **done** for MVP polish.

See `CHANGELOG.md` (0.2.0 / 0.2.1) and `BUG_FIXES.md`.
