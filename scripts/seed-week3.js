require('./load-env').loadDovaEnv();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

(async () => {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  try {
    const categories = await pool.query('SELECT id FROM categories ORDER BY name');
    for (let i = 1; i <= 5; i++) {
      const email = `supplier${i}@dova.local`;
      const passwordHash = bcrypt.hashSync(`supplier${i}1234`, 12);
      const user = await pool.query('INSERT INTO users (email,password_hash,full_name,role) VALUES ($1,$2,$3,$4) ON CONFLICT (email) DO UPDATE SET is_active=TRUE RETURNING id', [email, passwordHash, `Test Supplier ${i}`, 'supplier']);
      const userId = user.rows[0]?.id || (await pool.query('SELECT id FROM users WHERE email=$1', [email])).rows[0].id;
      await pool.query("INSERT INTO supplier_profiles (user_id,business_name,business_phone,verification_status) VALUES ($1,$2,$3,'approved') ON CONFLICT (user_id) DO UPDATE SET verification_status='approved'", [userId, `Test Supplier ${i}`, `+6200000000${i}`]);
      const profile = await pool.query('SELECT id FROM supplier_profiles WHERE user_id=$1', [userId]);
      await pool.query('INSERT INTO products (supplier_id,name,description,price,stock_quantity,category_id) VALUES ($1,$2,$3,$4,$5,$6)', [profile.rows[0].id, `Test Product ${i}`, 'Week 3 supplier fixture product', 10000 + i * 1000, 25, categories.rows[i % categories.rows.length].id]);
    }
    console.log('Week 3 fixture seeded: 5 approved suppliers');
  } finally { await pool.end(); }
})().catch(error => { console.error(error); process.exit(1); });
