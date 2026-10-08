import { existsSync } from 'fs';
import { resolve } from 'path';
import { config } from 'dotenv';

/** Load monorepo root .env then apps/backend/.env (PM2 cwd may differ). */
export function loadBackendEnv() {
  const backendRoot = resolve(__dirname, '..');
  const monorepoRoot = resolve(__dirname, '../../..');
  const files = [
    resolve(monorepoRoot, '.env'),
    resolve(backendRoot, '.env'),
  ];
  for (const file of files) {
    if (existsSync(file)) {
      config({ path: file, override: true });
    }
  }
}
