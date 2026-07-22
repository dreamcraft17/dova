# DOVA MVP - 4 Week Launch Plan
## Executive Summary

**Project:** Food supply chain marketplace  
**Timeline:** July 21 - August 17, 2026 (4 weeks)  
**Team:** 3-4 developers (1 backend lead, 1 frontend lead, 1 QA/DevOps)  
**Status:** Ready to start  

---

## 🎯 The Mission

Launch DOVA MVP with these core capabilities:
- ✅ Customers browse, purchase, and pay online (Paystack)
- ✅ Suppliers register, list products, and fulfill orders
- ✅ Admins verify suppliers and manage the platform
- ✅ Professional, trustworthy platform (green/white design)

**Target:** Validate business model with 100+ products, 5+ verified suppliers, first paying customers

---

## 📊 Weekly Breakdown

### Week 1: Foundation (22 hours)
```
Mon-Fri: Backend + Frontend setup in parallel

Deliverables:
├─ Login/Register fully working
├─ Database schema deployed (10 tables)
├─ Next.js frontend boilerplate
├─ GitHub Actions CI/CD (basic)
├─ User roles system (customer/supplier/admin)
└─ Staging environment ready

Effort: 22 hours (tech lead: 16h, full stack: 6h)
```

### Week 2: Customer Purchase Flow (28 hours)
```
Mon-Fri: Focus on critical path = customer paying

Deliverables:
├─ Browse & search products (grid, pagination)
├─ Shopping cart (persistent)
├─ Checkout + Paystack payment integration
├─ Order confirmation & history
├─ 20+ sample products seeded
└─ 10+ successful test transactions

Effort: 28 hours (backend: 12h, frontend: 16h)
Status: Core MVP flow functional
```

### Week 3: Supplier & Admin (30 hours)
```
Mon-Fri: Enable suppliers to sell, admin to manage

Deliverables:
├─ Supplier registration with document upload
├─ Supplier dashboard (products CRUD, order tracking)
├─ Stock management
├─ Admin dashboard (approvals, users, products, orders)
├─ Order fulfillment workflow
└─ 5+ test suppliers registered & verified

Effort: 30 hours (backend: 15h, frontend: 15h)
Status: Full ecosystem in place
```

### Week 4: Polish & Launch (34 hours)
```
Mon-Wed: Testing & optimization
Thu-Fri: Production deployment & monitoring

Deliverables:
├─ Home, About Us, Contact Us pages
├─ Comprehensive testing (unit, integration, E2E)
├─ Performance optimization (<2s load time)
├─ Mobile responsiveness verification
├─ Production deployment (DigitalOcean)
├─ Monitoring & alerts active
└─ Documentation complete

Effort: 34 hours (QA: 15h, backend: 10h, frontend: 9h)
Status: Production ready, launch
```

**Total Effort: 114 hours** (~3 devs × 40h/week = sufficient)

---

## 🏗️ Tech Stack (Locked)

| Component | Choice | Why |
|-----------|--------|-----|
| Frontend | Next.js 16 + React 19 + TypeScript + Tailwind v4 | Fast, developer-friendly, great DX |
| Backend | NestJS + Node.js 20 | Enterprise-grade, type-safe, scalable |
| Database | PostgreSQL 15 (managed DigitalOcean) | Reliable, ACID, no ops burden |
| Cache | Redis (managed DigitalOcean) | Fast sessions, cart persistence |
| Payment | Paystack only | Single integration, test-friendly |
| Hosting | DigitalOcean App Platform | Auto-scaling, managed DB/Redis, cost-effective |
| CI/CD | GitHub Actions | Native to GitHub, easy setup |
| CDN | Cloudflare | Included, DDoS protection |

---

## 📋 Features (Locked - No Changes After Week 1)

### ✅ MUST-HAVE (Phase 1-4)

**Phase 1 (W1):**
- User registration (customer, supplier)
- User login (all roles)
- User logout
- Role-based access control
- Database schema
- Frontend boilerplate
- CI/CD pipeline

