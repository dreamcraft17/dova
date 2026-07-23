# DOVA — VPS Deploy Steps

Guide to build and run the full stack on a single VPS (API + frontend + Postgres + Redis).  
Alternative: frontend on Vercel + backend on VPS (see `DOVA_VERCEL_DEPLOYMENT_OVERRIDE.md`).

## 0. Prerequisites

- Ubuntu 22.04/24.04  
- Domain (optional but recommended)  
- Node.js **20+**, nginx, PostgreSQL, Redis, git, PM2  

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt update && sudo apt install -y nodejs nginx postgresql redis-server git
sudo npm i -g pm2
```

## 1. Clone & install

```bash
cd /var/www
sudo git clone https://github.com/dreamcraft17/dova.git
sudo chown -R $USER:$USER dova
cd dova
npm install
```

## 2. Environment

```bash
cp .env.example .env
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.local.example apps/frontend/.env.local
```

**Backend (`apps/backend/.env`):**

```env
NODE_ENV=production
PORT=3000
USE_IN_MEMORY=false
FRONTEND_URL=https://your-domain.com
JWT_SECRET=long-random-secret
DATABASE_URL=postgresql://dova:PASSWORD@127.0.0.1:5432/dova
REDIS_URL=redis://127.0.0.1:6379
PAYSTACK_SECRET_KEY=sk_xxx
PAYSTACK_CURRENCY=NGN
ADMIN_PASSWORD=change-me
```

**Frontend (`apps/frontend/.env.local`):**

```env
NEXT_PUBLIC_API_URL=https://your-domain.com/api/v1
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_xxx
```

Create DB:

```bash
sudo -u postgres psql -c "CREATE USER dova WITH PASSWORD 'PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE dova OWNER dova;"
```

## 3. Migrate, seed, build

```bash
cd /var/www/dova
npm run db:migrate
npm run db:seed
npm run build
```

## 4. Process manager (PM2)

```bash
cd /var/www/dova/apps/backend && pm2 start dist/main.js --name dova-api
cd /var/www/dova/apps/frontend && pm2 start npm --name dova-web -- start
pm2 save && pm2 startup
```

Health checks:

```bash
curl http://127.0.0.1:3000/api/v1/health
curl -I http://127.0.0.1:3001
```

## 5. Nginx (single domain)

```nginx
server {
  listen 80;
  server_name your-domain.com;

  location /api/ {
    proxy_pass http://127.0.0.1:3000/api/;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    proxy_pass http://127.0.0.1:3001;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d your-domain.com
```

Rebuild frontend if public API URL changes:

```bash
cd /var/www/dova && npm run build -w apps/frontend && pm2 restart dova-web
```

## 6. Updates

```bash
cd /var/www/dova
git pull
npm install
npm run db:migrate
npm run build
pm2 restart dova-api dova-web
```

## 7. Go-live checklist

- [ ] `USE_IN_MEMORY=false`  
- [ ] Strong `JWT_SECRET` / `ADMIN_PASSWORD`  
- [ ] Paystack keys + HTTPS  
- [ ] Smoke: login, browse, cart, checkout on **desktop and phone**  
