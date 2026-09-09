import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthenticatedRequest, REQUIRE_INTEGRATION_KEY, SKIP_INTEGRATION_KEY } from './auth.types';
import { firstHeaderValue, integrationKeyMatches, isInternalFrontendRequest, parseIntegrationKeyHashes } from './integration-keys';

@Injectable()
export class IntegrationKeyGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_INTEGRATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (skip) return true;

    const required = this.reflector.getAllAndOverride<boolean>(REQUIRE_INTEGRATION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!required) return true;

    const hashes = parseIntegrationKeyHashes(process.env.DOVA_INTEGRATION_KEYS);
    if (!hashes.length) return true;

    const req = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (isInternalFrontendRequest(req.headers)) return true;

    const presented = firstHeaderValue(req.headers['x-api-key']);
    if (!integrationKeyMatches(presented, hashes)) {
      throw new UnauthorizedException({ message: 'Valid X-Api-Key required', code: 'INTEGRATION_REQUIRED' });
    }
    return true;
  }
}
