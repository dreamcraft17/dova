import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField, AuthOtpField } from '../../components/auth/AuthField';
import { AuthCheckbox, AuthMessage, AuthSubmit, AuthTextButton } from '../../components/auth/AuthControls';
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
  const autoResendStarted = useRef(false);

  useEffect(() => {
    if (typeof router.query.email === 'string') setEmail(router.query.email);
  }, [router.query.email]);

  const fromLogin = router.query.from === 'login';
  const alreadySent = router.query.sent === '1';

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!router.isReady || !fromLogin || !email || alreadySent || autoResendStarted.current) return;
    autoResendStarted.current = true;
    void resend({ auto: true });
  }, [router.isReady, fromLogin, email, alreadySent]);

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
        result.user.role === 'admin' ? '/admin' : result.user.role === 'supplier' ? '/supplier' : '/marketplace',
      );
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  async function resend(options: { auto?: boolean } = {}) {
    if (!email || resendCooldown > 0) return;
    setResendBusy(true);
    setError('');
    try {
      await api('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
      showToast(
        options.auto ? 'We sent a verification code to your email.' : 'Verification code sent.',
        'success',
      );
      setResendCooldown(60);
    } catch (err) {
      const message = (err as Error).message;
      if (options.auto && /wait/i.test(message)) {
        showToast('Check your inbox for the verification code we sent earlier.', 'error');
        setResendCooldown(60);
        return;
      }
      setError(message);
      if (err instanceof ApiError && message.includes('wait')) setResendCooldown(60);
    } finally {
      setResendBusy(false);
    }
  }

  return (
    <AuthShell aside={<AuthAside variant="verify" />}>
      <AuthCard
        eyebrow="Email verification"
        title="Verify your email"
        subtitle={
          fromLogin
            ? 'Your account is not verified yet. Enter the 6-digit code we sent to your inbox to sign in.'
            : 'Enter the 6-digit code we sent to your inbox to activate your account.'
        }
        notice={fromLogin && resendBusy ? 'Sending verification code…' : undefined}
        footer={
          <>
            <p>
              Didn&apos;t get a code?{' '}
              <AuthTextButton disabled={resendBusy || resendCooldown > 0 || !email} onClick={() => void resend()}>
                {resendBusy ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </AuthTextButton>
            </p>
            <p>
              Wrong email? <Link href="/auth/register">Register again</Link>
            </p>
            <p>
              Already verified?{' '}
              <Link href={email ? `/auth/login?email=${encodeURIComponent(email)}` : '/auth/login'}>Back to sign in</Link>
            </p>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={submit}>
          <AuthField
            id="verify-email"
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@company.com"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthOtpField id="verify-code" label="Verification code" value={code} onChange={setCode} />
          <AuthCheckbox id="verify-remember" checked={rememberMe} onChange={setRememberMe}>
            Remember me
          </AuthCheckbox>
          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          <AuthSubmit busy={busy} busyLabel="Verifying…">
            Verify &amp; Continue
          </AuthSubmit>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
