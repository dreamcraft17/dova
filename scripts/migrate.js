require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
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
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
    for (const file of files) {
      await pool.query(fs.readFileSync(path.join(dir, file), 'utf8'));
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
