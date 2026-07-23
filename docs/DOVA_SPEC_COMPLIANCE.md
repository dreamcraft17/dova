# DOVA — Spec Compliance Check
## PRD / SRS / SDD vs current codebase

**Checked:** 23 July 2026  
**Against:** `DOVA_PRD_AGGRESSIVE_4W.md`, `DOVA_SRS_AGGRESSIVE_4W.md`, `DOVA_SDD_AGGRESSIVE_4W.md`, `DOVA_SUMMARY_4W.md`  
**Override in force:** `DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md` (supersedes Docker / DigitalOcean deploy sections)

---

## Short answer

**No — not fully aligned with every PRD/SRS/SDD requirement.**

The **core MVP product flows** (auth → browse → cart → checkout → pay → supplier → admin) are largely implemented in code.  
What does **not** match yet is mainly **Week 4 launch bar**, some **SRS detail ACs**, and **older SDD hosting** (which the Vercel override already replaced).

| Lens | Rough fit |
|------|-----------|
| Must-have product journeys (PRD) | ~85–90% in code |
| SRS FR acceptance criteria (strict) | ~54% fully DONE · ~75% if PARTIAL counts half |
| Launch / Definition of Done (SRS §8–10) | Far from complete |
| Tech stack (after Vercel override) | Mostly aligned |
| Out-of-scope items (correctly absent) | Aligned |

---

## Compliance by week (SRS FRs)

### Week 1 — Foundation

| FR | Status | Notes |
|----|--------|-------|
| W1.1 Customer registration | Done | Email/password, bcrypt, customer role |
| W1.2 Login | Done | JWT cookies, role redirect |
| W1.3 Logout | Done | Cookie clear + revoke |
| W1.4 Roles & permissions | Done | Backend 403 + frontend guards |
| W1.5 Database schema | Done | Migration `001_init.sql` covers required tables |
| W1.6 Frontend boilerplate | Partial | Next.js + TS yes; **no Tailwind v4 / Axios** (custom CSS + fetch) |
| W1.7 CI/CD | Partial | GitHub Actions test/build yes; **no Docker image, no DO auto-deploy, no Slack** (matches override, not original SDD) |

### Week 2 — Customer purchase

| FR | Status | Notes |
|----|--------|-------|
| W2.1 Browse products | Partial | Grid + pagination; page size / “Load More” / verified badge differ from SRS |
| W2.2 Search | Done | Debounced search |
| W2.3 Product details | Partial | Works; qty rules / verified badge not exact vs SRS |
| W2.4 Shopping cart | Done | CRUD; persists with DB/Redis when configured |
| W2.5 Checkout | Done | Order + payment initialize |
| W2.6 Payment verification | Done | Verify + webhook; **mock** if no Paystack key |
| W2.7 Order history | Done | List + detail |

### Week 3 — Supplier & admin

| FR | Status | Notes |
|----|--------|-------|
| W3.1 Supplier registration | Partial | Upload + pending; email “under review” not real send |
| W3.2 Supplier dashboard | Done | Products, stock, orders |
| W3.3 Product CRUD | Partial | CRUD yes; **image URL only — no upload/resize** |
| W3.4 Stock management | Done | Adjustments; **stock decreases on purchase**; OOS hidden |
| W3.5 Order fulfillment | Done | Status workflow |
| W3.6 Admin dashboard | Done | Stats, users, products, orders, approvals |
| W3.7 Supplier approval | Partial | Approve/reject UI+API; email only if Resend configured |

### Week 4 — Public pages & launch

| FR | Status | Notes |
|----|--------|-------|
| W4.1 Home | Partial | Hero/CTAs; missing some SRS sections (e.g. How It Works / featured) |
| W4.2 About | Done | Static page |
| W4.3 Contact | Partial | Form exists; **does not write to `contact_submissions`** |
| W4.4 Footer | Partial | Minimal footer; not full SRS content |
| W4.5 Comprehensive testing | Partial | Unit/smoke yes; **no E2E**, no 80%+ coverage gate |
| W4.6 Production deployment | Not done | Config exists; live prod not verified |
| W4.7 Launch docs / monitoring | Partial | README only; no runbook / Swagger / monitoring |

**Score:** 15 Done · 12 Partial · 1 Not done (~75% weighted, ~54% strict Done-only).

---

## PRD must-haves vs reality

| Must-have | In product? |
|-----------|-------------|
| Customer register / login / roles | Yes |
| Browse / search / product details | Yes (minor UI AC gaps) |
| Cart / checkout / Paystack | Yes (Paystack live only with keys; else mock) |
| Order history | Yes |
| Supplier register / dashboard / CRUD / stock / fulfillment | Yes (image upload gap) |
| Admin dashboard / supplier approval | Yes |
| Home / About / Contact / Footer | Yes pages; Contact persist + footer/home detail incomplete |
| 20+ sample products | Yes (seed / in-memory) |
| 5+ test suppliers | Yes (`db:seed:week3`) |
| 10+ successful Paystack test txs | **Not verified** in this workspace |
| Cart persists across sessions | Yes **when** Postgres/Redis configured |

---

## SDD / stack drift

| Original SDD / PRD | Current repo |
|--------------------|--------------|
| DigitalOcean App Platform + Docker | **Overridden** → Vercel frontend, Node backend, no Docker (`DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md`) |
| NestJS 10 | NestJS **11** present |
| Next.js 16 + React 19 | Present |
| Tailwind CSS v4 | **Not used** (custom CSS) |
| Axios | **Not used** (`fetch`) |
| PostgreSQL + Redis | Supported via env; local often `USE_IN_MEMORY=true` |
| Paystack | Implemented (+ mock fallback) |

Treat the **Vercel override** as the active deployment spec. Older Docker/DO sections in SDD/PRD are stale unless updated.

---

## Out of scope — correctly not built

Matches PRD/SRS “post-MVP” list: reviews, wishlist, password reset, email verification, SMS, multi-gateway, delivery tracking, discounts, multi-language, native mobile app, bulk import, CSV export, etc.

---

## Biggest gaps (if goal = “fully match SRS”)

1. **Production deploy + staging verification** (W4.6)  
2. **Contact form DB persistence** (W4.3)  
3. **E2E / fuller test + runbook / monitoring** (W4.5, W4.7)  
4. **Home/footer content completeness** (W4.1, W4.4)  
5. **Supplier product image upload** (W3.3)  
6. **Document sync:** update PRD/SDD hosting sections to match Vercel override (or delete conflicting text)  
7. **Optional:** Tailwind/Axios if you still care about literal stack lock; product works without them  

---

## Bottom line for the team

- **Product MVP path:** mostly there — good enough to demo customer / supplier / admin.  
- **Spec-complete / launch-complete:** not yet — especially Week 4 and a handful of SRS details.  
- **Docs:** PRD/SRS/SDD still describe Docker/DigitalOcean in places; repo already follows the Vercel override.

If you want “green against SRS,” prioritize Contact save, staging/prod, E2E smoke, and sync the deployment sections in the old specs.
