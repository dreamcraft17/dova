/**
 * Force-reset demo admin/supplier passwords in Postgres.
 * Ignores ADMIN_PASSWORD env unless DEMO_USE_ENV=1 is set.
 *
 * Usage:
 *   node scripts/reset-demo-logins.js
 *   ADMIN_DEMO_PASSWORD=admin1234 SUPPLIER_DEMO_PASSWORD=supplier1234 node scripts/reset-demo-logins.js
 */
require('./load-env').loadDovaEnv();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const adminPlain =
  process.env.DEMO_USE_ENV === '1'
    ? process.env.ADMIN_PASSWORD || 'admin1234'
    : process.env.ADMIN_DEMO_PASSWORD || 'admin1234';
const supplierPlain =
  process.env.DEMO_USE_ENV === '1'
    ? process.env.SUPPLIER_PASSWORD || 'supplier1234'
    : process.env.SUPPLIER_DEMO_PASSWORD || 'supplier1234';

(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const adminHash = bcrypt.hashSync(adminPlain, 12);
    const supplierHash = bcrypt.hashSync(supplierPlain, 12);

    await pool.query(
      `INSERT INTO users (id,email,password_hash,full_name,role,is_active)
       VALUES ($1,'admin@dova.local',$2,'DOVA Admin','admin',TRUE)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         is_active = TRUE,
         updated_at = NOW()`,
      [randomUUID(), adminHash],
    );

    const supplierUser = await pool.query(
      `INSERT INTO users (id,email,password_hash,full_name,role,is_active)
       VALUES ($1,'supplier@dova.local',$2,'Demo Supplier','supplier',TRUE)
       ON CONFLICT (email) DO UPDATE SET
         password_hash = EXCLUDED.password_hash,
         full_name = EXCLUDED.full_name,
         role = EXCLUDED.role,
         is_active = TRUE,
         updated_at = NOW()
       RETURNING id`,
      [randomUUID(), supplierHash],
    );

    const supplierUserId = supplierUser.rows[0].id;
    await pool.query(
      `INSERT INTO supplier_profiles (id,user_id,business_name,business_phone,verification_status)
       VALUES ($1,$2,'Green Valley Farms','+62000000000','approved')
       ON CONFLICT (user_id) DO UPDATE SET
         verification_status = 'approved',
         updated_at = NOW()`,
      [randomUUID(), supplierUserId],
    );

    console.log('Demo logins reset successfully:');
    console.log(`  admin@dova.local     → ${adminPlain}`);
    console.log(`  supplier@dova.local  → ${supplierPlain}`);
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
