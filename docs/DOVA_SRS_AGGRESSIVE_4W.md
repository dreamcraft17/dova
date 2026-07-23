# DOVA - Software Requirements Specification (SRS)
## Aggressive 4-Week Timeline | Versi 2.0

---

## 1. Overview

Focused SRS dengan **strict scope minimalism**. Setiap requirement harus ada acceptance criteria yang jelas dan testable.

**Document format:** By Week + By Feature + Acceptance Criteria

---

## 2. WEEK 1: Foundation & Auth (Jul 21-27)

### [FR-W1.1] User Registration (Customer)

**Feature:** Allow customer to create account.

**Requirements:**
- Email, password, confirm password, full name
- Email must be unique
- Password ≥ 8 characters
- Password hashing (bcrypt 12 rounds)
- Validation: email format, matching passwords
- Success: "Account created. Log in to continue."

**Acceptance Criteria:**
- [ ] Form accepts valid input
- [ ] Form rejects invalid email
- [ ] Form rejects mismatched passwords
- [ ] Form rejects email already registered
- [ ] Account created in DB with hashed password
- [ ] Role set to 'customer' by default
- [ ] User can proceed to login

**API Spec:**
```
POST /api/v1/auth/register
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "password": "securepass123",
  "confirmPassword": "securepass123"
}

Response (201): { id, email, fullName, role, createdAt }
Response (400): { error: "Email already registered" }
```

**Test Cases:**
1. Register with valid data → success
2. Register with invalid email → error
3. Register with short password → error
4. Register with duplicate email → error
5. Register with mismatched passwords → error

**Effort:** 3 hours

---

### [FR-W1.2] User Login

**Feature:** All users (customer, supplier, admin) can login.

**Requirements:**
- Email + password fields
- Verify password against hash
- Issue JWT tokens on success
- Access token: 15 min, Refresh token: 7 days
- Redirect based on role (customer/supplier/admin → respective dashboard)
- Generic error message "Invalid credentials"
- httpOnly cookies for token storage

**Acceptance Criteria:**
- [ ] Login form accepts email & password
- [ ] Valid credentials grant access
- [ ] Invalid credentials show error
- [ ] JWT tokens issued correctly
- [ ] Customer redirected to /customer/dashboard
- [ ] Supplier redirected to /supplier/dashboard
- [ ] Admin redirected to /admin/dashboard
- [ ] Tokens persist in secure httpOnly cookies
- [ ] Session persists across page refreshes

**API Spec:**
```
POST /api/v1/auth/login
{
  "email": "john@example.com",
  "password": "securepass123"
}

Response (200): {
  user: { id, email, role, fullName },
  accessToken: "eyJhbGc...",
  refreshToken: "eyJhbGc..."
}

Response (401): { error: "Invalid credentials" }
```

**Test Cases:**
1. Login with valid customer credentials → customer dashboard
2. Login with valid supplier credentials → supplier dashboard
3. Login with valid admin credentials → admin dashboard
4. Login with invalid password → error
5. Login with non-existent email → error
6. Token refresh after expiry → new token issued

**Effort:** 4 hours

---

### [FR-W1.3] User Logout

**Feature:** Clear session and logout.

**Requirements:**
- Logout button on all protected pages
- Invalidate JWT
- Clear cookies
- Redirect to home

**Acceptance Criteria:**
- [ ] Logout button visible
- [ ] Clicking logout clears session
- [ ] Redirects to home
- [ ] Cannot access protected pages after logout

**API Spec:**
```
POST /api/v1/auth/logout
Headers: Authorization: Bearer <token>

Response (200): { message: "Logged out" }
```

**Test Cases:**
1. Logout → redirected to home
2. Try to access protected page after logout → redirected to login

**Effort:** 1 hour

---

### [FR-W1.4] User Roles & Permissions

**Feature:** Role-based access control.

**Requirements:**
- 3 roles: customer, supplier, admin
- Check role on every protected endpoint
- Return 403 Forbidden if unauthorized
- Frontend guards (redirect to login if not authenticated)

**Acceptance Criteria:**
- [ ] Customer cannot access /supplier/dashboard
- [ ] Supplier cannot access /admin/dashboard
- [ ] Admin can access all pages
- [ ] API returns 403 for unauthorized roles
- [ ] Invalid token returns 401

