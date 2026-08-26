const WEAK_JWT_SECRETS = new Set(['', 'change-me-in-development', 'change-me']);

export function assertProductionSecrets(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== 'production') return;
  const secret = env.JWT_SECRET ?? '';
  const weak = WEAK_JWT_SECRETS.has(secret) || secret.length < 32;
  if (!weak) return;
  const message = 'JWT_SECRET must be a strong secret (≥32 chars) in production';
  if (env.STRICT_PRODUCTION_SECRETS === 'true') throw new Error(message);
  console.warn(`[DOVA] ${message}. Set a strong JWT_SECRET in apps/backend/.env on the VPS.`);
}
