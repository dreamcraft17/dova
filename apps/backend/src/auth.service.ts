import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from 'dova-shared';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { AppStateService, UserRecord } from './app-state.service';
import { UserDirectoryService } from './user-directory.service';
import { SessionService } from './session.service';
import { RegistrationService } from './registration.service';
import { AccountService } from './account.service';

/**
 * AuthService is a thin facade over the auth domain services below. It keeps
 * its original constructor signature and public method surface so AppService
 * and the other domain services that depend on it (Order, OrderPayment,
 * Admin) don't need to change — internally, user identity, session/token
 * handling, registration/OTP, and self-service account management are each
 * implemented by their own focused service.
 */
@Injectable()
export class AuthService {
  readonly users: UserDirectoryService;
  readonly session: SessionService;
  readonly registration: RegistrationService;
  readonly account: AccountService;

  constructor(
    private readonly jwt: JwtService,
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
    private readonly state: AppStateService,
  ) {
    this.users = new UserDirectoryService(database, state);
    this.session = new SessionService(jwt, database, redis, state, this.users);
    this.registration = new RegistrationService(database, redis, state, this.users, this.session);
    this.account = new AccountService(database, state, this.users);
  }

  // ---- user directory ----
  makeUser(email: string, fullName: string, role: Role, password: string, opts?: { active?: boolean; emailVerified?: boolean }) {
    return this.users.makeUser(email, fullName, role, password, opts);
  }
  publicUser(u: UserRecord) {
    return this.users.publicUser(u);
  }
  async findUser(emailOrId: string, byId = false) {
    return this.users.findUser(emailOrId, byId);
  }

  // ---- session / tokens ----
  tokensFor(u: UserRecord, rememberMe = false) {
    return this.session.tokensFor(u, rememberMe);
  }
  requireRole(u: UserRecord, roles: Role[]) {
    return this.session.requireRole(u, roles);
  }
  async login(email: string, password: string, rememberMe = false) {
    return this.session.login(email, password, rememberMe);
  }
  async refresh(refreshToken?: string) {
    return this.session.refresh(refreshToken);
  }
  async revoke(token?: string, refreshToken?: string) {
    return this.session.revoke(token, refreshToken);
  }
  async userFromToken(token?: string) {
    return this.session.userFromToken(token);
  }

  // ---- registration & OTP ----
  async sendRegistrationCode(email: string, fullName?: string) {
    return this.registration.sendRegistrationCode(email, fullName);
  }
  async register(body: any) {
    return this.registration.register(body);
  }
  async verifyOtp(email: string, code: string, rememberMe = false) {
    return this.registration.verifyOtp(email, code, rememberMe);
  }
  async resendOtp(email: string) {
    return this.registration.resendOtp(email);
  }

  // ---- self-service account management ----
  async forgotPassword(email: string) {
    return this.account.forgotPassword(email);
  }
  async resetPassword(email: string, code: string, password: string, confirmPassword: string) {
    return this.account.resetPassword(email, code, password, confirmPassword);
  }
  async updateProfile(userId: string, body: { fullName: string; phoneNumber?: string }) {
    return this.account.updateProfile(userId, body);
  }
  async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.account.changePassword(userId, currentPassword, newPassword, confirmPassword);
  }
}