**Test Cases:**
1. Customer tries to access supplier endpoint → 403
2. Supplier tries to access admin endpoint → 403
3. Admin accesses all endpoints → 200
4. No token on protected endpoint → 401

**Effort:** 2 hours

---

### [FR-W1.5] Database Schema Setup

**Feature:** Initialize PostgreSQL schema.

**Requirements:**
- Create tables: users, supplier_profiles, sessions, categories, products, orders, order_items, payment_logs, contact_submissions
- Proper indexes for performance
- Constraints (PK, FK, unique, not null)
- Seed categories (Vegetables, Fruits, Dairy, Grains, Meat, etc.)

**Acceptance Criteria:**
- [ ] All tables created
- [ ] Indexes on frequently queried columns
- [ ] Categories seeded with 8+ items
- [ ] Foreign keys enforced
- [ ] Schema tested in staging DB

**Effort:** 2 hours

---

### [FR-W1.6] Frontend Boilerplate

**Feature:** Setup Next.js project with basic structure.

**Requirements:**
- Next.js 16 + TypeScript + Tailwind v4
- Folder structure: /pages, /components, /lib, /styles
- Design tokens in Tailwind config (green theme)
- API client setup (axios)
- Auth context/hook
- Responsive layout template

**Acceptance Criteria:**
- [ ] Next.js builds without errors
- [ ] Tailwind compiles
- [ ] Auth context available in all pages
- [ ] API client configured for /api/v1/
- [ ] Mobile responsive baseline

**Effort:** 3 hours

---

### [FR-W1.7] CI/CD Pipeline (Basic)

**Feature:** GitHub Actions for build & deploy to staging.

**Requirements:**
- Test backend on PR
- Build Docker image
- Auto-deploy to DigitalOcean staging on merge to main
- Slack notification on deployment

**Acceptance Criteria:**
- [ ] PR triggers test suite
- [ ] Build creates Docker image
- [ ] Push to main auto-deploys to staging
- [ ] Staging URL accessible
- [ ] Slack channel receives notifications

**Effort:** 3 hours

---

### **WEEK 1 DELIVERABLES (Sum: ~22 hours)**
✅ Login/Register fully functional  
✅ Database schema deployed  
✅ Frontend boilerplate ready  
✅ CI/CD pipeline working  
✅ Role-based access control  

---

## 3. WEEK 2: Customer Purchase Flow (Jul 28-Aug 3)

### [FR-W2.1] Browse Products

**Feature:** Display all products in grid.

**Requirements:**
- Grid layout (3 cols desktop, 2 tablet, 1 mobile)
- Product card: image, name, price, supplier name
- Pagination (20 items/page, "Load More")
- Click product → Product Details
- Lazy load images
- Verified supplier badge

**Acceptance Criteria:**
- [ ] Products load in grid
- [ ] Grid responsive on all devices
- [ ] Pagination works (20/page)
- [ ] Click product navigates to details
- [ ] Images load without layout shift
- [ ] Empty state shows if no products

**API Spec:**
```
GET /api/v1/products?page=1&limit=20
Response: {
  data: [...],
  pagination: { page: 1, limit: 20, total: 150 }
}
```

**Test Cases:**
1. Load products page → grid displays
2. Pagination next → loads next 20
3. Click product → details page
4. Mobile view → single column

**Effort:** 4 hours

---

### [FR-W2.2] Search Products

**Feature:** Search products by name.

**Requirements:**
- Search input on Products page
- Real-time search (debounce 300ms)
- Case-insensitive substring match
- Show results with pagination
- Clear button to reset

**Acceptance Criteria:**
- [ ] Type in search → results update
- [ ] No match → "No products found"
- [ ] Clear button resets search
- [ ] Search works with pagination

**API Spec:**
```
GET /api/v1/products?search=tomato&page=1
```

**Test Cases:**
1. Search "tomato" → returns matching products
2. Search gibberish → "No products found"
3. Clear search → show all products again

**Effort:** 2 hours

---

### [FR-W2.3] Product Details

**Feature:** Full product page with purchase option.

**Requirements:**
- Large image
- Name, price, description, category
- Supplier name + verified badge
- Stock status (In Stock / Out of Stock)
- Quantity selector (1-100)
- Add to Cart button
- Back button to Products