**Phase 2 (W2):**
- Browse products (grid, pagination)
- Search products (by name)
- Product details
- Shopping cart
- Checkout (delivery form)
- Paystack payment integration
- Order confirmation
- Order history

**Phase 3 (W3):**
- Supplier registration
- Supplier dashboard (CRUD products)
- Stock management
- Order fulfillment (status updates)
- Admin dashboard
- Supplier approval workflow

**Phase 4 (W4):**
- Home page
- About Us page
- Contact Us page
- Footer
- Comprehensive testing
- Production deployment

### ❌ OUT OF SCOPE (Post-MVP)

- Product reviews
- Wishlists
- Email notifications
- SMS notifications
- Multiple payment gateways
- Delivery tracking
- Discount codes
- Multi-language support
- Supplier storefronts
- Mobile app (native)
- Analytics dashboards
- Password reset
- Email verification

---

## 👥 Team Structure

| Role | FTE | Responsibilities |
|------|-----|------------------|
| **Backend Lead** | 1.0 | NestJS API, database, Paystack integration |
| **Frontend Lead** | 1.0 | Next.js UI, all pages, responsiveness |
| **QA/DevOps** | 1.0 | Testing, CI/CD, deployment, monitoring |
| **PM (optional)** | 0.5 | Requirements, stakeholder communication |

**Synchronization:**
- Monday 10am: Full team standup
- Wednesday 10am: Risk review + demo
- Async: Slack #dova-dev, GitHub discussions
- Daily: EOD status update (Slack)

---

## ⚠️ Risk Management

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Paystack integration delays | Medium | High | **Start Day 1 Week 2 with test account** |
| Scope creep | High | Critical | **Feature freeze after Week 1** |
| Database performance | Low | High | Managed DB with auto-scaling |
| Testing gaps | Medium | High | Daily smoke tests from Day 1 |
| Mobile responsiveness | Medium | Medium | Real device testing from Week 2 |
| Payment webhook issues | Medium | High | 3 days dedicated testing in Week 4 |

**Golden Rule:** If it's not in the SRS, it's out of scope. Create a "Phase 2" backlog instead.

---

## ✨ Success Criteria (Launch Day)

**Technical:**
- ✅ 0 critical bugs
- ✅ <2s P95 page load time
- ✅ >99% uptime (24-hour test)
- ✅ Mobile responsive (iOS/Android real device)
- ✅ Paystack integration working flawlessly

**Functional:**
- ✅ 13 pages live and working
- ✅ Customer can register → purchase → pay end-to-end
- ✅ Supplier can register → list products → fulfill orders
- ✅ Admin can verify suppliers and manage platform
- ✅ 20+ products, 5+ verified suppliers, working system

**Business:**
- ✅ Platform demonstrates business model
- ✅ Payment flow proves concept
- ✅ Supplier + customer onboarding working
- ✅ Ready for initial marketing/user acquisition

---

## 📚 Documentation Bundle

This package includes:

1. **DOVA_PRD_AGGRESSIVE_4W.md** - Product requirements (phases, timelines, features)
2. **DOVA_SDD_AGGRESSIVE_4W.md** - System design (architecture, database, API, deployment)
3. **DOVA_SRS_AGGRESSIVE_4W.md** - Detailed requirements (all features with acceptance criteria)
4. **This file** - Quick reference

**How to use:**
- **PM/PO:** Start with PRD (overview + phase breakdown)
- **Backend:** Use SDD (architecture, database, API spec)
- **Frontend:** Use SRS (page-by-page requirements, API usage)
- **QA:** Use SRS (acceptance criteria, test cases)
- **Daily standup:** Refer to weekly timeline in this summary

---

## 🚀 Getting Started

### Prerequisites (Before July 21)
- [ ] Paystack merchant account created
- [ ] DigitalOcean account with billing setup
- [ ] GitHub repository initialized
- [ ] Tailwind CSS design tokens finalized
- [ ] Team GitHub access configured
- [ ] Slack channel #dova-dev created
- [ ] Database naming conventions agreed

