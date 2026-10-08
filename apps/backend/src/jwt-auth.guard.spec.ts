import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AppService } from './app.service';
import { IS_PUBLIC_KEY, OPTIONAL_AUTH_KEY } from './auth.types';

function mockContext(req: Record<string, unknown>): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => req }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  const appService = {
    userFromToken: jest.fn(async (token: string) => ({ id: 'u1', token })),
  } as unknown as AppService;
  const reflector = {
    getAllAndOverride: jest.fn((_key: string) => false),
  } as unknown as Reflector;
  const guard = new JwtAuthGuard(reflector, appService);

  beforeEach(() => {
    jest.clearAllMocks();
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => {
      if (key === IS_PUBLIC_KEY || key === OPTIONAL_AUTH_KEY) return false;
      return false;
    });
  });

  it('prefers Authorization Bearer over stale accessToken cookie', async () => {
    const ctx = mockContext({
      headers: { authorization: 'Bearer fresh-token' },
      cookies: { accessToken: 'stale-cookie-token' },
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(appService.userFromToken).toHaveBeenCalledWith('fresh-token');
  });

  it('falls back to cookie when Bearer header is absent', async () => {
    const ctx = mockContext({
      headers: {},
      cookies: { accessToken: 'cookie-only' },
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(appService.userFromToken).toHaveBeenCalledWith('cookie-only');
  });

  it('throws Unauthorized when no token', async () => {
    const ctx = mockContext({ headers: {}, cookies: {} });
    await expect(guard.canActivate(ctx)).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('allows public routes without a token', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === IS_PUBLIC_KEY);
    const ctx = mockContext({ headers: {}, cookies: {} });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(appService.userFromToken).not.toHaveBeenCalled();
  });

  it('allows optional auth when no token is present', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === OPTIONAL_AUTH_KEY);
    const ctx = mockContext({ headers: {}, cookies: {} });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
    expect(appService.userFromToken).not.toHaveBeenCalled();
  });

  it('ignores invalid tokens on optional-auth routes', async () => {
    (reflector.getAllAndOverride as jest.Mock).mockImplementation((key: string) => key === OPTIONAL_AUTH_KEY);
    (appService.userFromToken as jest.Mock).mockRejectedValueOnce(new Error('expired'));
    const ctx = mockContext({
      headers: { authorization: 'Bearer stale' },
      cookies: {},
    });
    await expect(guard.canActivate(ctx)).resolves.toBe(true);
  });
});
