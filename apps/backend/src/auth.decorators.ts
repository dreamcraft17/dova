import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';
import { AuthenticatedRequest, IS_PUBLIC_KEY, OPTIONAL_AUTH_KEY, ROLES_KEY, RoleList } from './auth.types';
import { Role } from 'dova-shared';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
export const OptionalAuth = () => SetMetadata(OPTIONAL_AUTH_KEY, true);
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles as RoleList);

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest<AuthenticatedRequest>();
  return request.user;
});
