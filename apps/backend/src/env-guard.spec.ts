import { assertProductionSecrets } from './env-guard';

describe('assertProductionSecrets', () => {
  it('allows development defaults', () => {
    expect(() => assertProductionSecrets({ NODE_ENV: 'development', JWT_SECRET: 'change-me-in-development' })).not.toThrow();
  });

  it('rejects weak JWT secret in production', () => {
    expect(() => assertProductionSecrets({ NODE_ENV: 'production', JWT_SECRET: 'change-me-in-development' })).toThrow(/JWT_SECRET/);
  });

  it('accepts strong JWT secret in production', () => {
    expect(() => assertProductionSecrets({ NODE_ENV: 'production', JWT_SECRET: 'a'.repeat(32) })).not.toThrow();
  });
});