**Acceptance Criteria:**
- [ ] Product details display correctly
- [ ] Image loads without layout shift
- [ ] Quantity selector works (1-100)
- [ ] Add to Cart button works (if in stock)
- [ ] Out of stock hides button
- [ ] Back button works

**API Spec:**
```
GET /api/v1/products/:id
Response: {
  id, name, description, price, stock,
  category, image, supplier: { name, verified }
}
```

**Test Cases:**
1. View product details → all info displays
2. Out of stock product → button hidden
3. Quantity selector → min 1, max 100
4. Add to cart → item added

**Effort:** 3 hours

---

### [FR-W2.4] Shopping Cart

**Feature:** Cart management.

**Requirements:**
- Add products from Products or Details page
- Cart persists in DB + Redis cache
- Cart icon shows item count
- Cart page: list items, update qty, remove, subtotal
- "Proceed to Checkout" button
- Verify stock before adding

**Acceptance Criteria:**
- [ ] Add to cart → item added
- [ ] Cart icon shows count
- [ ] Cart persists across sessions
- [ ] Can update quantity
- [ ] Can remove items
- [ ] Subtotal calculates correctly
- [ ] Out of stock items → error
- [ ] Empty cart → message + link to products

**API Spec:**
```
POST /api/v1/cart/add
{ productId, quantity }

GET /api/v1/cart
Response: {
  items: [{ product, quantity, subtotal }],
  total
}

PUT /api/v1/cart/items/:itemId { quantity }
DELETE /api/v1/cart/items/:itemId
```

**Test Cases:**
1. Add product → cart updated
2. Update quantity → subtotal recalculates
3. Remove item → cart updated
4. Refresh page → cart persists
5. Add out of stock → error

**Effort:** 5 hours

---

### [FR-W2.5] Checkout

**Feature:** Order confirmation & payment form.

**Requirements:**
- Order summary (items, qty, subtotal, total)
- Delivery form: name, address, phone
- Validation (all required, phone format)
- Pre-fill from profile if available
- Paystack payment integration
- "Pay Now" button
- Confirmation page after payment

**Acceptance Criteria:**
- [ ] Order summary accurate
- [ ] Form validates correctly
- [ ] Fields pre-filled if data available
- [ ] Paystack redirects on "Pay Now"
- [ ] Confirmation shows order number
- [ ] Order created in DB before payment
- [ ] Failed payment → error message

**API Spec:**
```
POST /api/v1/orders
{
  deliveryName, deliveryAddress, deliveryPhone
}
Response: { id, orderNumber, total, status: 'pending' }

POST /api/v1/payments/initialize
{ orderId, amount }
Response: { authorization_url: "https://checkout.paystack.com/..." }
```

**Test Cases:**
1. Fill checkout form → order created
2. Click Pay Now → redirected to Paystack
3. Successful payment → confirmation shown
4. Failed payment → error message
5. Order visible in order history

**Effort:** 6 hours

---

### [FR-W2.6] Payment Verification

**Feature:** Verify Paystack payment & update order.

**Requirements:**
- Verify payment on return from Paystack
- Update order status to 'paid'
- Store Paystack reference
- Webhook verification (optional, recommended)
- Handle duplicate webhooks (idempotent)
- Log all payment attempts

**Acceptance Criteria:**
- [ ] Payment verified correctly
- [ ] Order status updated to 'paid'
- [ ] Order number persists
- [ ] Payment reference stored
- [ ] Duplicate webhooks handled safely
- [ ] Failed verifications logged

**API Spec:**
```
POST /api/v1/payments/verify?reference=xxx
Response: { orderId, status: 'paid' }

POST /api/v1/payments/webhook (Paystack)
{ event, data: { reference, amount, metadata } }
```

**Test Cases:**
1. Verify successful payment → order paid
2. Verify failed payment → order remains pending
3. Duplicate webhook → idempotent (no duplicate order)
4. Invalid reference → error

**Effort:** 4 hours

---

### [FR-W2.7] Order History (Customer)

**Feature:** View past orders.

**Requirements:**
- Customer dashboard shows all orders
- Order list: order number, date, total, status
- Status badge (pending, paid, processing, shipped, delivered)
- Click order → full details
- Sort by date (newest first)
- Empty state if no orders