### Day 1 (Monday, July 21)
1. **Backend team:** Create NestJS project, database schema
2. **Frontend team:** Create Next.js project, setup Tailwind
3. **DevOps:** Configure GitHub Actions, DigitalOcean staging
4. **All:** Daily standup at 10am

### Day 1-5 (Week 1)
- Auth endpoints ready (register, login, logout)
- Frontend login/register pages
- Database deployed
- CI/CD first deploy

### End of Week 1 (Friday, July 27)
- **Freeze scope** - No more feature adds
- Confirm team capacity
- Confirm all prerequisites met
- Ready to start Week 2

---

## 📞 Communication Plan

**Daily:**
- Slack #dova-dev: EOD status (1 line per person)
- Code reviews: 24-hour SLA

**Weekly:**
- Monday 10am: Standup (30 min)
  - What shipped
  - Blockers
  - Current sprint (weekly theme)
  
- Wednesday 10am: Risk review (20 min)
  - Risks updated
  - Demo if ready
  
- Friday: Week recap (async)
  - What shipped
  - Next week plan

**Escalation:**
- Blocker: @mention in Slack immediately
- Architecture question: GitHub discussion (async)
- Risk: Escalate in Wednesday standup

---

## 📈 Post-Launch Roadmap (Phase 2+)

**Week 5-8 (Month 2):**
- Email notifications
- Password reset + email verification
- Product reviews & ratings
- Advanced filtering (price, rating)

**Week 9-12 (Month 3):**
- Supplier analytics
- Admin analytics
- Wishlists
- In-app messaging

**Month 4+:**
- Mobile app (native)
- SMS notifications
- Multiple payment methods
- Delivery tracking
- Marketplace expansion

---

## 💡 Key Principles for 4-Week Success

1. **Scope discipline:** Only must-haves. Everything else is Phase 2.
2. **Parallelization:** Backend, frontend, DevOps work simultaneously from Day 1.
3. **Daily testing:** Smoke tests every day. Bugs caught early = fast fixes.
4. **Documentation:** Comment code well. Helps debugging and onboarding.
5. **Communication:** Blockers surfaced immediately. No surprises.
6. **Customer obsession:** Every decision optimized for launch date.
7. **Quality baseline:** 0 critical bugs on launch day. Period.

---

## 📋 Quick Checklist (Print This)

### Week 1
- [ ] Auth endpoints complete
- [ ] Database deployed
- [ ] Frontend boilerplate done
- [ ] CI/CD working
- [ ] All unit tests passing
- [ ] Staging accessible

### Week 2
- [ ] Product browse working
- [ ] Cart persistent
- [ ] Paystack integration (test mode)
- [ ] 20+ products seeded
- [ ] 10+ test transactions
- [ ] Customer E2E flow passing

### Week 3
- [ ] Supplier registration working
- [ ] Supplier dashboard live
- [ ] Admin approval workflow
- [ ] 5+ test suppliers approved
- [ ] Order fulfillment working
- [ ] All E2E flows passing

### Week 4
- [ ] Public pages (Home, About, Contact) live
- [ ] All tests passing (unit + integration + E2E)
- [ ] <2s load time verified
- [ ] Mobile tested on real devices
- [ ] Production deployed
- [ ] Monitoring active
- [ ] Runbook ready
- [ ] Team trained
- [ ] ✅ LAUNCH!

---

## 📞 Questions?

Refer to:
- **"What do I build?"** → SRS (detailed requirements)
- **"How do I build it?"** → SDD (architecture & database)
- **"When do I build it?"** → PRD (phases & timeline)
- **"Is this in scope?"** → This summary (features list)

---

**Prepared by:** DN Tech  
**Date:** July 20, 2026  
**Status:** Ready to launch

---

## Quick Links

- [DOVA PRD (Aggressive 4W)](./DOVA_PRD_AGGRESSIVE_4W.md)
- [DOVA SDD (Aggressive 4W)](./DOVA_SDD_AGGRESSIVE_4W.md)
- [DOVA SRS (Aggressive 4W)](./DOVA_SRS_AGGRESSIVE_4W.md)

