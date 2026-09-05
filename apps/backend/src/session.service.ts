import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { createHash } from 'crypto';
import { Role } from 'dova-shared';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { AppStateService, UserRecord } from './app-state.service';
import { UserDirectoryService } from './user-directory.service';

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_TTL_MS_REMEMBERED = 30 * 24 * 60 * 60 * 1000;

@Injectable()
export class SessionService {
  constructor(
    private readonly jwt: JwtService,
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
    private readonly state: AppStateService,
    private readonly users: UserDirectoryService,
  ) {}

  tokensFor(u: UserRecord, rememberMe = false) {
    return {
      user: this.users.publicUser(u),
      accessToken: this.jwt.sign({ sub: u.id, email: u.email, role: u.role }),
      refreshToken: this.jwt.sign({ sub: u.id, type: 'refresh' }, { expiresIn: rememberMe ? '30d' : '1d' }),
    };
  }

  private sessionKey(token: string) {
    return `dova:session:${createHash('sha256').update(token).digest('hex')}`;
  }

  private async cacheSession(userId: string, accessToken: string, refreshToken: string, refreshTtlSeconds = 604800) {
    await this.redis.set(this.sessionKey(accessToken), userId, 900);
    await this.redis.set(this.sessionKey(refreshToken), userId, refreshTtlSeconds);
  }

  /** Issues a fresh access/refresh token pair and persists it to the DB session store + Redis cache. */
  async issueSession(user: UserRecord, rememberMe = false) {
    const result = this.tokensFor(user, rememberMe);
    const refreshMs = rememberMe ? REFRESH_TOKEN_TTL_MS_REMEMBERED : REFRESH_TOKEN_TTL_MS;
    await this.database.saveSession(user.id, result.accessToken, new Date(Date.now() + ACCESS_TOKEN_TTL_MS));
    await this.database.saveSession(user.id, result.refreshToken, new Date(Date.now() + refreshMs));
    await this.cacheSession(user.id, result.accessToken, result.refreshToken, refreshMs / 1000);
    return result;
  }

  async login(email: string, password: string, rememberMe = false) {
    const u = await this.users.findUser(email);
    if (!u || !bcrypt.compareSync(password, u.passwordHash)) throw new UnauthorizedException('Invalid credentials');
    if (!u.isActive) throw new UnauthorizedException('Account is deactivated. Contact support if you need help.');
    return this.issueSession(u, rememberMe);
  }

  private useLocalRevocation() {
    return !this.database.enabled;
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken || (this.useLocalRevocation() && this.state.revokedTokens.has(refreshToken))) {
      throw new UnauthorizedException('Invalid refresh token');
    }
    try {
      const payload = this.jwt.verify<{ sub: string; type?: string }>(refreshToken);
      if (
        payload.type !== 'refresh' ||
        !(await this.database.hasSession(payload.sub, refreshToken)) ||
        (this.redis.enabled && (await this.redis.get(this.sessionKey(refreshToken))) !== payload.sub)
      ) {
        throw new UnauthorizedException('Invalid refresh token');
      }
      const u = await this.users.findUser(payload.sub, true);
      if (!u) throw new UnauthorizedException('Invalid refresh token');
      const result = this.tokensFor(u);
      await this.database.saveSession(u.id, result.accessToken, new Date(Date.now() + ACCESS_TOKEN_TTL_MS));
      await this.database.saveSession(u.id, result.refreshToken, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000));
      await this.cacheSession(u.id, result.accessToken, result.refreshToken);
      return result;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async revoke(token?: string, refreshToken?: string) {
    if (this.useLocalRevocation()) {
      if (token) this.state.revokedTokens.add(token);
      if (refreshToken) this.state.revokedTokens.add(refreshToken);
    }
    await this.database.revokeSession(token);
    await this.database.revokeSession(refreshToken);
    if (token) await this.redis.del(this.sessionKey(token));
    if (refreshToken) await this.redis.del(this.sessionKey(refreshToken));
  }

  async userFromToken(token?: string): Promise<UserRecord> {
    if (!token || (this.useLocalRevocation() && this.state.revokedTokens.has(token))) throw new UnauthorizedException();
    try {
      const payload = this.jwt.verify<{ sub: string }>(token);
      const u = await this.users.findUser(payload.sub, true);
      if (
        !u ||
        !(await this.database.hasSession(u.id, token)) ||
        (this.redis.enabled && (await this.redis.get(this.sessionKey(token))) !== u.id)
      ) {
        throw new UnauthorizedException();
      }
      return u;
    } catch {
      throw new UnauthorizedException();
    }
  }

  requireRole(u: UserRecord, roles: Role[]) {
    if (!roles.includes(u.role)) throw new ForbiddenException();
  }
}