**Acceptance Criteria:**
- [ ] All customer orders visible
- [ ] Status displayed correctly
- [ ] Click order → details page
- [ ] Sorted by date (newest first)
- [ ] No orders → message

**API Spec:**
```
GET /api/v1/orders
Response: {
  data: [{
    id, orderNumber, date, total, status,
    items: [{ product, qty, price }]
  }]
}

GET /api/v1/orders/:id
Response: full order details
```

**Test Cases:**
1. View order history → all orders shown
2. Click order → details displayed
3. Multiple orders → sorted by date
4. No orders → "You haven't placed any orders yet"

**Effort:** 3 hours

---

### **WEEK 2 DELIVERABLES (Sum: ~28 hours)**
✅ Full customer purchase flow working  
✅ Browse, search, view products  
✅ Shopping cart  
✅ Checkout + Paystack payment  
✅ Order history  
✅ 20+ sample products seeded  

---

## 4. WEEK 3: Supplier & Admin (Aug 4-10)

### [FR-W3.1] Supplier Registration

**Feature:** New suppliers apply to sell.

**Requirements:**
- Form: business name, contact name, email, phone, password
- Document upload (verification) — **accepted types (MVP guidance on form):**
  - CAC / Business Name Registration (preferred for companies)
  - Valid government ID (NIN slip, National ID, Driver’s Licence, or International Passport)
  - Optional for farms: proof of farm/business address
- Format: PDF/JPG/PNG, max 5MB; one document is enough for MVP
- Submit → status 'pending'
- Confirmation message + reference number
- Email to applicant: "Under review"

**Acceptance Criteria:**
- [ ] Form accepts supplier info
- [ ] Document uploads (max 5MB, PDF/JPG/PNG)
- [ ] Form (or help text) lists accepted document types for verification
- [ ] Application stored with 'pending' status
- [ ] Confirmation message shown
- [ ] Email sent to applicant
- [ ] Email unique (no duplicate suppliers)

**API Spec:**
```
POST /api/v1/suppliers/register
{
  businessName, contactName, email, phone,
  password, verificationDocs: [File]
}
Response: {
  id, status: 'pending',
  message: "Application submitted. We'll review..."
}
```

**Test Cases:**
1. Register with valid data → confirmation
2. Upload documents → stored
3. Duplicate email → error
4. Email sent to applicant

**Effort:** 4 hours

---

### [FR-W3.2] Supplier Dashboard

**Feature:** Supplier workspace.

**Requirements:**
- Overview: pending approval status
- Products list: name, price, stock, status
- "Add Product" button
- Edit/Delete product actions
- Orders section: incoming customer orders
- Update order status (pending → processing → shipped → delivered)
- Search/filter products

**Acceptance Criteria:**
- [ ] Approved supplier can access dashboard
- [ ] Products listed correctly
- [ ] Can add/edit/delete products
- [ ] Can see incoming orders
- [ ] Can update order status
- [ ] Status changes visible to customer

**API Spec:**
```
GET /api/v1/suppliers/products
GET /api/v1/suppliers/orders
POST /api/v1/suppliers/products
PUT /api/v1/suppliers/products/:id
DELETE /api/v1/suppliers/products/:id
PUT /api/v1/suppliers/orders/:itemId/status
```

**Test Cases:**
1. Pending supplier → dashboard shows "Awaiting approval"
2. Approved supplier → can manage products
3. Add product → appears in catalog
4. Delete product → removed from catalog
5. Update order status → reflected to customer

**Effort:** 6 hours

---

### [FR-W3.3] Add/Edit/Delete Products (Supplier)

**Feature:** Product management for suppliers.

**Requirements:**
- Form fields: name, description, price, quantity, category, image
- Validation: price ≥ 1000, quantity ≥ 1
- Image upload (auto-resize to 400x400)
- Category dropdown
- Soft delete (hide from catalog, keep order history)
- Success/error messages

**Acceptance Criteria:**
- [ ] Form validates correctly
- [ ] Can add product
- [ ] Image uploads & stored
- [ ] Can edit product details
- [ ] Can delete product
- [ ] Deleted product hidden from customers
- [ ] Order history preserved after delete

