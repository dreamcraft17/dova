# DOVA - Tech Stack & Monorepo Setup
## Untuk MVP 4-Week Build | Versi 1.0

---

## 1. Filosofi: Simple > Complex

**Prinsip:**
- ✅ Monorepo (satu repo, FE + BE bersama)
- ✅ Shared types (TypeScript interfaces)
- ✅ Minimal tooling (hanya yang perlu)
- ✅ Fast local development (hot reload)
- ✅ Easy deployment (one command)
- ❌ No microservices, no complex abstractions
- ❌ No unnecessary dependencies

**Benefit untuk 4-week timeline:**
- Setup cepat (hari 1 selesai)
- Debugging mudah (full stack dalam 1 IDE)
- Koordinasi tim lebih simple
- Build + deploy lebih cepat
- Maintenance lebih ringan

---

## 2. Folder Structure (Monorepo)

```
dova/                          (root - monorepo)
├── package.json              (root, shared scripts)
├── tsconfig.json             (shared TypeScript config)
├── .env.example              (env template)
├── docker-compose.yml        (local dev: DB + Redis)
│
├── shared/                   (💥 Shared code antara FE & BE)
│   ├── package.json
│   ├── src/
│   │   ├── types/           (TypeScript interfaces, shared)
│   │   │   ├── user.ts      (User, Customer, Supplier, Admin)
│   │   │   ├── product.ts   (Product, Category)
│   │   │   ├── order.ts     (Order, OrderItem)
│   │   │   ├── payment.ts   (Payment, Transaction)
│   │   │   └── index.ts     (export all)
│   │   ├── utils/           (Shared utilities)
│   │   │   ├── validation.ts    (Email, phone, password validators)
│   │   │   ├── constants.ts     (Enums: roles, statuses)
│   │   │   ├── errors.ts        (Custom error classes)
│   │   │   └── index.ts
│   │   └── api-client/      (Optional: shared API client)
│   │       └── index.ts
│   └── tsconfig.json
│
├── apps/
│   │
│   ├── backend/              (NestJS API)
│   │   ├── package.json
│   │   ├── src/
│   │   │   ├── main.ts       (Entry point)
│   │   │   ├── app.module.ts (Root module)
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts    (Login, Register)
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   ├── jwt.strategy.ts
│   │   │   │   └── guards/
│   │   │   ├── products/
│   │   │   │   ├── products.controller.ts
│   │   │   │   ├── products.service.ts
│   │   │   │   ├── products.module.ts
│   │   │   │   └── entities/
│   │   │   ├── orders/
│   │   │   │   ├── orders.controller.ts
│   │   │   │   ├── orders.service.ts
│   │   │   │   ├── orders.module.ts
│   │   │   │   └── entities/
│   │   │   ├── suppliers/
│   │   │   │   ├── suppliers.controller.ts
│   │   │   │   ├── suppliers.service.ts
│   │   │   │   └── suppliers.module.ts
│   │   │   ├── admin/
│   │   │   │   ├── admin.controller.ts
│   │   │   │   ├── admin.service.ts
│   │   │   │   └── admin.module.ts
│   │   │   ├── payments/
│   │   │   │   ├── payments.controller.ts
│   │   │   │   ├── payments.service.ts
│   │   │   │   ├── payments.module.ts
│   │   │   │   └── paystack.provider.ts (Paystack integration)
│   │   │   ├── database/
│   │   │   │   ├── database.module.ts
│   │   │   │   ├── migrations/       (TypeORM)
│   │   │   │   └── seeds/            (Seed data)
│   │   │   ├── config/
│   │   │   │   ├── database.config.ts
│   │   │   │   ├── redis.config.ts
│   │   │   │   ├── jwt.config.ts
│   │   │   │   └── paystack.config.ts
│   │   │   └── common/
│   │   │       ├── decorators/
│   │   │       ├── filters/         (Exception filters)
│   │   │       ├── interceptors/    (Logging, timing)
│   │   │       └── middleware/
│   │   ├── test/
│   │   │   ├── auth.e2e-spec.ts
│   │   │   ├── products.e2e-spec.ts
│   │   │   └── orders.e2e-spec.ts
│   │   ├── .env.example
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── nest-cli.json
│   │
│   └── frontend/              (Next.js)
│       ├── package.json
│       ├── public/            (Static assets)
│       │   ├── images/
│       │   └── icons/
│       ├── src/
│       │   ├── pages/         (Next.js pages)
│       │   │   ├── index.tsx                    (Home)
│       │   │   ├── products.tsx               (Browse products)
│       │   │   ├── products/[id].tsx          (Product details)
│       │   │   ├── cart.tsx                   (Shopping cart)
│       │   │   ├── checkout/
│       │   │   │   ├── index.tsx
│       │   │   │   └── success.tsx
│       │   │   ├── customer/
│       │   │   │   └── dashboard.tsx          (Order history)
│       │   │   ├── supplier/
│       │   │   │   └── dashboard.tsx          (Supplier workspace)
│       │   │   ├── admin/
│       │   │   │   └── dashboard.tsx          (Admin oversight)
│       │   │   ├── auth/
│       │   │   │   ├── login.tsx
│       │   │   │   ├── register.tsx
│       │   │   │   └── supplier-register.tsx
│       │   │   ├── about.tsx
│       │   │   ├── contact.tsx
│       │   │   └── _app.tsx                   (Global layout)
│       │   ├── components/    (Reusable components)
│       │   │   ├── layout/
│       │   │   │   ├── Header.tsx
│       │   │   │   ├── Footer.tsx
│       │   │   │   └── Sidebar.tsx
│       │   │   ├── common/
│       │   │   │   ├── Button.tsx
│       │   │   │   ├── Input.tsx
│       │   │   │   ├── Card.tsx
│       │   │   │   ├── Modal.tsx
│       │   │   │   └── Badge.tsx
│       │   │   ├── products/
│       │   │   │   ├── ProductCard.tsx
│       │   │   │   ├── ProductGrid.tsx
│       │   │   │   └── SearchBar.tsx
│       │   │   ├── cart/
│       │   │   │   ├── CartItem.tsx
│       │   │   │   └── CartSummary.tsx
│       │   │   └── forms/
│       │   │       ├── LoginForm.tsx
│       │   │       ├── RegisterForm.tsx
│       │   │       ├── CheckoutForm.tsx
│       │   │       └── ContactForm.tsx
│       │   ├── lib/           (Utilities & hooks)
│       │   │   ├── api.ts              (Axios instance)
│       │   │   ├── auth.ts             (Auth utilities)
│       │   │   ├── storage.ts          (localStorage helpers)
│       │   │   ├── constants.ts        (App constants)
│       │   │   └── hooks/
│       │   │       ├── useAuth.ts      (Auth context hook)
│       │   │       ├── useCart.ts      (Cart state)
│       │   │       └── useFetch.ts     (Data fetching)
│       │   ├── context/       (React context)
│       │   │   ├── AuthContext.tsx
│       │   │   └── CartContext.tsx
│       │   ├── styles/        (Global styles)
│       │   │   ├── globals.css
│       │   │   ├── tailwind.css
│       │   │   └── variables.css
│       │   └── types/         (Local FE types, if needed)
│       ├── .env.local.example
│       ├── next.config.js
│       ├── tailwind.config.ts
│       ├── tsconfig.json
│       ├── package.json
│       └── jest.config.js
│
├── .github/
│   └── workflows/
│       ├── test.yml           (Run tests on PR)
│       ├── build.yml          (Build Docker image)
│       └── deploy.yml         (Deploy to DigitalOcean)
│
├── scripts/
│   ├── seed-db.ts             (Seed categories, sample products)
│   ├── migrate.ts              (Run database migrations)
│   └── setup.sh               (Initial setup)
│
├── docker-compose.yml         (Local dev environment)
├── Dockerfile.backend         (Backend only)
├── Dockerfile.frontend        (Frontend only)
├── .dockerignore
├── .gitignore
├── README.md
└── package.json               (Root - workspace config)
```

