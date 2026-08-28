import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';

export type GoogleProfile = {
  sub: string;
  email: string;
  emailVerified: boolean;
  name: string;
  picture?: string;
};

@Injectable()
export class GoogleAuthService {
  isConfigured(): boolean {
    return Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
  }

  async verifyIdToken(idToken: string): Promise<GoogleProfile> {
    const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
    if (!clientId) {
      throw new BadRequestException('Google sign-in is not configured');
    }
    if (!idToken?.trim()) {
      throw new BadRequestException('Google credential is required');
    }
    const client = new OAuth2Client(clientId);
    try {
      const ticket = await client.verifyIdToken({ idToken: idToken.trim(), audience: clientId });
      const payload = ticket.getPayload();
      if (!payload?.sub || !payload.email) {
        throw new UnauthorizedException('Invalid Google token');
      }
      if (!payload.email_verified) {
        throw new BadRequestException('Google email is not verified');
      }
      const iss = payload.iss;
      if (iss !== 'accounts.google.com' && iss !== 'https://accounts.google.com') {
        throw new UnauthorizedException('Invalid Google token issuer');
      }
      return {
        sub: payload.sub,
        email: payload.email.toLowerCase(),
        emailVerified: true,
        name: (payload.name || payload.email.split('@')[0] || 'User').trim(),
        picture: payload.picture,
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof UnauthorizedException) throw error;
      throw new UnauthorizedException('Invalid Google token');
    }
  }
}
