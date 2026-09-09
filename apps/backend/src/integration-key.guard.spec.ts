import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IntegrationKeyGuard } from './integration-key.guard';
import { SKIP_INTEGRATION_KEY } from './auth.types';

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
    process.env.DOVA_INTEGRATION_KEYS = 'storefront:test-integration-key';
    (reflector.getAllAndOverride as jest.Mock).mockReturnValue(false);
  });

  it('allows SkipIntegration routes without a key', () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === SKIP_INTEGRATION_KEY);
    expect(guard.canActivate(mockContext({ headers: {} }))).toBe(true);
  });

  it('rejects missing keys', () => {
    expect(() => guard.canActivate(mockContext({ headers: {} }))).toThrow(UnauthorizedException);
  });

  it('rejects the wrong key', () => {
    expect(() => guard.canActivate(mockContext({ headers: { 'x-api-key': 'nope' } }))).toThrow(UnauthorizedException);
  });

  it('accepts a configured secret', () => {
    expect(guard.canActivate(mockContext({ headers: { 'x-api-key': 'test-integration-key' } }))).toBe(true);
  });
});
