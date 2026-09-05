import { BadRequestException, Injectable } from '@nestjs/common';
import { isValidOtpFormat } from 'dova-shared';
import { DatabaseService } from './database.service';
import { isEmailProviderConfigured } from './mail.util';
import {
  generateOtpCode,
  hashOtp,
  OTP_LOCK_MS,
  OTP_MAX_ATTEMPTS,
  OTP_MAX_RESEND,
  OTP_RESEND_COOLDOWN_MS,
  OTP_RESEND_WINDOW_MS,
  OTP_TTL_MS,
  verifyOtpHash,
} from './otp.util';
import { notifySafely } from './notify-safely.util';
import { qaSmokeOtpCode } from './qa-smoke-otp.util';
import { RedisService } from './redis.service';
import { AppStateService } from './app-state.service';
import { UserDirectoryService } from './user-directory.service';
import { SessionService } from './session.service';

type PendingRegistrationOtp = {
  otpHash: string;
  otpExpiresAt: string;
  otpAttempts: number;
  otpLockedUntil?: string;
  otpResendCount: number;
  otpResendWindowStart?: string;
};

@Injectable()
export class RegistrationService {
  private pendingRegistrationOtps = new Map<string, PendingRegistrationOtp>();

  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
    private readonly state: AppStateService,
    private readonly users: UserDirectoryService,
    private readonly session: SessionService,
  ) {}

  private registrationOtpKey(email: string) {
    return `dova:reg-otp:${email.toLowerCase()}`;
  }

  private async getPendingRegistrationOtp(email: string): Promise<PendingRegistrationOtp | undefined> {
    const normalizedEmail = email.toLowerCase();
    if (this.redis.enabled) {
      const raw = await this.redis.get(this.registrationOtpKey(normalizedEmail));
      return raw ? (JSON.parse(raw) as PendingRegistrationOtp) : undefined;
    }
    return this.pendingRegistrationOtps.get(normalizedEmail);
  }

  private async savePendingRegistrationOtp(email: string, record: PendingRegistrationOtp) {
    const normalizedEmail = email.toLowerCase();
    if (this.redis.enabled) {
      await this.redis.set(
        this.registrationOtpKey(normalizedEmail),
        JSON.stringify(record),
        Math.ceil(OTP_RESEND_WINDOW_MS / 1000),
      );
      return;
    }
    this.pendingRegistrationOtps.set(normalizedEmail, record);
  }

  private async clearPendingRegistrationOtp(email: string) {
    const normalizedEmail = email.toLowerCase();
    if (this.redis.enabled) {
      await this.redis.del(this.registrationOtpKey(normalizedEmail));
      return;
    }
    this.pendingRegistrationOtps.delete(normalizedEmail);
  }

  private async consumeRegistrationOtp(email: string, code: string) {
    if (!isValidOtpFormat(code)) throw new BadRequestException('Verification code is required');
    const normalizedEmail = email.toLowerCase();
    const pending = await this.getPendingRegistrationOtp(normalizedEmail);
    if (!pending) throw new BadRequestException('Request a verification code for this email first');
    if (pending.otpLockedUntil && new Date(pending.otpLockedUntil).getTime() > Date.now()) {
      throw new BadRequestException('Too many failed attempts. Try again later.');
    }
    if (!pending.otpExpiresAt || new Date(pending.otpExpiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Verification code expired. Request a new one.');
    }
    if (!verifyOtpHash(code, pending.otpHash)) {
      const attempts = (pending.otpAttempts ?? 0) + 1;
      pending.otpAttempts = attempts;
      if (attempts >= OTP_MAX_ATTEMPTS) {
        pending.otpLockedUntil = new Date(Date.now() + OTP_LOCK_MS).toISOString();
      }
      await this.savePendingRegistrationOtp(normalizedEmail, pending);
      throw new BadRequestException('Invalid verification code');
    }
    await this.clearPendingRegistrationOtp(normalizedEmail);
  }

  async sendRegistrationCode(email: string, fullName?: string) {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new BadRequestException('Invalid email');
    const normalizedEmail = email.toLowerCase();
    const existing = await this.users.findUser(normalizedEmail);
    if (existing?.emailVerifiedAt) throw new BadRequestException('Email already registered');
    if (existing && !existing.emailVerifiedAt) {
      throw new BadRequestException('This email already has an account pending verification. Sign in and verify from Profile.');
    }
    const qaSmoke = Boolean(qaSmokeOtpCode(normalizedEmail));
    if (process.env.NODE_ENV === 'production' && !qaSmoke && !isEmailProviderConfigured()) {
      throw new BadRequestException('Registration is temporarily unavailable. Please try again later.');
    }
    const now = Date.now();
    const pending = (await this.getPendingRegistrationOtp(normalizedEmail)) ?? {
      otpHash: '',
      otpExpiresAt: '',
      otpAttempts: 0,
      otpResendCount: 0,
    };
    const windowStartMs = pending.otpResendWindowStart ? new Date(pending.otpResendWindowStart).getTime() : 0;
    if (!windowStartMs || now - windowStartMs > OTP_RESEND_WINDOW_MS) {
      pending.otpResendCount = 0;
      pending.otpResendWindowStart = new Date(now).toISOString();
    }
    if (pending.otpResendCount >= OTP_MAX_RESEND) {
      throw new BadRequestException('Too many resend attempts. Try again in an hour.');
    }
    if (pending.otpExpiresAt) {
      const issuedAt = new Date(pending.otpExpiresAt).getTime() - OTP_TTL_MS;
      if (now - issuedAt < OTP_RESEND_COOLDOWN_MS) {
        throw new BadRequestException('Please wait before requesting a new code.');
      }
    }
    const code = qaSmokeOtpCode(normalizedEmail) ?? generateOtpCode();
    pending.otpHash = hashOtp(code);
    pending.otpExpiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
    pending.otpAttempts = 0;
    pending.otpLockedUntil = undefined;
    pending.otpResendCount += 1;
    await this.savePendingRegistrationOtp(normalizedEmail, pending);
    const emailResult = await notifySafely(
      this.state.notifications?.verificationOtp(normalizedEmail, code, fullName?.trim() || 'Customer'),
    );
    if (process.env.NODE_ENV !== 'production') console.info(`[Reg OTP] ${normalizedEmail}: ${code}`);
    if (process.env.NODE_ENV === 'production' && !qaSmoke && !emailResult?.sent) {
      throw new BadRequestException('Could not send verification email. Please try again later.');
    }
    return { message: 'Verification code sent.', email: normalizedEmail };
  }

  async register(body: any) {
    const { fullName, email, password, confirmPassword, code, rememberMe } = body;
    if (!fullName || !email || !/^\S+@\S+\.\S+$/.test(email) || !password || password !== confirmPassword || password.length < 8) {
      throw new BadRequestException('Invalid registration data');
    }
    const normalizedEmail = email.toLowerCase();
    if (await this.users.findUser(normalizedEmail)) throw new BadRequestException('Email already registered');
    await this.consumeRegistrationOtp(normalizedEmail, code);
    const user = this.users.makeUser(normalizedEmail, fullName, 'customer', password, { active: true, emailVerified: true });
    this.state.users.push(user);
    await this.database.insertUser(user);
    await this.database.verifyUserEmail(user.id);
    const result = await this.session.issueSession(user, Boolean(rememberMe));
    return { message: 'Account created successfully.', ...result };
  }

  async verifyOtp(email: string, code: string, rememberMe = false) {
    if (!isValidOtpFormat(code)) throw new BadRequestException('Invalid verification code');
    const u = await this.users.findUser(email);
    if (!u || u.emailVerifiedAt) throw new BadRequestException('Invalid verification code');
    if (u.otpLockedUntil && new Date(u.otpLockedUntil).getTime() > Date.now()) {
      throw new BadRequestException('Too many failed attempts. Try again later.');
    }
    if (!u.otpExpiresAt || new Date(u.otpExpiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Verification code expired. Request a new one.');
    }
    if (!verifyOtpHash(code, u.otpHash)) {
      const attempts = (u.otpAttempts ?? 0) + 1;
      u.otpAttempts = attempts;
      const lockedUntil = attempts >= OTP_MAX_ATTEMPTS ? new Date(Date.now() + OTP_LOCK_MS) : null;
      if (lockedUntil) u.otpLockedUntil = lockedUntil.toISOString();
      this.users.syncUserRecord(u);
      await this.database.saveUserOtp(u.id, u.otpHash!, new Date(u.otpExpiresAt), attempts, lockedUntil);
      throw new BadRequestException('Invalid verification code');
    }
    u.emailVerifiedAt = new Date().toISOString();
    u.isActive = true;
    u.otpHash = undefined;
    u.otpExpiresAt = undefined;
    u.otpAttempts = 0;
    u.otpLockedUntil = undefined;
    u.otpResendCount = 0;
    u.otpResendWindowStart = undefined;
    this.users.syncUserRecord(u);
    await this.database.verifyUserEmail(u.id);
    return this.session.issueSession(u, rememberMe);
  }

  async resendOtp(email: string) {
    const u = await this.users.findUser(email);
    if (!u || u.emailVerifiedAt) throw new BadRequestException('No pending verification for this email');
    const now = Date.now();
    const windowStartMs = u.otpResendWindowStart ? new Date(u.otpResendWindowStart).getTime() : 0;
    let resendCount = u.otpResendCount ?? 0;
    if (!windowStartMs || now - windowStartMs > OTP_RESEND_WINDOW_MS) {
      resendCount = 0;
      u.otpResendWindowStart = new Date(now).toISOString();
    }
    if (resendCount >= OTP_MAX_RESEND) throw new BadRequestException('Too many resend attempts. Try again in an hour.');
    if (u.otpExpiresAt) {
      const issuedAt = new Date(u.otpExpiresAt).getTime() - OTP_TTL_MS;
      if (now - issuedAt < OTP_RESEND_COOLDOWN_MS) throw new BadRequestException('Please wait before requesting a new code.');
    }
    const code = qaSmokeOtpCode(u.email) ?? generateOtpCode();
    const otpHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    resendCount += 1;
    u.otpResendCount = resendCount;
    u.otpHash = otpHash;
    u.otpExpiresAt = expiresAt.toISOString();
    u.otpAttempts = 0;
    u.otpLockedUntil = undefined;
    this.users.syncUserRecord(u);
    await this.database.updateOtpResend(u.id, resendCount, new Date(u.otpResendWindowStart!), otpHash, expiresAt);
    void notifySafely(this.state.notifications?.verificationOtp(u.email, code, u.fullName));
    if (process.env.NODE_ENV !== 'production') console.info(`[OTP] ${u.email}: ${code}`);
    return { message: 'Verification code sent.', email: u.email };
  }
}
