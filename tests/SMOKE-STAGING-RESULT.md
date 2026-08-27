# DOVA — Staging Smoke Result

> **Author:** Dozer · **Date:** 2026-08-27 · **HEAD:** `b17e2a5` · **Tag:** `v0.5.2`

**Command:** `npm run smoke:staging`  
**Result:** **PASS** — 23 API steps + NEG-01..07

```
BASE=https://api.dova.dntech.id/api/v1
1. GET /health
2-3. Admin login + /auth/me
4. GET /categories
5. GET /products
6. POST /auth/register (qa.softlaunch.1787816897788@example.com)
7-8. Cart add + get
9. POST /orders
10. POST /payments/initialize
   payment ref=DOVA-DOVA-MTB80UCQ-a7050487
11. GET /orders
NEG-01 admin with customer token → 403
NEG-03 cart/add qty 0 → 400
NEG-07 empty cart order → 400
12-14. Supplier login + products + orders
15-19. Admin dashboard, suppliers, users, orders
20-21. Contact + admin contacts
   contact id=9cf3ab93-0891-4279-bb14-c1a13b68cc69
22. GET /feedback/posts
23. POST /auth/logout
NEG-02 cart without token → 401
NEG-04 invalid product id → 404
NEG-05 wrong password → 401
NEG-06 invalid token → 401
PASS — staging API smoke (23 + 7 negative)
```

Also: `API_URL=https://api.dova.dntech.id/api/v1 npm run smoke:week4` → **PASS**
