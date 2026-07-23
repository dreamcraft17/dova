# DOVA - Product Requirements Document (PRD)
## Aggressive 4-Week Timeline | Versi 2.0

---

## 1. Ringkasan Eksekutif

DOVA MVP akan diluncurkan dalam **4 minggu** dengan aggressive scope control dan parallel development tracks. Fokus pada **critical path only**: authentication → customer purchase flow → supplier onboarding → admin oversight.

**Timeline:** July 21 - August 17, 2026

---

## 2. Strategy: Parallel Tracks + Scope Minimalism

```
Week 1 (Jul 21-27)  ├─ Track A: Backend Foundation (Auth, DB, API)
                    └─ Track B: Frontend Setup (Next.js, UI kit)

Week 2 (Jul 28-Aug 3) ├─ Track A: Products & Orders (Backend)
                      └─ Track B: Products & Cart (Frontend)

Week 3 (Aug 4-10)    ├─ Track A: Supplier & Admin (Backend)
                     └─ Track B: Supplier & Admin (Frontend)

Week 4 (Aug 11-17)   ├─ Track A: Integration & Testing
                     └─ Track B: Public Pages & Launch
```

---

## 3. Phase Breakdown (4 Minggu)

### **PHASE 1: Foundation & Auth (Week 1)**
**Goal:** MVP infrastructure, authentication, data layer ready.

**Deliverable:**
- PostgreSQL database (schema)
- NestJS API server (basic)
- User authentication (register, login, JWT)
- Admin bootstrap
- Next.js frontend boilerplate
- Design system/UI kit (Tailwind)
- CI/CD pipeline (GitHub Actions basic)

**Pages/Features:**
- Login page
- Register page
- Basic role system (customer, supplier, admin)

**Success Metrics:**
- ✓ Login/Register fully functional
- ✓ JWT tokens issued and validated
- ✓ Database schema deployed
- ✓ CI/CD basic pipeline working

**Scope Cut:**
- No email verification (MVP)
- No password reset (MVP)
- No 2FA
- No social login

---

### **PHASE 2: Customer Purchase Flow (Week 2)**
**Goal:** Customer can browse, search, add to cart, checkout, and pay.

**Deliverable:**
- Products catalog (CRUD)
- Search & filtering
- Shopping cart
- Checkout + Paystack integration
- Order creation & tracking
- Customer dashboard (order history)

**Pages/Features:**
- Home page (basic hero + CTA)
- Products page (grid, search, filter)
- Product Details page
- Cart page
- Checkout page
- Customer Dashboard

**Success Metrics:**
- ✓ 20+ sample products seeded
- ✓ Search + filter working
- ✓ Cart persists across sessions
- ✓ 10+ successful test transactions via Paystack
- ✓ Order history visible to customer

**Scope Cut:**
- No related products suggestions
- No product reviews/ratings
- No wishlists
- No product recommendations
- No advanced filtering (category filter only, no price range)

---

### **PHASE 3: Supplier & Admin Basics (Week 3)**
**Goal:** Suppliers can register and list products. Admin can approve and manage.

**Deliverable:**
- Supplier registration flow
- Supplier dashboard (product CRUD)
- Stock management
- Admin dashboard (basic approval flow)
- Order fulfillment (status updates)

**Pages/Features:**
- Supplier Registration page
- Supplier Dashboard (products, orders)
- Admin Dashboard (pending approvals, users, products, orders)

**Success Metrics:**
- ✓ 5+ test suppliers registered
- ✓ Suppliers can list products
- ✓ Admin can approve/reject suppliers
- ✓ Suppliers can update order status
- ✓ Stock decreases on purchase

**Scope Cut:**
- No detailed verification document review UI (simple upload + on-form guidance for accepted types: CAC, government ID, optional address proof)
- No bulk product import
- No supplier analytics
- No export features (admin)

---

### **PHASE 4: Public Pages & Launch (Week 4)**
**Goal:** Complete platform, public pages, testing, deployment.

**Deliverable:**
- About Us page
- Contact Us page (basic form)
- Footer
- Comprehensive testing (unit, integration, E2E)
- Mobile responsiveness finalization
- Performance optimization
- Production deployment
- Monitoring setup
- Runbook documentation

