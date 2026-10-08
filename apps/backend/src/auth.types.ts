import { Request } from 'express';
import { Role } from 'dova-shared';
import { StoredUser } from './database.service';

export type AuthUser = StoredUser;

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
  rawBody?: Buffer;
}

export const ROLES_KEY = 'roles';
export const IS_PUBLIC_KEY = 'isPublic';
export const OPTIONAL_AUTH_KEY = 'optionalAuth';
export const SKIP_INTEGRATION_KEY = 'skipIntegration';
export const REQUIRE_INTEGRATION_KEY = 'requireIntegration';

export type RoleList = Role[];