**API Spec:**
```
POST /api/v1/suppliers/products
{ name, description, price, quantity, categoryId, image }

PUT /api/v1/suppliers/products/:id
{ name, description, price, quantity, categoryId, image }

DELETE /api/v1/suppliers/products/:id
```

**Test Cases:**
1. Add product with valid data → created
2. Add with invalid price → error
3. Edit product → changes saved
4. Delete product → hidden from catalog
5. Order placed before delete → still visible in order

**Effort:** 5 hours

---

### [FR-W3.4] Stock Management

**Feature:** Track and update inventory.

**Requirements:**
- Display current stock per product
- Manual stock adjustment (restock, damage, etc.)
- Auto-decrease on purchase
- Out of stock → hide from catalog
- Stock history log

**Acceptance Criteria:**
- [ ] Stock levels visible
- [ ] Can manually adjust stock
- [ ] Stock decreases on customer purchase
- [ ] Out of stock products hidden
- [ ] Stock history tracked

**API Spec:**
```
PUT /api/v1/suppliers/products/:id/stock
{ quantity, reason: 'restock' | 'damage' }

GET /api/v1/suppliers/products/:id/stock-history
```

**Test Cases:**
1. View stock levels → correct
2. Restock product → stock increases
3. Customer purchases → auto-decreases
4. Stock reaches 0 → hidden from catalog

**Effort:** 3 hours

---

### [FR-W3.5] Order Fulfillment (Supplier)

**Feature:** Supplier manages customer orders.

**Requirements:**
- List incoming orders
- Show customer name, address, items, total
- Status workflow: pending → processing → shipped → delivered
- Update status with timestamp
- Customer sees status updates in real-time

**Acceptance Criteria:**
- [ ] Orders listed correctly
- [ ] Can update status
- [ ] Status changes recorded
- [ ] Customer sees update immediately
- [ ] Cannot skip steps (pending → shipped not allowed)

**API Spec:**
```
GET /api/v1/suppliers/orders
Response: [{
  orderId, orderNumber, customerName, items: [{...}],
  createdAt
}]

PUT /api/v1/suppliers/orders/:itemId/status
{ status: 'processing' | 'shipped' | 'delivered' }
```

**Test Cases:**
1. Supplier views orders → all incoming orders shown
2. Update status to processing → customer sees update
3. Update status to shipped → order progresses
4. Complete delivery → order done

**Effort:** 3 hours

---

### [FR-W3.6] Admin Dashboard

**Feature:** Admin oversight.

**Requirements:**
- Overview: total users, suppliers, products, orders (last 30 days)
- Pending supplier registrations list
- User management: list, deactivate
- Product management: all products, deactivate if needed
- Orders view: all orders, filter by status/date
- Search across sections

**Acceptance Criteria:**
- [ ] Dashboard stats accurate
- [ ] Can approve/reject suppliers
- [ ] Can deactivate users
- [ ] Can manage products (view, deactivate)
- [ ] Can view all orders
- [ ] Only admin can access

**API Spec:**
```
GET /api/v1/admin/dashboard
GET /api/v1/admin/suppliers/pending
POST /api/v1/admin/suppliers/:id/approve
POST /api/v1/admin/suppliers/:id/reject
GET /api/v1/admin/users
GET /api/v1/admin/products
GET /api/v1/admin/orders
```

**Test Cases:**
1. Admin views dashboard → stats display
2. Pending suppliers shown
3. Approve supplier → status changes, email sent
4. Reject supplier → reason stored, email sent
5. Deactivate user → cannot login

**Effort:** 6 hours

---

### [FR-W3.7] Supplier Approval Workflow

**Feature:** Admin verifies and approves suppliers.

**Requirements:**
- List pending registrations
- View uploaded documents
- Approve button → status 'approved', email sent
- Reject button → require reason, email sent
- Approved suppliers can login immediately

**Acceptance Criteria:**
- [ ] Pending list shows correctly
- [ ] Can view documents
- [ ] Approve works → email sent
- [ ] Reject works with reason → email sent
- [ ] Approved supplier can login
- [ ] Rejected supplier notified

