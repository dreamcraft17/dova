require('./load-env').loadDovaEnv();
const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}
(async () => {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const dir = path.resolve(__dirname, '../database/migrations');
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        applied_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `);
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      const applied = await pool.query('SELECT 1 FROM schema_migrations WHERE filename = $1 LIMIT 1', [file]);
      if (applied.rowCount) {
        console.log(`Skip ${file} (already applied)`);
        continue;
      }
      await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
      await pool.query('INSERT INTO schema_migrations (filename) VALUES ($1)', [file]);
      console.log(`Applied ${file}`);
    }
    console.log('Database migration completed');
  } finally {
    await pool.end();
  }
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
