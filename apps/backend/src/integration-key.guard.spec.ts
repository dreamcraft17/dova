import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IntegrationKeyGuard } from './integration-key.guard';
import { REQUIRE_INTEGRATION_KEY, SKIP_INTEGRATION_KEY } from './auth.types';

function mockContext(req: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;
}

describe('IntegrationKeyGuard', () => {
  const reflector = { getAllAndOverride: jest.fn() } as unknown as Reflector;
  const guard = new IntegrationKeyGuard(reflector);

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.DOVA_INTEGRATION_KEYS = 'partner:test-integration-key';
    process.env.FRONTEND_URL = 'https://dova.dntech.id';
    delete process.env.CORS_ORIGINS;
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
  });

  it('does not require a key on internal routes such as login', () => {
    expect(guard.canActivate(mockContext({ headers: {} }))).toBe(true);
  });

  it('allows SkipIntegration routes without a key', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === SKIP_INTEGRATION_KEY);
    expect(guard.canActivate(mockContext({ headers: {} }))).toBe(true);
  });

  it('allows catalog traffic when no integration keys are configured', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === REQUIRE_INTEGRATION_KEY);
    delete process.env.DOVA_INTEGRATION_KEYS;
    expect(guard.canActivate(mockContext({ headers: {} }))).toBe(true);
  });

  it('allows the storefront Origin without a partner key', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === REQUIRE_INTEGRATION_KEY);
    expect(guard.canActivate(mockContext({ headers: { origin: 'https://dova.dntech.id' } }))).toBe(true);
  });

  it('rejects external catalog access without a key', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === REQUIRE_INTEGRATION_KEY);
    expect(() => guard.canActivate(mockContext({ headers: {} }))).toThrow(UnauthorizedException);
  });

  it('rejects the wrong partner key', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === REQUIRE_INTEGRATION_KEY);
    expect(() => guard.canActivate(mockContext({ headers: { 'x-api-key': 'nope' } }))).toThrow(UnauthorizedException);
  });

  it('accepts a configured partner secret', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === REQUIRE_INTEGRATION_KEY);
    expect(guard.canActivate(mockContext({ headers: { 'x-api-key': 'test-integration-key' } }))).toBe(true);
  });
});
