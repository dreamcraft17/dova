import { Body, Controller, Post, Get, Patch, Req, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import { AppService } from './app.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RefreshTokenDto,
  RegisterDto,
  ResendOtpDto,
  ResetPasswordDto,
  SendRegistrationCodeDto,
  UpdateProfileDto,
  VerifyOtpDto,
} from './auth.dto';
import { CurrentUser, Public } from './auth.decorators';
import { AuthenticatedRequest } from './auth.types';
import { StoredUser } from './database.service';

@Controller()
export class AuthController {
  constructor(private readonly service: AppService) {}

  private cookieOptions(maxAge: number) {
    const crossSite = process.env.COOKIE_SAMESITE === 'none' || process.env.CROSS_SITE_COOKIES === 'true';
    const secure = process.env.NODE_ENV === 'production' || crossSite;
    return { httpOnly: true, sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax', secure, maxAge };
  }

  private sessionCookieOptions() {
    const crossSite = process.env.COOKIE_SAMESITE === 'none' || process.env.CROSS_SITE_COOKIES === 'true';
    const secure = process.env.NODE_ENV === 'production' || crossSite;
    return { httpOnly: true, sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax', secure };
  }

  private bearerToken(req: AuthenticatedRequest) {
    return req.headers.authorization?.replace(/^Bearer\s+/i, '');
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('auth/send-registration-code') sendRegistrationCode(@Body() body: SendRegistrationCodeDto) {
    return this.service.sendRegistrationCode(body.email, body.fullName);
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('auth/register') async register(@Body() body: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.register(body);
    res.cookie('accessToken', result.accessToken, this.cookieOptions(900000));
    if (body.rememberMe) {
      res.cookie('refreshToken', result.refreshToken, this.cookieOptions(30 * 24 * 60 * 60 * 1000));
    } else {
      res.cookie('refreshToken', result.refreshToken, this.sessionCookieOptions());
    }
    return result;
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('auth/verify-otp') async verifyOtp(@Body() body: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.verifyOtp(body.email, body.code, Boolean(body.rememberMe));
    res.cookie('accessToken', result.accessToken, this.cookieOptions(900000));
    if (body.rememberMe) {
      res.cookie('refreshToken', result.refreshToken, this.cookieOptions(30 * 24 * 60 * 60 * 1000));
    } else {
      res.cookie('refreshToken', result.refreshToken, this.sessionCookieOptions());
    }
    return result;
  }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('auth/resend-otp') resendOtp(@Body() body: ResendOtpDto) { return this.service.resendOtp(body.email); }

  @Public()
  @Throttle({ auth: { limit: 5, ttl: 60_000 } })
  @Post('auth/forgot-password') forgotPassword(@Body() body: ForgotPasswordDto) { return this.service.forgotPassword(body.email); }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('auth/reset-password') resetPassword(@Body() body: ResetPasswordDto) {
    return this.service.resetPassword(body.email, body.code, body.password, body.confirmPassword);
  }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('auth/login') async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.login(body.email, body.password, Boolean(body.rememberMe));
    res.cookie('accessToken', result.accessToken, this.cookieOptions(900000));
    if (body.rememberMe) {
      res.cookie('refreshToken', result.refreshToken, this.cookieOptions(30 * 24 * 60 * 60 * 1000));
    } else {
      res.cookie('refreshToken', result.refreshToken, this.sessionCookieOptions());
    }
    return result;
  }

  @Public()
  @Post('auth/logout') async logout(@Req() req: AuthenticatedRequest, @Body() body: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies?.accessToken ?? this.bearerToken(req);
    const refreshToken = req.cookies?.refreshToken ?? body.refreshToken;
    await this.service.revoke(accessToken, refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  @Public()
  @Throttle({ auth: { limit: 20, ttl: 60_000 } })
  @Post('auth/refresh') async refresh(@Req() req: AuthenticatedRequest, @Body() body: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const refreshToken = body.refreshToken ?? req.cookies?.refreshToken;
    const result = await this.service.refresh(refreshToken);
    res.cookie('accessToken', result.accessToken, this.cookieOptions(900000));
    res.cookie('refreshToken', result.refreshToken, this.cookieOptions(604800000));
    return result;
  }

  @Get('auth/me') me(@CurrentUser() user: StoredUser) { return this.service.publicUser(user); }

  @Patch('auth/me') updateProfile(@CurrentUser() user: StoredUser, @Body() body: UpdateProfileDto) {
    return this.service.updateProfile(user.id, body);
  }

  @Post('auth/change-password') changePassword(@CurrentUser() user: StoredUser, @Body() body: ChangePasswordDto) {
    return this.service.changePassword(user.id, body.currentPassword, body.newPassword, body.confirmPassword);
  }
}
