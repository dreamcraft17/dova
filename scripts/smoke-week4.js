#!/usr/bin/env node
/** Week 4 smoke: health + contact persist (in-memory or DB). */
const API = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL || 'http://localhost:3000/api/v1';

async function main() {
  const health = await fetch(`${API}/health`).then((r) => r.json());
  if (health.status !== 'ok') throw new Error('health failed');
  console.log('OK health');

  const contact = await fetch(`${API}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Smoke Test',
      email: 'smoke@dova.local',
      message: 'Week 4 smoke contact message',
    }),
  }).then(async (r) => ({ ok: r.ok, body: await r.json() }));
  if (!contact.ok) throw new Error(contact.body.message || 'contact failed');
  console.log('OK contact', contact.body.id || contact.body.message);

  console.log('Smoke Week 4 passed');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
