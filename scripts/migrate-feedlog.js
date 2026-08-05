/**
 * Run FeedLog Drizzle migrations against the same DATABASE_URL as DOVA.
 * @author Dozer (@dreamraft17) - Software Engineer
 * Usage: npm run db:migrate:feedlog  (from dova/)
 */
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const { spawnSync } = require('child_process');
const path = require('path');

const databaseUrl = process.env.DATABASE_URL?.trim();
if (!databaseUrl) {
  console.error('DATABASE_URL is required in dova/.env');
  process.exit(1);
}

const feedlogDir = path.resolve(__dirname, '../apps/feedlog');
const result = spawnSync('pnpm', ['migrate'], {
  cwd: feedlogDir,
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: databaseUrl },
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

console.log('FeedLog migrations applied to shared DOVA database');
