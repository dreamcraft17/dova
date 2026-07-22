# DOVA - System Design Document (SDD)
## Aggressive 4-Week Timeline | Versi 2.0

---

## 1. Architecture (Simplified for Speed)

**Monolith approach:** Single backend + Frontend on same infra. No microservices.

```
┌──────────────────────────────────────────────┐
│    Cloudflare CDN (static assets only)       │
└────────────────────┬─────────────────────────┘
                     │
┌────────────────────▼─────────────────────────┐
│  DigitalOcean App Platform (auto-scaling)    │
│  ├─ Next.js server (frontend)                │
│  └─ NestJS API (backend)                     │
└────────────────────┬─────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐  ┌────▼────┐  ┌───▼────┐
   │PostgreSQL│  │  Redis  │  │Paystack│
   │(Managed) │  │(Managed)│  │ Gateway│
   └──────────┘  └─────────┘  └────────┘
```

**Why simplified:**
- ✓ Faster deployment (1 command)
- ✓ Fewer operational concerns
- ✓ Easier debugging
- ✓ Can scale horizontally later (DigitalOcean handles it)
- ✓ Cost-effective for MVP

---

## 2. Database Design (PostgreSQL)

**Core schema only.** No audit tables, minimal extensions.

### 2.1 Users & Auth

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255),
  phone_number VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer', -- 'customer', 'supplier', 'admin'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Sessions stored in Redis, but keep audit log
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255),
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON user_sessions(expires_at);
```

### 2.2 Supplier Profiles

```sql
CREATE TABLE supplier_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  business_name VARCHAR(255) NOT NULL,
  business_address TEXT,
  business_phone VARCHAR(20),
  verification_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  verification_doc_url TEXT,
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES users(id),
  rejection_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_supplier_user_id ON supplier_profiles(user_id);
CREATE INDEX idx_supplier_status ON supplier_profiles(verification_status);
```

### 2.3 Products & Categories

```sql
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(12, 2) NOT NULL,
  stock_quantity INT NOT NULL DEFAULT 0,
  category_id UUID NOT NULL REFERENCES categories(id),
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_supplier_id ON products(supplier_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_is_active ON products(is_active);
```

### 2.4 Orders

```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES users(id),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled'
  total_amount DECIMAL(12, 2) NOT NULL,
  delivery_name VARCHAR(255),
  delivery_address TEXT,
  delivery_phone VARCHAR(20),
  payment_reference VARCHAR(255),
  payment_verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);

CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  supplier_id UUID NOT NULL REFERENCES supplier_profiles(id),
  quantity INT NOT NULL,
  unit_price DECIMAL(12, 2) NOT NULL,
  subtotal DECIMAL(12, 2) NOT NULL,
  supplier_order_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'shipped', 'delivered'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_supplier_id ON order_items(supplier_id);
```

### 2.5 Payments

```sql
CREATE TABLE payment_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  payment_reference VARCHAR(255),
  amount DECIMAL(12, 2),
  status VARCHAR(50), -- 'initiated', 'success', 'failed', 'pending'
  paystack_response JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_order_id ON payment_logs(order_id);
CREATE INDEX idx_payments_reference ON payment_logs(payment_reference);
```

### 2.6 Contact & Support

```sql
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  email VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'received',
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Total tables: 10** (Minimal, focused)

---

## 3. API Endpoints (Aggressive Scope)

### 3.1 Authentication

```
POST   /api/v1/auth/register        → Register customer
POST   /api/v1/auth/login           → Login (any role)
POST   /api/v1/auth/logout          → Logout
GET    /api/v1/auth/me              → Current user info
```

### 3.2 Products (Public)

```
GET    /api/v1/products             → List products (paginated, searchable)
GET    /api/v1/products/:id         → Product details
GET    /api/v1/categories           → List categories
```

### 3.3 Shopping & Orders

```
POST   /api/v1/cart/add             → Add to cart
PUT    /api/v1/cart/items/:id       → Update cart item qty
DELETE /api/v1/cart/items/:id       → Remove from cart
GET    /api/v1/cart                 → Get cart

POST   /api/v1/orders               → Create order from cart
GET    /api/v1/orders               → Get customer's orders
GET    /api/v1/orders/:id           → Order details
```

### 3.4 Payments

```
POST   /api/v1/payments/initialize  → Init Paystack payment
POST   /api/v1/payments/verify      → Paystack webhook (verify payment)
```

### 3.5 Supplier (Protected)

```
POST   /api/v1/suppliers/register   → Register as supplier
GET    /api/v1/suppliers/products   → Supplier's products
POST   /api/v1/suppliers/products   → Add product
PUT    /api/v1/suppliers/products/:id → Edit product
DELETE /api/v1/suppliers/products/:id → Delete product
GET    /api/v1/suppliers/orders     → Supplier's orders
PUT    /api/v1/suppliers/orders/:id/status → Update order status
```

