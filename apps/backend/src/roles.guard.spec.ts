import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppService } from './app.service';
import { Roles } from './auth.decorators';
import { RolesGuard } from './roles.guard';

class Open {
  handler() {}
}

@Roles('admin')
class AdminOnly {
  handler() {}
  @Roles('supplier', 'admin')
  shared() {}
}

function contextFor(cls: new () => object, method: string, user?: { role: string }) {
  return {
    getHandler: () => (cls.prototype as Record<string, () => void>)[method],
    getClass: () => cls,
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  // The real requireRole does not touch `this`, so the guard is tested against production logic.
  const appService = { requireRole: AppService.prototype.requireRole } as unknown as AppService;
  const guard = new RolesGuard(new Reflector(), appService);

  it('lets any request through a route with no @Roles', () => {
    expect(guard.canActivate(contextFor(Open, 'handler', { role: 'customer' }))).toBe(true);
    expect(guard.canActivate(contextFor(Open, 'handler'))).toBe(true);
  });

  it('allows a user whose role matches the class-level @Roles', () => {
    expect(guard.canActivate(contextFor(AdminOnly, 'handler', { role: 'admin' }))).toBe(true);
  });

  it.each(['customer', 'supplier'])('forbids %s on an admin-only class', (role) => {
    expect(() => guard.canActivate(contextFor(AdminOnly, 'handler', { role }))).toThrow(ForbiddenException);
  });

  it('lets a method-level @Roles override the class-level one', () => {
    expect(guard.canActivate(contextFor(AdminOnly, 'shared', { role: 'supplier' }))).toBe(true);
    expect(() => guard.canActivate(contextFor(AdminOnly, 'shared', { role: 'customer' }))).toThrow(ForbiddenException);
  });

  it('answers 401 instead of crashing when a role-protected route has no authenticated user', () => {
    expect(() => guard.canActivate(contextFor(AdminOnly, 'handler'))).toThrow(UnauthorizedException);
  });
});