**API Spec:**
```
POST /api/v1/admin/suppliers/:id/approve
Response: { status: 'approved' }

POST /api/v1/admin/suppliers/:id/reject
{ reason: "Missing documentation" }
Response: { status: 'rejected' }
```

**Test Cases:**
1. View pending registrations → all shown
2. Approve supplier → email sent, can login
3. Reject supplier → reason recorded, email sent

**Effort:** 3 hours

---

### **WEEK 3 DELIVERABLES (Sum: ~30 hours)**
✅ Supplier registration working  
✅ Supplier dashboard with product management  
✅ Stock management  
✅ Order fulfillment  
✅ Admin dashboard complete  
✅ Supplier approval workflow  
✅ 5+ test suppliers registered & approved  

---

## 5. WEEK 4: Public Pages & Launch (Aug 11-17)

### [FR-W4.1] Home Page

**Feature:** Landing page.

**Requirements:**
- Header: logo, nav (Products, About, Contact, Login)
- Hero section: tagline explaining DOVA
- How It Works: 3-step flow
- Featured products (4-6 products)
- "Become a Supplier" CTA
- Trust messaging (verified suppliers)
- Footer: company info, links

**Acceptance Criteria:**
- [ ] Page loads correctly
- [ ] Navigation works
- [ ] Featured products clickable
- [ ] CTAs prominent
- [ ] Mobile responsive
- [ ] Trust messaging clear

**Effort:** 4 hours

---

### [FR-W4.2] About Us Page

**Feature:** Mission & values page.

**Requirements:**
- Company mission statement
- Explanation of verified supplier model
- Professional, trustworthy tone
- Static content (no CMS needed)

**Acceptance Criteria:**
- [ ] Page loads and displays correctly
- [ ] Mobile responsive
- [ ] Professional tone

**Effort:** 2 hours

---

### [FR-W4.3] Contact Us Page

**Feature:** Contact form + info.

**Requirements:**
- Form: name, email, message
- Validation (required, email format)
- Submit → store in DB + email notification
- Confirmation message
- Display phone + email

**Acceptance Criteria:**
- [ ] Form submits correctly
- [ ] Validation works
- [ ] Message stored in DB
- [ ] Email sent to support
- [ ] Confirmation shown

**API Spec:**
```
POST /api/v1/contact
{ name, email, message }
Response: { message: "Thank you for contacting us" }
```

**Effort:** 2 hours

---

### [FR-W4.4] Footer

**Feature:** Consistent footer across all pages.

**Requirements:**
- Logo
- Quick links (Products, About, Contact)
- Company info (email, phone)
- Copyright

**Acceptance Criteria:**
- [ ] Footer displays correctly
- [ ] Links work
- [ ] Mobile responsive

**Effort:** 1 hour

---

### [FR-W4.5] Comprehensive Testing

**Feature:** Full QA cycle.

**Requirements:**
- Unit tests: auth, validation, calculations
- Integration tests: API endpoints, DB
- E2E tests: user flows (customer, supplier, admin)
- Performance testing: load time targets
- Mobile testing: iOS/Android responsiveness
- Security testing: auth bypass, SQL injection, CSRF

**Acceptance Criteria:**
- [ ] 0 critical bugs
- [ ] >90% code coverage for core
- [ ] All user flows pass E2E
- [ ] <2s P95 load time
- [ ] Mobile fully responsive
- [ ] No OWASP Top 10 issues
- [ ] Smoke test passes hourly

**Effort:** 15 hours

---

### [FR-W4.6] Production Deployment

**Feature:** Setup production environment.

**Requirements:**
- DigitalOcean App Platform setup
- Database provisioning
- Environment variables configured
- SSL certificates
- DNS configuration
- Monitoring & alerts active
- Backups enabled

**Acceptance Criteria:**
- [ ] Production servers running
- [ ] Database accessible
- [ ] HTTPS working
- [ ] Monitoring metrics visible
- [ ] Backups scheduled
- [ ] Alerts configured

**Effort:** 5 hours

---

### [FR-W4.7] Launch & Documentation

**Feature:** Go-live readiness.

**Requirements:**
- API documentation (Swagger)
- Runbook (deploy, rollback, troubleshoot)
- README (setup, env vars, running locally)
- User guides (basic)
- Monitoring dashboard setup
- Support channel (Slack) ready

