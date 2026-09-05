import { BadRequestException, ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { isValidOtpFormat } from 'dova-shared';
import { bcryptCost } from './bcrypt-cost';
import { DatabaseService } from './database.service';
import { isEmailProviderConfigured } from './mail.util';
import { OTP_LOCK_MS, OTP_MAX_ATTEMPTS, OTP_MAX_RESEND, OTP_RESEND_COOLDOWN_MS, OTP_RESEND_WINDOW_MS, OTP_TTL_MS, generateOtpCode, hashOtp, verifyOtpHash } from './otp.util';
import { notifySafely } from './notify-safely.util';
import { qaSmokeOtpCode } from './qa-smoke-otp.util';
import { AppStateService, UserRecord } from './app-state.service';
import { UserDirectoryService } from './user-directory.service';

@Injectable()
export class AccountService {
  private static readonly forgotPasswordMessage = {
    message: 'If that email is registered, we sent a password reset code.',
  };

  constructor(
    private readonly database: DatabaseService,
    private readonly state: AppStateService,
    private readonly users: UserDirectoryService,
  ) {}

  private canSelfResetPassword(u: UserRecord) {
    return u.isActive && Boolean(u.emailVerifiedAt) && u.role !== 'admin';
  }

  async forgotPassword(email: string) {
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) throw new BadRequestException('Invalid email');
    const normalizedEmail = email.toLowerCase();
    const u = await this.users.findUser(normalizedEmail);
    if (!u || !this.canSelfResetPassword(u)) return AccountService.forgotPasswordMessage;
    if (process.env.NODE_ENV === 'production' && !isEmailProviderConfigured()) {
      throw new BadRequestException('Password reset is temporarily unavailable. Please try again later.');
    }
    const now = Date.now();
    const windowStartMs = u.resetResendWindowStart ? new Date(u.resetResendWindowStart).getTime() : 0;
    let resendCount = u.resetResendCount ?? 0;
    if (!windowStartMs || now - windowStartMs > OTP_RESEND_WINDOW_MS) {
      resendCount = 0;
      u.resetResendWindowStart = new Date(now).toISOString();
    }
    if (resendCount >= OTP_MAX_RESEND) throw new BadRequestException('Too many reset attempts. Try again in an hour.');
    if (u.resetExpiresAt) {
      const issuedAt = new Date(u.resetExpiresAt).getTime() - OTP_TTL_MS;
      if (now - issuedAt < OTP_RESEND_COOLDOWN_MS) throw new BadRequestException('Please wait before requesting a new code.');
    }
    const code = qaSmokeOtpCode(u.email) ?? generateOtpCode();
    const resetHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);
    resendCount += 1;
    u.resetResendCount = resendCount;
    u.resetHash = resetHash;
    u.resetExpiresAt = expiresAt.toISOString();
    u.resetAttempts = 0;
    u.resetLockedUntil = undefined;
    this.users.syncUserRecord(u);
    await this.database.updatePasswordResetResend(u.id, resendCount, new Date(u.resetResendWindowStart!), resetHash, expiresAt);
    const emailResult = await notifySafely(this.state.notifications?.passwordResetOtp(u.email, code, u.fullName));
    if (process.env.NODE_ENV !== 'production') console.info(`[Reset OTP] ${u.email}: ${code}`);
    if (process.env.NODE_ENV === 'production' && !emailResult?.sent) {
      throw new BadRequestException('Could not send password reset email. Please try again later.');
    }
    return AccountService.forgotPasswordMessage;
  }

  async resetPassword(email: string, code: string, password: string, confirmPassword: string) {
    if (!isValidOtpFormat(code)) throw new BadRequestException('Invalid reset code');
    if (!password || password !== confirmPassword || password.length < 8) {
      throw new BadRequestException('Invalid password data');
    }
    const u = await this.users.findUser(email);
    if (!u || !this.canSelfResetPassword(u)) throw new BadRequestException('Invalid reset code');
    if (u.resetLockedUntil && new Date(u.resetLockedUntil).getTime() > Date.now()) {
      throw new BadRequestException('Too many failed attempts. Try again later.');
    }
    if (!u.resetExpiresAt || new Date(u.resetExpiresAt).getTime() < Date.now()) {
      throw new BadRequestException('Reset code expired. Request a new one.');
    }
    if (!verifyOtpHash(code, u.resetHash)) {
      const attempts = (u.resetAttempts ?? 0) + 1;
      u.resetAttempts = attempts;
      const lockedUntil = attempts >= OTP_MAX_ATTEMPTS ? new Date(Date.now() + OTP_LOCK_MS) : null;
      if (lockedUntil) u.resetLockedUntil = lockedUntil.toISOString();
      this.users.syncUserRecord(u);
      await this.database.saveUserPasswordReset(u.id, u.resetHash!, new Date(u.resetExpiresAt), attempts, lockedUntil);
      throw new BadRequestException('Invalid reset code');
    }
    u.passwordHash = bcrypt.hashSync(password, bcryptCost());
    u.resetHash = undefined;
    u.resetExpiresAt = undefined;
    u.resetAttempts = 0;
    u.resetLockedUntil = undefined;
    u.resetResendCount = 0;
    u.resetResendWindowStart = undefined;
    this.users.syncUserRecord(u);
    await this.database.updateUserPassword(u.id, u.passwordHash);
    await this.database.clearPasswordReset(u.id);
    await this.database.revokeAllUserSessions(u.id);
    return { message: 'Password updated. You can sign in with your new password.' };
  }

  async updateProfile(userId: string, body: { fullName: string; phoneNumber?: string }) {
    const fullName = body.fullName?.trim();
    if (!fullName || fullName.length < 2) throw new BadRequestException('Invalid profile data');
    let phoneNumber: string | undefined;
    if (body.phoneNumber !== undefined) {
      const trimmed = body.phoneNumber.trim();
      if (trimmed && trimmed.length < 7) throw new BadRequestException('Invalid phone number');
      phoneNumber = trimmed || undefined;
    }
    const user = await this.users.findUser(userId, true);
    if (!user) throw new NotFoundException('User not found');
    user.fullName = fullName;
    if (body.phoneNumber !== undefined) user.phoneNumber = phoneNumber;
    this.users.syncUserRecord(user);
    await this.database.updateSelfProfile(userId, {
      fullName,
      phoneNumber: body.phoneNumber !== undefined ? phoneNumber : user.phoneNumber,
    });
    return this.users.publicUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string, confirmPassword: string) {
    if (!currentPassword || !newPassword || newPassword !== confirmPassword || newPassword.length < 8) {
      throw new BadRequestException('Invalid password data');
    }
    const user = await this.users.findUser(userId, true);
    if (!user) throw new NotFoundException('User not found');
    if (!this.canSelfResetPassword(user)) throw new ForbiddenException('Password change is not available for this account');
    if (!bcrypt.compareSync(currentPassword, user.passwordHash)) {
      throw new UnauthorizedException('Current password is incorrect');
    }
    if (bcrypt.compareSync(newPassword, user.passwordHash)) {
      throw new BadRequestException('New password must be different from your current password');
    }
    user.passwordHash = bcrypt.hashSync(newPassword, bcryptCost());
    this.users.syncUserRecord(user);
    await this.database.updateUserPassword(userId, user.passwordHash);
    await this.database.revokeAllUserSessions(userId);
    return { message: 'Password updated. Please sign in again with your new password.' };
  }
}