### 3.6 Admin (Protected)

```
GET    /api/v1/admin/dashboard      → Stats overview
GET    /api/v1/admin/suppliers/pending → Pending registrations
POST   /api/v1/admin/suppliers/:id/approve → Approve supplier
POST   /api/v1/admin/suppliers/:id/reject → Reject supplier
GET    /api/v1/admin/users          → All users
GET    /api/v1/admin/products       → All products
GET    /api/v1/admin/orders         → All orders
```

### 3.7 Contact

```
POST   /api/v1/contact              → Submit contact form
```

**Total endpoints: 35** (Lean and focused)

---

## 4. Authentication (JWT)

**Simple, stateless JWT:**

```javascript
// Access Token (15 min)
{
  sub: 'user-uuid',
  email: 'user@example.com',
  role: 'customer',
  iat: 1234567890,
  exp: 1234568790
}

// Refresh Token (7 days)
{
  sub: 'user-uuid',
  type: 'refresh',
  iat: 1234567890,
  exp: 1234567890 + 7d
}
```

**Storage:** httpOnly cookies (secure, not accessible by JS)

**Middleware:** Check JWT on every protected endpoint

---

## 5. Payment Integration (Paystack)

**Flow:**

```
1. Customer submits checkout form
   ↓
2. Backend: POST /api/v1/payments/initialize
   - Create order (status: 'pending')
   - Call Paystack API: /transaction/initialize
   ↓
3. Backend returns Paystack checkout URL
   ↓
4. Frontend: Redirect customer to Paystack
   ↓
5. Customer pays (or cancels)
   ↓
6. Paystack redirects back to /checkout/verify?reference=xxx
   ↓
7. Frontend: GET /api/v1/payments/verify?reference=xxx
   ↓
8. Backend: Verify with Paystack, update order status to 'paid'
   ↓
9. Frontend: Show confirmation
```

**Webhook (Optional but recommended):**
- Paystack also sends webhook to `/api/v1/payments/webhook`
- Backup verification if client redirect fails
- Store Paystack response in `payment_logs` table

**Test Paystack Numbers:**
- Card: 4111 1111 1111 1111
- CVV: Any 3 digits
- Exp: Any future date

---

## 6. Caching (Redis)

**Minimal caching for MVP:**

| Data | TTL | Purpose |
|------|-----|---------|
| Product catalog | 1 hour | Fast browsing |
| User sessions | 7 days | Fast auth |
| Cart (per user) | 1 week | Persistent cart |

**Strategy:** Cache on read, invalidate on write (simple)

```javascript
// Pseudocode
async getProducts(page, limit) {
  const cacheKey = `products:${page}:${limit}`;
  let products = await redis.get(cacheKey);
  
  if (!products) {
    products = await db.products.find(...).paginate(page, limit);
    await redis.setex(cacheKey, 3600, JSON.stringify(products)); // 1 hour
  }
  
  return products;
}

// On product update/delete
async updateProduct(id, data) {
  await db.products.update(id, data);
  await redis.del(`products:*`); // Clear all product caches
}
```

---

## 7. File Storage (Images)

**DigitalOcean Spaces (S3-compatible):**

- Bucket: `dova-mvp` (private)
- Path: `/products/{productId}/{filename}`
- CDN: DigitalOcean CDN (built-in)
- Max file size: 5MB
- Supported: JPG, PNG, WebP

**Upload flow:**
1. Frontend: POST `/api/v1/upload/presigned-url`
2. Backend: Generate presigned URL
3. Frontend: Direct upload to Spaces
4. Store URL in DB

**Auto-optimization:**
- ImageMagick resize to 400x400 (thumbnail)
- Lazy loading on frontend

---

## 8. Deployment (DigitalOcean App Platform)

**Why App Platform:**
- ✓ Auto-scaling based on CPU/memory
- ✓ Built-in CI/CD (GitHub integration)
- ✓ Auto-HTTPS + managed SSL
- ✓ Zero-downtime deployments
- ✓ Managed PostgreSQL + Redis
- ✓ Environment variables via dashboard

**Setup:**