**Pages/Features:**
- About Us (static)
- Contact Us (form + info)
- Footer (all pages)
- Mobile polish across all pages

**Success Metrics:**
- ✓ All 13 pages live
- ✓ 0 critical bugs
- ✓ <2s P95 load time (desktop)
- ✓ Mobile responsive (tested on real devices)
- ✓ Production deployment successful
- ✓ Monitoring + alerts active

**Scope Cut:**
- No advanced analytics
- No push notifications
- No email notifications (MVP)
- No SMS
- No multi-language support

---

## 4. Feature Priority Matrix (Must-Have vs Nice-to-Have)

### ✅ MUST-HAVE (Phase 1-4)

| Feature | Phase | Effort |
|---------|-------|--------|
| User Registration (Customer) | 1 | S |
| User Login | 1 | S |
| User Roles | 1 | M |
| Browse Products | 2 | M |
| Search Products | 2 | M |
| Product Details | 2 | M |
| Shopping Cart | 2 | L |
| Checkout | 2 | M |
| Paystack Payment | 2 | L |
| Order History | 2 | M |
| Supplier Registration | 3 | M |
| Supplier Dashboard | 3 | L |
| Add/Edit/Delete Products | 3 | L |
| Stock Management | 3 | M |
| Order Fulfillment | 3 | M |
| Admin Dashboard | 4 | L |
| Supplier Approval | 3 | M |
| Home Page | 4 | S |
| About Us Page | 4 | S |
| Contact Us Page | 4 | M |

**Legend:** S=Small (1-2h), M=Medium (3-5h), L=Large (6-10h)

---

### ❌ OUT OF SCOPE (Future Phases)

- Product reviews & ratings
- Wishlists
- In-app messaging
- Multiple payment gateways (Paystack only)
- Delivery tracking/logistics
- Discount codes/coupons
- Multi-language support
- SMS/Email notifications
- Supplier storefront pages
- Advanced admin analytics
- Password reset
- Email verification
- Product recommendations
- Price range filtering
- Bulk import
- Export to CSV

---

## 5. Dev Team Structure (Recommended: 3-4 people)

| Role | Effort | Responsibilities |
|------|--------|------------------|
| Backend Lead | Full-time | NestJS API, Database, Paystack integration |
| Frontend Lead | Full-time | Next.js, UI, all pages |
| QA/DevOps | Full-time | Testing, CI/CD, deployment, monitoring |
| (Optional) Product/PM | Part-time | Requirements, stakeholder communication |

**Sprint:** 2x per week sync + async daily updates

---

## 6. Tech Stack (Locked)

**Frontend:**
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS v4
- Axios (API calls)

**Backend:**
- Node.js 20 LTS
- NestJS 10
- PostgreSQL 15
- Redis (sessions)
- Docker

**Infrastructure:**
- DigitalOcean (app servers: 2x 8GB)
- PostgreSQL managed (DigitalOcean)
- Redis managed (DigitalOcean)
- Cloudflare (CDN)
- GitHub Actions (CI/CD)

**Payment:**
- Paystack (only)

**Hosting:**
- DigitalOcean App Platform (auto-scaling)

---

## 7. Risk Management (4-Week Aggressive Timeline)

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Paystack integration delays | Medium | High | **Start integration Day 1 of Week 2** |
| Database performance issues | Low | High | Use managed DB with auto-scaling |
| Scope creep | High | Critical | **Strict feature freeze after Week 1** |
| Testing gaps | Medium | High | **Daily E2E smoke tests from Week 3** |
| Mobile responsiveness | Medium | Medium | Test on real devices from Week 2 |
| Payment webhook issues | Medium | High | Extensive testing in Week 4 |

**Mitigation Strategy:** Risk review every Mon/Wed (standup)

---

## 8. Scope Freeze & Change Control

**Scope Freeze:** End of Week 1 (July 27, 2026)

After scope freeze:
- No new features added
- Only critical bug fixes
- Documentation updates only

**If new requirements emerge:**
1. Log as "Future Phase" 
2. Defer until Phase 2 (Post-Launch)
3. Do not interrupt current phase

---

## 9. Definition of Done (Per Feature)

A feature is **DONE** when:

