import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { api, ApiError, configureLoginPersistence } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function VerifyEmail() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof router.query.email === 'string') setEmail(router.query.email);
  }, [router.query.email]);

  const fromLogin = router.query.from === 'login';

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      configureLoginPersistence(rememberMe);
      const result = await api<{ user: { role: string } }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email, code, rememberMe }),
      });
      await refresh();
      router.push(
        result.user.role === 'admin' ? '/admin' : result.user.role === 'supplier' ? '/supplier' : '/products',
      );
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function resend() {
    if (!email || resendCooldown > 0) return;
    setResendBusy(true);
    setError('');
    try {
      await api('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
      showToast('Verification code sent.', 'success');
      setResendCooldown(60);
    } catch (err) {
      const message = (err as Error).message;
      setError(message);
      if (err instanceof ApiError && message.includes('wait')) setResendCooldown(60);
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="register-card verify-email-card">
        <h1>Verify Your Email</h1>
        <p>
          {fromLogin
            ? 'Your account is not verified yet. Enter the 6-digit code we sent to your inbox to sign in.'
            : 'Enter the 6-digit code we sent to your inbox to activate your account.'}
        </p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Verification code</label>
          <input
            className="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <div className="remember">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />{' '}
              Remember Me
            </label>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Verifying…" inline size="sm" /> : 'Verify & Continue'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <div className="login-link">
          Didn&apos;t get a code?{' '}
          <button type="button" className="link-button" disabled={resendBusy || resendCooldown > 0} onClick={() => void resend()}>
            {resendBusy ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
        <div className="login-link">
          Wrong email? <Link href="/auth/register">Register again</Link>
        </div>
        <div className="login-link">
          Already verified? <Link href={email ? `/auth/login?email=${encodeURIComponent(email)}` : '/auth/login'}>Back to login</Link>
        </div>
      </div>
    </AuthShell>
  );
}
