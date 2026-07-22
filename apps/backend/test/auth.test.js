const assert = require('node:assert/strict');
const { JwtService } = require('@nestjs/jwt');
const { AppService } = require('../dist/app.service');

(async () => {
  const database = { enabled: false, insertUser: async () => {}, saveSession: async () => {}, hasSession: async () => true, revokeSession: async () => {} };
  const redis = { enabled: false, set: async () => {}, get: async () => null, del: async () => {} };
  const service = new AppService(new JwtService({ secret: 'test-secret' }), database, redis);
  const created = await service.register({ fullName: 'Test Customer', email: 'test@example.com', password: 'password123', confirmPassword: 'password123' });
  assert.equal(created.role, 'customer');
  await assert.rejects(() => service.register({ fullName: 'Duplicate', email: 'test@example.com', password: 'password123', confirmPassword: 'password123' }));
  const session = await service.login('test@example.com', 'password123');
  assert.equal((await service.userFromToken(session.accessToken)).email, 'test@example.com');
  assert.equal((await service.refresh(session.refreshToken)).user.email, 'test@example.com');
  service.revoke(session.accessToken);
  await assert.rejects(() => service.userFromToken(session.accessToken));
  console.log('Week 1 auth tests passed');
})().catch(error => { console.error(error); process.exitCode = 1; });
