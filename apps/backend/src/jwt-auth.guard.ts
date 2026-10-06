import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppService } from './app.service';
import { AuthenticatedRequest, IS_PUBLIC_KEY, OPTIONAL_AUTH_KEY } from './auth.types';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector, private readonly appService: AppService) {}

  private extractToken(req: AuthenticatedRequest) {
    const bearer = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
    // Prefer explicit Bearer token — stale httpOnly cookies on cross-subdomain staging
    // must not override a fresh token the SPA just stored after login.
    if (bearer) return bearer;
    return req.cookies?.accessToken;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const optional = this.reflector.getAllAndOverride<boolean>(OPTIONAL_AUTH_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(req);
    if (!token) {
      if (optional) return true;
      throw new UnauthorizedException();
    }
    try {
      req.user = await this.appService.userFromToken(token);
      return true;
    } catch {
      if (optional) return true;
      throw new UnauthorizedException();
    }
  }
}