---

## 3. Tech Stack (Locked)

### 3.1 Frontend (Next.js)

```json
{
  "name": "dova-frontend",
  "version": "0.1.0",
  "dependencies": {
    "next": "16.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "axios": "^1.6.0",
    "dova-shared": "file:../shared"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/forms": "^0.5.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0",
    "jest": "^29.0.0",
    "cypress": "^13.0.0",
    "@types/react": "^19.0.0",
    "@types/node": "^20.0.0"
  },
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest",
    "test:e2e": "cypress run"
  }
}
```

**Dependencies (minimal):**
- `next` - React framework
- `react` + `react-dom` - UI
- `axios` - HTTP client
- `typescript` - Type safety
- `tailwindcss` - CSS styling
- `dova-shared` - Shared types (local package)

**NO:** Redux, MobX, Recoil (use React Context, simple)

---

### 3.2 Backend (NestJS)

```json
{
  "name": "dova-backend",
  "version": "0.1.0",
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^11.0.0",
    "@nestjs/passport": "^10.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "@nestjs/typeorm": "^9.0.0",
    "typeorm": "^0.3.0",
    "pg": "^8.11.0",
    "redis": "^4.6.0",
    "axios": "^1.6.0",
    "dova-shared": "file:../shared"
  },
  "devDependencies": {
    "@types/express": "^4.17.0",
    "@types/node": "^20.0.0",
    "typescript": "^5.3.0",
    "@nestjs/testing": "^10.0.0",
    "jest": "^29.0.0",
    "supertest": "^6.3.0"
  },
  "scripts": {
    "dev": "nest start --watch",
    "build": "nest build",
    "start": "node dist/main",
    "start:prod": "node dist/main",
    "migrate": "typeorm migration:run -d dist/database/data-source.js",
    "seed": "ts-node src/scripts/seed.ts",
    "lint": "eslint src/",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

**Dependencies (minimal):**
- `@nestjs/*` - Framework
- `typeorm` + `pg` - Database ORM
- `@nestjs/jwt` + `passport-jwt` - Authentication
- `redis` - Session + cache
- `axios` - HTTP client
- `dova-shared` - Shared types

**NO:** Sequelize, Prisma, GraphQL, terlalu banyak middleware

---

### 3.3 Shared Package

```json
{
  "name": "dova-shared",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**Isi:**
- TypeScript interfaces (types/)
- Validation logic (utils/)
- Constants & enums
- Error classes

**Tidak boleh:** Node.js specific code, npm dependencies yang heavy

---

## 4. Root Package.json (Monorepo Config)

```json
{
  "name": "dova-mvp",
  "version": "0.1.0",
  "private": true,
  "workspaces": [
    "shared",
    "apps/backend",
    "apps/frontend"
  ],
  "scripts": {
    "dev": "concurrently \"npm run dev -w shared\" \"npm run dev -w apps/backend\" \"npm run dev -w apps/frontend\"",
    "dev:backend": "npm run dev -w apps/backend",
    "dev:frontend": "npm run dev -w apps/frontend",
    "build": "npm run build -w shared && npm run build -w apps/backend && npm run build -w apps/frontend",
    "build:backend": "npm run build -w apps/backend",
    "build:frontend": "npm run build -w apps/frontend",
    "test": "npm run test -w apps/backend && npm run test -w apps/frontend",
    "test:backend": "npm run test -w apps/backend",
    "test:frontend": "npm run test -w apps/frontend",
    "lint": "npm run lint -w apps/backend && npm run lint -w apps/frontend",
    "db:migrate": "npm run migrate -w apps/backend",
    "db:seed": "npm run seed -w apps/backend"
  },
  "devDependencies": {
    "concurrently": "^8.2.0",
    "typescript": "^5.3.0"
  }
}
```

**Workspace commands:**
```bash
npm run dev              # Start FE + BE + shared (watch mode)
npm run dev:backend     # Backend only
npm run dev:frontend    # Frontend only
npm run build           # Build all
npm run test            # Test all
npm run db:migrate      # Run migrations
npm run db:seed         # Seed database
```

---

## 5. Development Setup (Local)

### 5.1 Prerequisites

```bash
# Node.js 20 LTS
node --version          # v20.x.x

# Git
git --version

# Docker (for DB + Redis locally)
docker --version
docker-compose --version
```

### 5.2 First Time Setup

```bash
# 1. Clone repo
git clone https://github.com/org/dova.git
cd dova

# 2. Install dependencies (workspaces)
npm install

# 3. Start local PostgreSQL + Redis
docker-compose up -d

# 4. Setup environment variables
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local

# 5. Run database migrations
npm run db:migrate

# 6. Seed database with sample data
npm run db:seed

# 7. Start development (FE + BE in parallel)
npm run dev

# Output:
# > shared@0.1.0 build
# > tsc
#
# > apps/backend@0.1.0 dev
# > nest start --watch
# [Nest] 12345  - 07/20/2026, 10:00:00 AM     LOG [NestFactory] Starting Nest application...
# ✓ Listening on port 3000
#
# > apps/frontend@0.1.0 dev
# > next dev -p 3001
# ▲ Next.js 16.0.0
# - Local:        http://localhost:3001
```

### 5.3 Local Environment Files

**`.env` (root - shared by both)**
```env
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/dova
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=dev-secret-key-long-random-string-here
JWT_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Paystack (test keys)
PAYSTACK_SECRET_KEY=sk_test_xxxxx
PAYSTACK_PUBLIC_KEY=pk_test_xxxxx

# URLs
FRONTEND_URL=http://localhost:3001
BACKEND_URL=http://localhost:3000
```

**`apps/backend/.env`**
```env
# Same as root .env, or override specific values
```

**`apps/frontend/.env.local`**
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxxxx
```

---

## 6. Docker Compose (Local Development)

**`docker-compose.yml`**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    container_name: dova-postgres
    environment:
      POSTGRES_DB: dova
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: dova-redis
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
```

**Run locally:**
```bash
docker-compose up -d     # Start DB + Redis in background
docker-compose logs -f   # View logs
docker-compose down      # Stop & remove
```

---

## 7. Shared Types (Monorepo Advantage)

**`shared/src/types/index.ts`**

```typescript
// User types
export type UserRole = 'customer' | 'supplier' | 'admin';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
}

// Product types
export interface Category {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  supplierId: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

// Order types
export type OrderStatus = 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
  id: string;
  customerId: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  deliveryName: string;
  deliveryAddress: string;
  deliveryPhone: string;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}
```

**Backend usage:**
```typescript
// apps/backend/src/products/products.service.ts
import { Product } from 'dova-shared/types';

async getProducts(): Promise<Product[]> {
  return this.productsRepository.find();
}
```

**Frontend usage:**
```typescript
// apps/frontend/src/components/products/ProductCard.tsx
import { Product } from 'dova-shared/types';

interface Props {
  product: Product;
}

export const ProductCard = ({ product }: Props) => {
  return (
    <div>
      <h3>{product.name}</h3>
      <p>Rp {product.price.toLocaleString()}</p>
    </div>
  );
};
```

**Benefit:** Type safety end-to-end, autocomplete di IDE, single source of truth.

---

## 8. API Client (Shared)

**`shared/src/api-client/index.ts`**

```typescript
import axios, { AxiosInstance } from 'axios';

export class ApiClient {
  private instance: AxiosInstance;

  constructor(baseURL: string) {
    this.instance = axios.create({
      baseURL,
      withCredentials: true, // For cookies
    });

    // Intercept errors
    this.instance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Redirect to login
          window.location.href = '/auth/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  register(data: any) {
    return this.instance.post('/auth/register', data);
  }

  login(email: string, password: string) {
    return this.instance.post('/auth/login', { email, password });
  }

  // Products
  getProducts(page: number = 1, limit: number = 20) {
    return this.instance.get('/products', { params: { page, limit } });
  }

  // ... more endpoints
}

export default ApiClient;
```

**Frontend usage:**
```typescript
// apps/frontend/src/lib/api.ts
import ApiClient from 'dova-shared/api-client';

const apiClient = new ApiClient(
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
);

export default apiClient;
```

---

## 9. Build & Deployment (Docker)

### 9.1 Backend Dockerfile

**`Dockerfile.backend`**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared shared
COPY apps/backend apps/backend

RUN npm ci
RUN npm run build -w shared
RUN npm run build -w apps/backend

# Runtime stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/dist/apps/backend ./dist
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["node", "dist/main.js"]
```

**Build & run:**
```bash
docker build -f Dockerfile.backend -t dova-api:latest .
docker run -p 3000:3000 --env-file .env dova-api:latest
```

### 9.2 Frontend Dockerfile

**`Dockerfile.frontend`**

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY shared shared
COPY apps/frontend apps/frontend

RUN npm ci
RUN npm run build -w shared
RUN npm run build -w apps/frontend

# Runtime stage
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/public ./public
COPY apps/frontend/public ./apps/frontend/public

EXPOSE 3001

CMD ["npx", "next", "start", "-p", "3001"]
```

### 9.3 GitHub Actions (CI/CD)

**`.github/workflows/test.yml`**

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: dova_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build shared
        run: npm run build -w shared
      
      - name: Test backend
        run: npm run test -w apps/backend
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/dova_test
      
      - name: Test frontend
        run: npm run test -w apps/frontend
      
      - name: Build backend
        run: npm run build -w apps/backend
      
      - name: Build frontend
        run: npm run build -w apps/frontend
```

**`.github/workflows/deploy.yml`**

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Build backend image
        run: docker build -f Dockerfile.backend -t dova-api:${{ github.sha }} .
      
      - name: Build frontend image
        run: docker build -f Dockerfile.frontend -t dova-web:${{ github.sha }} .
      
      - name: Deploy to DigitalOcean
        run: |
          # Push images to registry
          # Update DigitalOcean App Platform
          echo "Deploying ${{ github.sha }}"
        env:
          DIGITALOCEAN_ACCESS_TOKEN: ${{ secrets.DIGITALOCEAN_TOKEN }}
```

---

## 10. Production Deployment

**DigitalOcean App Platform:**

```yaml
# app.yaml (DigitalOcean config)
name: dova
services:
  - name: backend
    github:
      repo: org/dova
      branch: main
    build_command: npm run build -w apps/backend
    run_command: npm run start -w apps/backend
    http_port: 3000
    source_dir: apps/backend
    
  - name: frontend
    github:
      repo: org/dova
      branch: main
    build_command: npm run build -w apps/frontend
    run_command: npm run start -w apps/frontend
    http_port: 3001
    source_dir: apps/frontend

databases:
  - name: db
    engine: POSTGRESQL
    version: "15"
  
  - name: redis
    engine: REDIS
    version: "7"
```

---

## 11. Git Workflow

### 11.1 Branch Strategy

```
main (production)
  ↑
staging (pre-production, auto-deploy)
  ↑
develop (integration)
  ↑
feature/*, bugfix/*, hotfix/* (developer branches)
```

### 11.2 Commit Conventions

```bash
git commit -m "feat: add product search"
git commit -m "fix: cart not persisting"
git commit -m "refactor: simplify auth middleware"
git commit -m "test: add product service tests"
git commit -m "docs: update README"
```

### 11.3 Pull Request Flow

```
1. Create feature branch: git checkout -b feature/my-feature
2. Make changes in FE and/or BE
3. Push to GitHub: git push origin feature/my-feature
4. Create PR → CI/CD runs tests
5. Code review (at least 1 approval)
6. Merge to develop when green
7. Auto-deploy to staging
8. Manual promotion to main → production
```

---

## 12. Development Workflow (Daily)

### Morning

```bash
# Start fresh
git pull origin develop

# Install new dependencies
npm install

# Start development servers
npm run dev

# Outputs:
# ✓ Backend running on http://localhost:3000
# ✓ Frontend running on http://localhost:3001
# ✓ Watch mode enabled (auto-reload on changes)
```

### During Development

```bash
# Switch to feature branch
git checkout -b feature/add-wishlist

# Make changes in:
# - shared/src/types/product.ts         (add type)
# - apps/backend/src/wishlist/*         (API)
# - apps/frontend/src/pages/wishlist/*  (UI)

# Test locally
npm run test                    # All tests
npm run test:backend           # Backend only
npm run test:frontend          # Frontend only

# Check types
npx tsc --noEmit               # TypeScript check

# Lint code
npm run lint
```

### Before Committing

```bash
# Test suite must pass
npm run test                   # All tests

# Build must succeed
npm run build                  # All builds

# Then commit
git add .
git commit -m "feat: add wishlist feature"
git push origin feature/add-wishlist

# Create PR on GitHub
# Wait for CI/CD to pass
# Request review from team
```

---

## 13. Maintenance & Scaling

### 13.1 Adding a New Feature

```
1. Create shared types (shared/src/types/*)
2. Create backend endpoints (apps/backend/src/*)
3. Create frontend pages/components (apps/frontend/src/*)
4. Create tests for both
5. PR → merge → deploy
```

### 13.2 Monorepo Commands Reference

```bash
# Install
npm install                     # Install all workspace deps
npm install -w apps/backend     # Install in backend only

# Run scripts
npm run dev                      # All (FE + BE + shared watch)
npm run dev:backend             # Backend only
npm run dev:frontend            # Frontend only

# Build
npm run build                    # Build all
npm run build:backend           # Backend only
npm run build:frontend          # Frontend only

# Test
npm run test                     # All tests
npm run test:backend            # Backend tests only
npm run test:frontend           # Frontend tests only

# Database
npm run db:migrate              # Run migrations
npm run db:seed                 # Seed database

# Clean (if needed)
npm install --force             # Force reinstall
rm -rf node_modules/ .next dist/ # Nuclear clean
npm install && npm run build    # Rebuild everything
```

### 13.3 Folder Cleanup (Remove Unused)

Jika ada folder tidak perlu:

```bash
# Safe to delete:
rm -rf apps/backend/test/      # Move to __tests__/ in src
rm -rf dist/                    # Build output (git ignored)
rm -rf .next/                   # Next.js output (git ignored)

# Don't delete:
- shared/
- apps/
- .github/workflows/
- docker-compose.yml
```

---

## 14. Troubleshooting

| Problem | Solution |
|---------|----------|
| `Module not found` error | Run `npm install` in root |
| Port 3000/3001 already in use | `lsof -i :3000` find process, kill it |
| DB connection error | Check docker-compose is running: `docker-compose ps` |
| Types not updating | `npm run build -w shared` then restart IDE |
| `node_modules` corrupted | Delete and `npm install` again |
| Slow build | Skip tests: `npm run build --skip-workspace-check` |

---

## 15. Checklists

### New Developer Onboarding

- [ ] Clone repo
- [ ] Read this document
- [ ] Run `npm install`
- [ ] Run `docker-compose up -d`
- [ ] Run `npm run db:migrate && npm run db:seed`
- [ ] Run `npm run dev`
- [ ] Test all three servers running
- [ ] Read SRS for assigned feature
- [ ] Create feature branch
- [ ] Code + test
- [ ] PR review

### Before Week 1 Ends

- [ ] Monorepo setup complete
- [ ] All team members can `npm run dev` locally
- [ ] CI/CD pipeline green
- [ ] Database migrations working
- [ ] Shared types being used by FE & BE
- [ ] TypeScript strict mode enabled
- [ ] First features building

### Before Production Launch

- [ ] Zero console errors in browser/terminal
- [ ] All tests passing (backend + frontend)
- [ ] Build completes in <2 minutes
- [ ] Docker images build successfully
- [ ] Environment variables documented
- [ ] Deployment runbook tested
- [ ] Rollback procedure ready

---

## 16. Sign-Off

**Tech Stack & Monorepo Setup**  
**Status:** Ready to implement  
**Version:** 1.0  
**Last Updated:** July 20, 2026

**Key Principles:**
- ✅ Monorepo = faster development
- ✅ Shared types = type safety end-to-end
- ✅ Minimal dependencies = fewer bugs
- ✅ Simple structure = easy onboarding
- ✅ Docker ready = production-ready from day 1

**Next Steps:**
1. Setup monorepo (Day 1)
2. Get all devs building locally
3. First commit by Day 2
4. All systems running by end of Week 1

---

Semua siap untuk MVP 4-week aggressive build! 🚀