**Acceptance Criteria:**
- [ ] All docs complete
- [ ] Runbook tested
- [ ] Team trained
- [ ] Support channel active
- [ ] Rollback plan documented
- [ ] Launch checklist signed off

**Effort:** 5 hours

---

### **WEEK 4 DELIVERABLES (Sum: ~34 hours)**
✅ Home, About Us, Contact Us pages live  
✅ Comprehensive testing complete  
✅ 0 critical bugs  
✅ Production deployed  
✅ Monitoring active  
✅ Full documentation  
✅ Ready for launch  

---

## 6. Out of Scope (Post-MVP)

- Product reviews/ratings
- Wishlists
- In-app messaging
- Email notifications (real-time)
- SMS notifications
- Password reset
- Email verification
- Advanced filtering (price range)
- Bulk product import
- Admin analytics
- Supplier analytics
- Mobile app (native)
- Multi-language

---

## 7. Testing Strategy (Aggressive Timeline)

| Type | Coverage | Tool |
|------|----------|------|
| Unit | >90% core logic | Jest |
| Integration | All API endpoints | Supertest |
| E2E | All user flows | Cypress |
| Performance | Page load time | Lighthouse |
| Mobile | iOS + Android | Real devices |
| Security | OWASP Top 10 | Manual + tools |

**Daily:**
- Smoke test (login, browse, purchase)
- Merge to main only if tests pass

**Weekly:**
- Full regression test
- Performance benchmark
- Security scan

---

## 8. Definition of Done (MVP)

Feature is DONE when:

✅ Code written & reviewed  
✅ Unit tests passing (80%+ coverage)  
✅ Integration tests passing  
✅ E2E test passing  
✅ Merged to main  
✅ Deployed to staging  
✅ Tested on mobile  
✅ Load time <2s verified  
✅ Documentation updated  
✅ Zero known critical bugs  

---

## 9. Risk Mitigation (4-Week Aggressive)

| Risk | Mitigation |
|------|-----------|
| Paystack integration | Start Day 1 Week 2 with test account |
| Database performance | Use managed DB with monitoring |
| Scope creep | Strict freeze at end of Week 1 |
| Testing gaps | Daily smoke tests from Day 1 |
| Team burnout | Clear priorities, no nights/weekends |
| Payment webhook issues | Extensive test coverage in Week 4 |

---

## 10. Success Metrics (Launch Day)

**Technical:**
- ✅ 0 critical bugs
- ✅ <2s P95 load time (desktop)
- ✅ >99% uptime (24-hour test)
- ✅ Mobile responsive (tested on real devices)
- ✅ All smoke tests passing

**Functional:**
- ✅ All 13 pages live
- ✅ Customer purchase flow end-to-end
- ✅ Supplier registration & approval
- ✅ Admin oversight complete
- ✅ Payment processing working

**Documentation:**
- ✅ API docs complete
- ✅ Runbook ready
- ✅ Team trained
- ✅ Support plan active

---

## 11. Sign-Off

**Timeline:** July 21 - August 17, 2026 (4 weeks)  
**Status:** Ready for Implementation  
**Version:** 2.0 (Aggressive)  
**Last Updated:** July 20, 2026

**Approved by:** DN Tech Product & Engineering  

---

## Appendix: Feature Breakdown by Week

```
WEEK 1 (22h):      Auth + DB + Frontend setup
├─ Register
├─ Login
├─ Logout
├─ User roles
├─ DB schema
├─ Frontend boilerplate
└─ CI/CD

WEEK 2 (28h):      Customer purchase flow
├─ Browse products
├─ Search products
├─ Product details
├─ Shopping cart
├─ Checkout
├─ Payment verification
└─ Order history

WEEK 3 (30h):      Supplier & Admin
├─ Supplier registration
├─ Supplier dashboard
├─ Add/edit/delete products
├─ Stock management
├─ Order fulfillment
├─ Admin dashboard
└─ Supplier approval

WEEK 4 (34h):      Public pages & launch
├─ Home page
├─ About Us
├─ Contact Us
├─ Footer
├─ Comprehensive testing
├─ Production deployment
└─ Documentation & launch

TOTAL: 114 hours (~3 devs x 4 weeks @ 40h/week = 480h available)
```

---

**End of SRS**

