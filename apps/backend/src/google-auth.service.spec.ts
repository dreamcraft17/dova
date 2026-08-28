import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { GoogleAuthService } from './google-auth.service';

const verifyIdToken = jest.fn();

jest.mock('google-auth-library', () => ({
  OAuth2Client: jest.fn().mockImplementation(() => ({ verifyIdToken })),
}));

describe('GoogleAuthService', () => {
  const service = new GoogleAuthService();
  const originalClientId = process.env.GOOGLE_CLIENT_ID;

  afterEach(() => {
    process.env.GOOGLE_CLIENT_ID = originalClientId;
    verifyIdToken.mockReset();
  });

  it('rejects when GOOGLE_CLIENT_ID is missing', async () => {
    delete process.env.GOOGLE_CLIENT_ID;
    await expect(service.verifyIdToken('token')).rejects.toThrow(BadRequestException);
  });

  it('returns a normalized profile for a valid token', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-1',
        email: 'Farmer@Example.com',
        email_verified: true,
        name: 'Ada Farmer',
        iss: 'accounts.google.com',
      }),
    });
    await expect(service.verifyIdToken('valid-token')).resolves.toEqual({
      sub: 'google-sub-1',
      email: 'farmer@example.com',
      emailVerified: true,
      name: 'Ada Farmer',
      picture: undefined,
    });
  });

  it('rejects unverified Google emails', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-2',
        email: 'unverified@example.com',
        email_verified: false,
        iss: 'accounts.google.com',
      }),
    });
    await expect(service.verifyIdToken('valid-token')).rejects.toThrow(BadRequestException);
  });

  it('rejects invalid issuers', async () => {
    process.env.GOOGLE_CLIENT_ID = 'test-client.apps.googleusercontent.com';
    verifyIdToken.mockResolvedValue({
      getPayload: () => ({
        sub: 'google-sub-3',
        email: 'bad@example.com',
        email_verified: true,
        iss: 'evil.example.com',
      }),
    });
    await expect(service.verifyIdToken('valid-token')).rejects.toThrow(UnauthorizedException);
  });
});
