import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { isGoogleAuthEnabled, useGoogleSignIn } from '../lib/google-auth';
import type { User } from 'dova-shared';
import { useToast } from '../context/ToastContext';

type Props = {
  rememberMe?: boolean;
  onSuccess: (user: User) => void | Promise<void>;
  disabled?: boolean;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
};

export function GoogleSignInButton({ rememberMe = true, onSuccess, disabled, text = 'continue_with' }: Props) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  const { signIn, busy } = useGoogleSignIn(onSuccess);
  const { showToast } = useToast();

  if (!isGoogleAuthEnabled() || !clientId) return null;

  async function handleSuccess(response: CredentialResponse) {
    try {
      await signIn(response.credential, rememberMe);
    } catch (error) {
      showToast((error as Error).message, 'error');
    }
  }

  return (
    <>
      <div className="auth-divider" aria-hidden="true">
        <span>or</span>
      </div>
      <div className={`google-signin-wrap${busy || disabled ? ' is-disabled' : ''}`}>
        <GoogleLogin
          onSuccess={(response) => void handleSuccess(response)}
          onError={() => undefined}
          useOneTap={false}
          theme="outline"
          size="large"
          text={text}
          shape="rectangular"
          width={360}
        />
      </div>
    </>
  );
}

export function GoogleIdentityStep({
  onVerified,
  disabled,
  text = 'continue_with',
}: {
  onVerified: (payload: { idToken: string; email: string; fullName: string }) => void;
  disabled?: boolean;
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
}) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID?.trim();
  if (!isGoogleAuthEnabled() || !clientId) return null;

  return (
    <div className={`google-signin-wrap${disabled ? ' is-disabled' : ''}`}>
      <p className="form-hint" style={{ marginTop: 0 }}>
        Verify your identity with Google, then complete your supplier details below.
      </p>
      <GoogleLogin
        onSuccess={(response) => {
          if (!response.credential) return;
          const payload = JSON.parse(atob(response.credential.split('.')[1] ?? '')) as {
            email?: string;
            name?: string;
          };
          onVerified({
            idToken: response.credential,
            email: (payload.email ?? '').toLowerCase(),
            fullName: payload.name ?? payload.email?.split('@')[0] ?? 'Supplier',
          });
        }}
        onError={() => undefined}
        useOneTap={false}
        theme="outline"
        size="large"
        text={text}
        shape="rectangular"
        width={360}
      />
    </div>
  );
}
