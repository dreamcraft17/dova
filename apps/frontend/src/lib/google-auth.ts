import { useState } from 'react';
import type { User } from 'dova-shared';
import { api, configureLoginPersistence } from './api';
import { clearTokens, setRememberedEmail } from './auth-session';

type GoogleAuthResponse = { user: User; accessToken?: string; refreshToken?: string };

export function isGoogleAuthEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim());
}

export async function signInWithGoogleCredential(
  credential: string | undefined,
  options: {
    rememberMe?: boolean;
    onSession?: (user: User) => void;
  } = {},
) {
  if (!credential) {
    throw new Error('Google sign-in was cancelled. Please try again.');
  }
  clearTokens();
  configureLoginPersistence(Boolean(options.rememberMe));
  const result = await api<GoogleAuthResponse>('/auth/google', {
    method: 'POST',
    body: JSON.stringify({ idToken: credential, rememberMe: Boolean(options.rememberMe) }),
  });
  if (options.rememberMe && result.user.email) {
    setRememberedEmail(result.user.email);
  }
  options.onSession?.(result.user);
  return result;
}

export function useGoogleSignIn(onSession: (user: User) => void | Promise<void>) {
  const [busy, setBusy] = useState(false);

  async function signIn(credential: string | undefined, rememberMe = true) {
    setBusy(true);
    try {
      const result = await signInWithGoogleCredential(credential, {
        rememberMe,
        onSession,
      });
      return result;
    } finally {
      setBusy(false);
    }
  }

  return { signIn, busy };
}
