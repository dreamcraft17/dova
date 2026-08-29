#!/usr/bin/env node
/** Full production API smoke (30 steps + NEG-01..10). Default: api.dova.dntech.id */
const fs = require('fs');
const path = require('path');

const SMOKE_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const BASE = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.dova.dntech.id/api/v1';
const lines = [];
const log = (msg) => {
  const line = `[${new Date().toISOString()}] ${msg}`;
  lines.push(line);
  console.log(msg);
};

async function req(method, urlPath, { token, body, expectStatus } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${urlPath}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  if (expectStatus !== undefined && res.status !== expectStatus) {
    throw new Error(`${method} ${urlPath} expected ${expectStatus} got ${res.status}: ${JSON.stringify(data)}`);
  }
  return { status: res.status, data };
}

async function reqOk(method, urlPath, opts = {}) {
  const res = await req(method, urlPath, opts);
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`${method} ${urlPath} expected 200/201 got ${res.status}: ${JSON.stringify(res.data)}`);
  }
  return res;
}

async function reqMultipart(method, urlPath, { token, fields, file, expectStatus } = {}) {
  const form = new FormData();
  for (const [key, value] of Object.entries(fields || {})) {
    form.append(key, String(value));
  }
  if (file) {
    form.append(file.field, new Blob([file.buffer], { type: file.mime }), file.name);
  }
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${urlPath}`, { method, headers, body: form });
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text.slice(0, 200) };
  }
  if (expectStatus !== undefined && res.status !== expectStatus) {
    throw new Error(`${method} ${urlPath} expected ${expectStatus} got ${res.status}: ${JSON.stringify(data)}`);
  }
  if (expectStatus === undefined && res.status !== 200 && res.status !== 201) {
    throw new Error(`${method} ${urlPath} expected 200/201 got ${res.status}: ${JSON.stringify(data)}`);
  }
  return { status: res.status, data };
}

async function waitForHealth(maxAttempts = 15, delayMs = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(`${BASE}/health`);
      if (res.status === 200) {
        const data = await res.json();
        if (data?.status === 'ok') return;
      }
    } catch {
      // upstream not ready yet (502 during PM2 restart)
    }
    if (attempt < maxAttempts) {
      log(`   /health not ready (${attempt}/${maxAttempts}), retry in ${delayMs / 1000}s…`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new Error(`GET /health did not return 200 after ${maxAttempts} attempts (~${(maxAttempts * delayMs) / 1000}s)`);
}

async function login(email, password) {
  const res = await req('POST', '/auth/login', {
    body: { email, password, rememberMe: true },
  });
  if (res.status !== 200 && res.status !== 201) {
    throw new Error(`login ${email} expected 200/201 got ${res.status}`);
  }
  if (!res.data.accessToken) throw new Error(`login missing token for ${email}`);
  return res.data;
}

async function main() {
  log(`BASE=${BASE}`);
  log('1. GET /health');
  await waitForHealth();
  await req('GET', '/health', { expectStatus: 200 });

  log('2-3. Admin login + /auth/me');
  const admin = await login('admin@dova.local', 'admin1234');
  await req('GET', '/auth/me', { token: admin.accessToken, expectStatus: 200 });

  log('4. GET /categories');
  await req('GET', '/categories', { expectStatus: 200 });

  log('5. GET /products');
  const products = await req('GET', '/products', { expectStatus: 200 });
  const list = Array.isArray(products.data) ? products.data : products.data?.data;
  const productId = list?.[0]?.id;
  if (!productId) throw new Error('no products on production');

  const customerEmail = `qa.softlaunch.${Date.now()}@example.com`;
  log(`6. POST /auth/register (${customerEmail})`);
  await req('POST', '/auth/register', {
    body: {
      fullName: 'QA Soft Launch',
      email: customerEmail,
      password: 'password123',
      confirmPassword: 'password123',
    },
    expectStatus: 201,
  });

  log('6b. login before verify → 401');
  await req('POST', '/auth/login', {
    body: { email: customerEmail, password: 'password123', rememberMe: true },
    expectStatus: 401,
  });

  const otpCode = process.env.SMOKE_OTP_CODE || process.env.DOVA_QA_FIXED_OTP;
  if (!otpCode) {
    throw new Error('Set SMOKE_OTP_CODE or DOVA_QA_FIXED_OTP (must match server DOVA_QA_FIXED_OTP for qa.softlaunch.* emails)');
  }
  log(`6c. POST /auth/verify-otp (${customerEmail})`);
  const verified = await req('POST', '/auth/verify-otp', {
    body: { email: customerEmail, code: otpCode, rememberMe: true },
  });
  if (verified.status !== 200 && verified.status !== 201) {
    throw new Error(`verify-otp expected 200/201 got ${verified.status}: ${JSON.stringify(verified.data)}`);
  }
  const customer = verified.data;
  if (!customer.accessToken) throw new Error('verify-otp missing accessToken');

  log('6d. PATCH /auth/me + GET verify');
  await reqOk('PATCH', '/auth/me', {
    token: customer.accessToken,
    body: { fullName: 'QA Soft Launch Updated', phoneNumber: '+2348012345678' },
  });
  const meAfterPatch = await req('GET', '/auth/me', { token: customer.accessToken, expectStatus: 200 });
  if (meAfterPatch.data.fullName !== 'QA Soft Launch Updated') {
    throw new Error(`PATCH profile fullName mismatch: ${meAfterPatch.data.fullName}`);
  }
  if (meAfterPatch.data.phoneNumber !== '+2348012345678') {
    throw new Error(`PATCH profile phoneNumber mismatch: ${meAfterPatch.data.phoneNumber}`);
  }

  log('7-8. Cart add + get');
  await req('POST', '/cart/add', {
    token: customer.accessToken,
    body: { productId, quantity: 3, deliverySlot: 'morning' },
    expectStatus: 201,
  });
  await req('GET', '/cart', { token: customer.accessToken, expectStatus: 200 });

  log('9. POST /orders');
  const order = await req('POST', '/orders', {
    token: customer.accessToken,
    body: {
      fulfillmentType: 'pickup',
      deliveryName: 'QA Pickup',
      deliveryPhone: '+2348000000000',
    },
  });
  if (order.status !== 201 && order.status !== 200) {
    throw new Error(`POST /orders expected 201 got ${order.status}: ${JSON.stringify(order.data)}`);
  }
  const orderId = order.data?.id || order.data?.orderId;
  const orderAmount = order.data?.total ?? order.data?.totalAmount ?? 3000;

  log('10. POST /payments/initialize');
  const pay = await req('POST', '/payments/initialize', {
    token: customer.accessToken,
    body: { orderId, amount: Number(orderAmount) },
  });
  if (pay.status !== 201 && pay.status !== 200) {
    throw new Error(`payments/initialize failed ${pay.status}: ${JSON.stringify(pay.data)}`);
  }
  log(`   payment ref=${pay.data?.reference || pay.data?.data?.reference || 'mock'}`);

  log('11. GET /orders');
  await req('GET', '/orders', { token: customer.accessToken, expectStatus: 200 });

  log('NEG-01 admin with customer token → 403');
  await req('GET', '/admin/dashboard', { token: customer.accessToken, expectStatus: 403 });

  log('NEG-03 cart/add qty 0 → 400');
  await req('POST', '/cart/add', {
    token: customer.accessToken,
    body: { productId, quantity: 0 },
    expectStatus: 400,
  });

  log('NEG-07 empty cart order → 400');
  await req('POST', '/orders', {
    token: customer.accessToken,
    body: {
      fulfillmentType: 'pickup',
      deliveryName: 'X',
      deliveryPhone: '+2348000000001',
    },
    expectStatus: 400,
  });

  log('12-14. Supplier login + products + orders');
  const supplier = await login('supplier@dova.local', 'supplier1234');
  await req('GET', '/suppliers/products', { token: supplier.accessToken, expectStatus: 200 });
  await req('GET', '/suppliers/orders', { token: supplier.accessToken, expectStatus: 200 });

  log('14b. Supplier multipart POST /suppliers/products (image upload)');
  const categoriesRes = await req('GET', '/categories', { expectStatus: 200 });
  const categoryList = Array.isArray(categoriesRes.data) ? categoriesRes.data : categoriesRes.data?.data;
  const categoryId = categoryList?.[0]?.id;
  if (!categoryId) throw new Error('no category available for supplier upload smoke');
  const uploadName = `Smoke Upload ${Date.now()}`;
  const created = await reqMultipart('POST', '/suppliers/products', {
    token: supplier.accessToken,
    fields: {
      name: uploadName,
      description: 'Automated multipart smoke product',
      price: '5000',
      quantity: '10',
      categoryId,
    },
    file: { field: 'image', buffer: SMOKE_PNG, mime: 'image/png', name: 'smoke.png' },
  });
  const imageUrl = created.data?.imageUrl || '';
  if (!imageUrl.includes('/uploads/products/') && !imageUrl.startsWith('data:image/')) {
    throw new Error(`unexpected product imageUrl: ${imageUrl}`);
  }
  if (created.data?.id) {
    await req('DELETE', `/suppliers/products/${created.data.id}`, {
      token: supplier.accessToken,
      expectStatus: 200,
    });
  }

  log('15-19. Admin dashboard, suppliers, users, orders');
  await req('GET', '/admin/dashboard', { token: admin.accessToken, expectStatus: 200 });
  await req('GET', '/admin/suppliers/pending', { token: admin.accessToken, expectStatus: 200 });
  await req('GET', '/admin/users', { token: admin.accessToken, expectStatus: 200 });
  await req('GET', '/admin/orders', { token: admin.accessToken, expectStatus: 200 });

  log('19b. Admin delete pending user (no orders)');
  const pendingEmail = `qa.delete.${Date.now()}@example.com`;
  await req('POST', '/auth/register', {
    body: {
      fullName: 'QA Delete Target',
      email: pendingEmail,
      password: 'password123',
      confirmPassword: 'password123',
    },
    expectStatus: 201,
  });
  const usersAfterRegister = await req('GET', '/admin/users', { token: admin.accessToken, expectStatus: 200 });
  const userList = Array.isArray(usersAfterRegister.data) ? usersAfterRegister.data : usersAfterRegister.data?.data;
  const pendingUser = userList.find((entry) => entry.email === pendingEmail);
  if (!pendingUser?.id) throw new Error(`pending user ${pendingEmail} not found in admin users`);
  await req('DELETE', `/admin/users/${pendingUser.id}`, { token: admin.accessToken, expectStatus: 200 });

  log('NEG-08 customer DELETE admin user → 403');
  const adminMe = await req('GET', '/auth/me', { token: admin.accessToken, expectStatus: 200 });
  await req('DELETE', `/admin/users/${adminMe.data.id}`, { token: customer.accessToken, expectStatus: 403 });

  log('NEG-09 admin DELETE self → 400');
  await req('DELETE', `/admin/users/${adminMe.data.id}`, { token: admin.accessToken, expectStatus: 400 });

  log('20-21. Contact + admin contacts');
  const contact = await req('POST', '/contact', {
    body: { name: 'Smoke Soft Launch', email: 'smoke@dova.local', message: 'Soft launch API smoke' },
    expectStatus: 201,
  });
  log(`   contact id=${contact.data?.id || 'ok'}`);
  await req('GET', '/admin/contacts', { token: admin.accessToken, expectStatus: 200 });

  log('22. GET /feedback/posts');
  await req('GET', '/feedback/posts', { expectStatus: 200 });

  log('23. POST /auth/logout');
  const logout = await req('POST', '/auth/logout', { token: customer.accessToken });
  if (logout.status !== 200 && logout.status !== 201) {
    throw new Error(`logout expected 200/201 got ${logout.status}`);
  }

  log('NEG-02 cart without token → 401');
  await req('GET', '/cart', { expectStatus: 401 });

  log('NEG-04 invalid product id → 404');
  await req('GET', '/products/not-a-uuid', { expectStatus: 404 });

  log('NEG-05 wrong password → 401');
  await req('POST', '/auth/login', {
    body: { email: 'admin@dova.local', password: 'wrongpass', rememberMe: false },
    expectStatus: 401,
  });

  log('NEG-06 invalid token → 401');
  await req('GET', '/auth/me', { token: 'invalid.jwt.token', expectStatus: 401 });

  log('24-26. Forgot + reset password (verified customer)');
  await reqOk('POST', '/auth/forgot-password', {
    body: { email: customerEmail },
  });
  await reqOk('POST', '/auth/reset-password', {
    body: {
      email: customerEmail,
      code: otpCode,
      password: 'newpassword123',
      confirmPassword: 'newpassword123',
    },
  });
  const relogin = await req('POST', '/auth/login', {
    body: { email: customerEmail, password: 'newpassword123', rememberMe: true },
  });
  if (relogin.status !== 200 && relogin.status !== 201) {
    throw new Error(`login after reset expected 200/201 got ${relogin.status}`);
  }

  log('NEG-10 login with old password after reset → 401');
  await req('POST', '/auth/login', {
    body: { email: customerEmail, password: 'password123', rememberMe: false },
    expectStatus: 401,
  });

  log('PASS — production API smoke (29 + 10 negative)');
  const out = path.join(__dirname, '../ops/logs/smoke-production-latest.log');
  fs.writeFileSync(out, lines.join('\n') + '\n');
  log(`Log saved: ${out}`);
}

main().catch((err) => {
  log(`FAIL — ${err.message}`);
  const out = path.join(__dirname, '../ops/logs/smoke-production-latest.log');
  fs.writeFileSync(out, lines.join('\n') + '\n');
  process.exit(1);
});
