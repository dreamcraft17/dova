import { assertProductionSecrets } from './env-guard';

describe('assertProductionSecrets', () => {
  it('allows development defaults', () => {
    expect(() => assertProductionSecrets({ NODE_ENV: 'development', JWT_SECRET: 'change-me-in-development' })).not.toThrow();
  });

  it('rejects weak JWT secret in production when strict mode is enabled', () => {
    expect(() => assertProductionSecrets({ NODE_ENV: 'production', JWT_SECRET: 'change-me-in-development', STRICT_PRODUCTION_SECRETS: 'true' })).toThrow(/JWT_SECRET/);
  });

  it('warns but does not throw for weak JWT secret by default in production', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => undefined);
    expect(() => assertProductionSecrets({ NODE_ENV: 'production', JWT_SECRET: 'change-me-in-development' })).not.toThrow();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('accepts strong JWT secret in production', () => {
    expect(() => assertProductionSecrets({ NODE_ENV: 'production', JWT_SECRET: 'a'.repeat(32) })).not.toThrow();
  });
});