```yaml
# app.yaml (DigitalOcean config)
name: dova-api
services:
  - name: api
    github:
      repo: yourorg/dova
      branch: main
    build_command: npm run build
    run_command: npm run start:prod
    http_port: 3000
    envs:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        scope: RUN_AND_BUILD_TIME
        value: ${{ components.db.connection_string }}
      - key: REDIS_URL
        value: ${{ components.redis.connection_string }}
      - key: JWT_SECRET
        scope: RUN_AND_BUILD_TIME
        value: ${{ secrets.JWT_SECRET }}
      - key: PAYSTACK_SECRET
        scope: RUN_AND_BUILD_TIME
        value: ${{ secrets.PAYSTACK_SECRET }}

databases:
  - name: db
    engine: POSTGRESQL
    version: "15"
    
  - name: redis
    engine: REDIS
    version: "7"
```

**CI/CD:**
1. Push to `main` branch
2. GitHub Actions: Test + build Docker image
3. DigitalOcean App Platform: Auto-deploy
4. Staging env auto-tests
5. Notifications to Slack

---

## 9. Monitoring & Logging (Minimal MVP)

**Built-in DigitalOcean:**
- ✓ CPU/Memory usage
- ✓ Request latency
- ✓ Error rates
- ✓ Database connections

**Application Logging:**
```javascript
// NestJS Winston logger
import { Logger } from '@nestjs/common';

const logger = new Logger('App');
logger.log('Order created', { orderId: '123', customerId: '456' });
logger.error('Payment failed', { orderId: '123', reason: 'card declined' });
```

**Alerts:**
- ✓ Error rate > 5%
- ✓ Response time > 2s (P95)
- ✓ Database connections > 10
- ✓ Disk usage > 80%

**Dashboard:** DigitalOcean console (metrics tab)

---

## 10. Security (MVP Level)

### 10.1 Authentication
- ✓ Password hashing (bcrypt, 12 rounds)
- ✓ JWT signing with HS256
- ✓ HTTPS enforced (automatic on App Platform)
- ✓ CORS configured (frontend URL only)

### 10.2 API Security
- ✓ Rate limiting (100 req/min per IP at proxy level)
- ✓ SQL injection prevention (parameterized queries)
- ✓ CSRF tokens for POST/PUT/DELETE (optional for MVP, can add later)
- ✓ Input validation (Joi schemas)

### 10.3 Data Security
- ✓ No sensitive data in logs
- ✓ Secrets in environment variables (not code)
- ✓ Database backups daily (DigitalOcean managed)

### 10.4 Payment Security
- ✓ No card data stored (Paystack handles it)
- ✓ Webhook signature verification
- ✓ PCI compliance via Paystack

---

## 11. Performance Targets (MVP)

| Metric | Target | Strategy |
|--------|--------|----------|
| Home page | <1.5s | Minimal JS, CSS inline |
| Products page | <2s | Pagination (20/page), image lazy-load |
| Checkout | <2s | Direct Paystack redirect |
| Database query | <100ms | Proper indexing |
| API response | <200ms | Caching + optimization |

**Tools:**
- Lighthouse (Chrome DevTools)
- Network tab monitoring
- DigitalOcean metrics dashboard

---

## 12. Backups & Disaster Recovery (MVP)

**Database:**
- DigitalOcean automatic daily backups (7-day retention)
- Point-in-time recovery available
- Restore time: ~15 minutes

**Code:**
- GitHub (version control)
- Automatic on push

**Recovery Plan:**
1. **App server down:** DigitalOcean auto-restart
2. **Database issue:** Restore from daily backup (15 min)
3. **Payment mismatch:** Manual verification via Paystack dashboard

---

## 13. Scalability Plan (Post-MVP)

After launch (if needed):
- Multiple App Platform instances (auto-load balancing)
- Database read replicas (for reporting)
- Redis cluster (if cache needs grow)
- CDN for static assets
- Microservices (payments, notifications, etc.)

---

## 14. Environment Variables (Secrets)

```env
# Backend
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@db:5432/dova
REDIS_URL=redis://redis:6379
JWT_SECRET=xxxxx-long-random-string-xxxxx
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

PAYSTACK_SECRET_KEY=sk_live_xxxxx
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx

FRONTEND_URL=https://dova.co.id
BACKEND_URL=https://api.dova.co.id

# Frontend
NEXT_PUBLIC_API_URL=https://api.dova.co.id
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
```

---

## 15. Development Setup (Local)

```bash
# Backend
git clone https://github.com/org/dova-api.git
cd dova-api
npm install
cp .env.example .env # Fill in localhost values
docker-compose up -d # PostgreSQL + Redis locally
npm run dev

# Frontend
git clone https://github.com/org/dova-web.git
cd dova-web
npm install
cp .env.local.example .env.local
npm run dev

# Both running:
# API: http://localhost:3000
# Web: http://localhost:3001
```

---

## 16. Sign-Off

**Prepared by:** DN Tech Engineering  
**Status:** Ready for Implementation  
**Version:** 2.0 (Aggressive 4-Week)  
**Last Updated:** July 20, 2026

