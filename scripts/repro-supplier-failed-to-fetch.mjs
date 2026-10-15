#!/usr/bin/env node
/**
 * Reproduces why suppliers see browser "Failed to fetch" on Publish Product
 * when the storefront calls the API cross-origin with a disallowed Origin.
 *
 * Usage: node scripts/repro-supplier-failed-to-fetch.mjs
 * Env:   API_BASE=https://api.dova.dntech.id/api/v1 (default)
 */

const API_BASE = (process.env.API_BASE || 'https://api.dova.dntech.id/api/v1').replace(/\/$/, '');

const STOREFRONTS = [
  'https://dova.dntech.id',
  'https://dovachain.com',
  'http://localhost:3005',
];

async function corsPreflight(origin, path = '/suppliers/products', method = 'POST') {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: 'OPTIONS',
    headers: {
      Origin: origin,
      'Access-Control-Request-Method': method,
      'Access-Control-Request-Headers': 'content-type,authorization',
    },
  });
  return {
    status: res.status,
    allowOrigin: res.headers.get('access-control-allow-origin'),
    allowCredentials: res.headers.get('access-control-allow-credentials'),
  };
}

function browserWouldBlock(origin, allowOrigin) {
  if (!allowOrigin) return true;
  return allowOrigin !== origin;
}

console.log('DOVA supplier publish — CORS reproduction');
console.log('API:', API_BASE);
console.log('');

let failures = 0;
for (const origin of STOREFRONTS) {
  try {
    const result = await corsPreflight(origin);
    const blocked = browserWouldBlock(origin, result.allowOrigin);
    if (blocked) failures += 1;
    console.log(`Storefront Origin: ${origin}`);
    console.log(`  OPTIONS /suppliers/products → ${result.status}`);
    console.log(`  Access-Control-Allow-Origin: ${result.allowOrigin ?? '(missing)'}`);
    console.log(
      `  Browser cross-origin POST: ${blocked ? 'BLOCKED → "Failed to fetch"' : 'allowed (still prefer /api/gateway)'}`,
    );
    console.log('');
  } catch (err) {
    failures += 1;
    console.log(`Storefront Origin: ${origin}`);
    console.log(`  ERROR: ${err.message}`);
    console.log('');
  }
}

console.log('---');
console.log(
  failures > 0
    ? `Repro confirmed: ${failures} origin(s) would get "Failed to fetch" if NEXT_PUBLIC_API_URL points at the API host.`
    : 'All tested origins allowed — check gateway env on Vercel instead.',
);
console.log('Fix: storefront uses NEXT_PUBLIC_API_URL=/api/gateway (same-origin), OR add storefront URL to API FRONTEND_URL/CORS_ORIGINS.');
process.exit(failures > 0 ? 1 : 0);