1. **Code:** Written, peer-reviewed, merged to main
2. **Testing:** Unit tests + Integration tests pass (80%+ coverage)
3. **Documentation:** API doc, DB schema, README updated
4. **E2E:** End-to-end flow tested on staging
5. **Mobile:** Tested on real mobile device
6. **Performance:** <2s load time verified
7. **Accessibility:** Basic WCAG AA compliance

---

## 10. Daily Standup & Sync

**Monday & Wednesday (10am):**
- What shipped last cycle?
- Blockers?
- Risk updates?
- Demo (if ready)

**Async (Slack):**
- EOD updates: What I did, what's next, blockers
- Code review 24-hour SLA

---

## 11. Testing Strategy (Compressed)

| Phase | Unit | Integration | E2E | Manual |
|-------|------|-------------|-----|--------|
| 1 | Daily | Daily | N/A | EOD |
| 2 | Daily | Daily | Daily | EOD |
| 3 | Daily | Daily | Daily | EOD |
| 4 | All | All | All | Full |

**Test Environment:** Staging mirrors production (DigitalOcean)

**Smoke Test (daily):**
```
- Login (customer, supplier, admin)
- Browse products
- Add to cart
- Checkout (test Paystack)
- View order history
```

---

## 12. Deployment Strategy

**Staging:** Auto-deploy on every merge to `staging` branch  
**Production:** Manual deployment Friday (or agreed upon)

**Blue-Green Deployment:**
1. Deploy to new instances
2. Health checks pass
3. Switch load balancer
4. Keep old instances for 1 hour (rollback if needed)

---

## 13. Success Criteria (Launch Day)

✅ All 13 pages live  
✅ 0 critical bugs  
✅ Customer purchase flow working end-to-end  
✅ Supplier can register and list products  
✅ Admin can approve suppliers  
✅ Order history visible to customers  
✅ <2s P95 page load time  
✅ Mobile responsive (tested)  
✅ Uptime >99% on staging (24h test)  
✅ Documentation complete  

---

## 14. Post-Launch Roadmap (Phase 2+)

**Week 5+:**
- Email notifications
- Password reset
- Product reviews
- Wishlists
- Advanced filtering
- Admin analytics
- Supplier analytics
- Mobile app (native)

---

## 15. Dependencies & Blockers

**Required before start:**
- [ ] Paystack merchant account active
- [ ] DigitalOcean account provisioned
- [ ] GitHub repo created
- [ ] Design tokens finalized (Tailwind config)
- [ ] Database naming conventions agreed
- [ ] API versioning strategy agreed (/api/v1/)

---

## 16. Communication Plan

**Stakeholders Updates:**
- Sunday EOW: Status summary (shipped, blockers, ETA)
- Friday EOD: Week recap + next week plan

**Team Communication:**
- Slack #dova-dev (all updates)
- GitHub discussions (technical decisions)
- Notion/Wiki (documentation)

---

## 17. Launch Checklist (Week 4, Final)

**Code:**
- [ ] All tests passing
- [ ] No console errors
- [ ] No hardcoded secrets
- [ ] Build optimized (tree-shaking, minification)

**Infrastructure:**
- [ ] Production servers ready
- [ ] Database backups active
- [ ] Monitoring/alerts configured
- [ ] SSL certificates valid
- [ ] CDN purged

**Testing:**
- [ ] Smoke test passed
- [ ] Mobile tested (iOS/Android)
- [ ] Load testing (1000 concurrent users)
- [ ] Security scan (no OWASP issues)
- [ ] Payment flow tested end-to-end

**Documentation:**
- [ ] API docs (Swagger/OpenAPI)
- [ ] Runbook (how to deploy, rollback, monitor)
- [ ] README (setup, env vars, running locally)
- [ ] User guides (basic)

**Go-Live:**
- [ ] Flip DNS to production
- [ ] Monitor metrics (errors, latency, uptime)
- [ ] Support channel active (Slack)
- [ ] Rollback plan ready

---

## 18. Sign-Off

**Timeline:** July 21 - August 17, 2026 (4 weeks)  
**Status:** Ready for Development  
**Version:** 2.0 (Aggressive)  
**Last Updated:** July 20, 2026

---

**Approved by:** DN Tech Product Team  
**Next:** Start Phase 1 (Week 1) immediately after sign-off

