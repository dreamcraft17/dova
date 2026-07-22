require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const fs = require('fs'); const path = require('path'); const { Pool } = require('pg');
if (!process.env.DATABASE_URL) { console.error('DATABASE_URL is required'); process.exit(1); }
(async () => { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); try { await pool.query(fs.readFileSync(path.resolve(__dirname, '../database/migrations/001_init.sql'), 'utf8')); console.log('Database migration completed'); } finally { await pool.end(); } })().catch(error => { console.error(error); process.exit(1); });
