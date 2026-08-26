const WEAK_JWT_SECRETS = new Set(['', 'change-me-in-development', 'change-me']);

export function assertProductionSecrets(env: NodeJS.ProcessEnv = process.env) {
  if (env.NODE_ENV !== 'production') return;
  const secret = env.JWT_SECRET ?? '';
  if (WEAK_JWT_SECRETS.has(secret) || secret.length < 32) {
    throw new Error('JWT_SECRET must be a strong secret (≥32 chars) in production');
  }
}
