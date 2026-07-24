# DOVA — Spec Compliance Check
## PRD / SRS / SDD vs current codebase

**Checked:** 24 July 2026 (MVP codebase complete)  
**Against:** `DOVA_PRD_AGGRESSIVE_4W.md`, `DOVA_SRS_AGGRESSIVE_4W.md`, `DOVA_SDD_AGGRESSIVE_4W.md`, `DOVA_SUMMARY_4W.md`  
**Override in force:** `DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md` (supersedes Docker / DigitalOcean deploy sections)  
**UI reference:** DOVA-Startup mockups (ported into Next.js)

---

## Short answer

**MVP codebase = 100% complete** for the agreed 4-week product scope (Week 1–4 features + stakeholder min-order / contact / image upload).

What remains is **ops / go-live**, not missing product code: provision staging/production, run Paystack test txs, soft-launch checklist.

| Lens | Status |
|------|--------|
| Must-have product journeys (PRD) | **100% in code** |
| Storefront / dashboard UI (Startup) | **Done** (~95%+ mockup intent) |
| Mobile usability | **Done** |
| SRS product FRs (W1–W4.4, W3.x features) | **Done** |
| Launch ops (W4.5 live E2E, W4.6 live prod) | **Ops pending** (helpers/docs in repo) |
| Tech stack (after Vercel override) | Aligned (custom CSS / `fetch` intentional) |

---

## Compliance by week (SRS FRs)

### Week 1 — Foundation

| FR | Status | Notes |
|----|--------|-------|
| W1.1 Customer registration | Done | Email/password, bcrypt, customer role |
| W1.2 Login | Done | JWT cookies, role redirect; branded auth card |
| W1.3 Logout | Done | Cookie clear + revoke |
| W1.4 Roles & permissions | Done | Backend 403 + frontend guards |
| W1.5 Database schema | Done | `001_init.sql` + `002_week4.sql` (fulfillment_type) |
| W1.6 Frontend boilerplate | Done* | Next.js + TS; custom CSS / `fetch` (not Tailwind/Axios) — intentional |
| W1.7 CI/CD | Done* | GitHub Actions; no Docker/DO (matches override) |

### Week 2 — Customer purchase

| FR | Status | Notes |
|----|--------|-------|
| W2.1 Browse products | Done* | Grid + pagination; stars decorative (post-MVP reviews) |
| W2.2 Search | Done | Debounced search |
| W2.3 Product details | Done | Works + verified badge |
| W2.4 Shopping cart | Done | Mobile-first; min-order hint |
| W2.5 Checkout | Done | Pickup/delivery + min order |
| W2.6 Payment verification | Done | Verify + webhook; mock if no Paystack key |
| W2.7 Order history | Done | Responsive tables |

### Week 3 — Supplier & admin

| FR | Status | Notes |
|----|--------|-------|
| W3.1 Supplier registration | Done | Upload + pending; doc guidance on form; email via Resend if configured |
| W3.2 Supplier dashboard | Done | Sidebar shell |
| W3.3 Product CRUD | Done | CRUD + multipart image upload |
| W3.4 Stock management | Done | Adjustments; stock decreases on purchase |
| W3.5 Order fulfillment | Done | Status workflow |
| W3.6 Admin dashboard | Done | Stats + tables + Contacts inbox |
| W3.7 Supplier approval | Done | Approve/reject; email if Resend configured |

### Week 4 — Public pages & launch

| FR | Status | Notes |
|----|--------|-------|
| W4.1 Home | Done | Hero, How It Works, featured, CTA, trust |
| W4.2 About | Done | Branded static page |
| W4.3 Contact | Done | Persists to `contact_submissions` / in-memory; admin list |
| W4.4 Footer | Done | Quick Links, Contact, Suppliers |
| W4.5 Testing (in-repo) | Done* | Unit + auth smoke + `smoke:week4`; Playwright optional post-MVP |
| W4.6 Production deployment | Ops | Runbook/Vercel/VPS docs ready; **live URL not verified** |
| W4.7 Launch docs | Done | `DOVA_RUNBOOK.md`, `DOVA_API.md`, changelog |

**MVP product score:** **100% codebase.** Remaining items are **ops only** (W4.6 live verify, Paystack staging proof).

---

## PRD must-haves vs reality

| Must-have | In product code? |
|-----------|------------------|
| Customer register / login / roles | Yes |
| Browse / search / product details | Yes |
| Cart / checkout / Paystack | Yes (mock without keys) |
| Order history | Yes |
| Supplier register / dashboard / CRUD / stock / fulfillment | Yes |
| Admin dashboard / supplier approval | Yes (+ contacts) |
| Home / About / Contact / Footer | Yes |
| Mobile-usable storefront | Yes |
| 20+ sample products | Yes |
| 5+ test suppliers | Yes (`db:seed:week3`) |
| Min order pickup/delivery | Yes — ₦3,000 / ₦5,000 |
| 10+ Paystack test txs | Ops — needs staging keys (not a code gap) |

---

## SDD / stack (accepted for MVP)

| Original SDD / PRD | Current repo |
|--------------------|--------------|
| DigitalOcean + Docker | Overridden → Vercel and/or VPS Node |
| NestJS 10 | NestJS 11 |
| Tailwind CSS v4 / Axios | Custom CSS + `fetch` (intentional) |
| PostgreSQL + Redis | Supported |
| Paystack | Implemented (+ mock) |

---

## Remaining (ops only — not codebase MVP gaps)

1. Provision and verify staging/production URL  
2. Run ≥10 Paystack test transactions on staging  
3. Soft-launch / go-no-go checklist with business owners  
4. Optional later: Playwright E2E, Swagger, Slack alerts  

---

## Bottom line

- **MVP codebase: 100% complete.**  
- **Go-live: not complete** until staging + Paystack proof.  
- See `CHANGELOG.md` **0.3.0**, `DOVA_RUNBOOK.md`, `DOVA_API.md`.
