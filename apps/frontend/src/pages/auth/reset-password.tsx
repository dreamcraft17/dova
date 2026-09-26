import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField, AuthOtpField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { AuthMessage, AuthSubmit, AuthTextButton } from '../../components/auth/AuthControls';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function ResetPassword() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof router.query.email === 'string') setEmail(router.query.email);
  }, [router.query.email]);

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
      await api('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, code, password, confirmPassword }),
      });
      showToast('Password updated. Please sign in.', 'success');
      router.push('/auth/login');
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
      await api('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) });
      showToast('Reset code sent.', 'success');
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
    <AuthShell aside={<AuthAside variant="recovery" />}>
      <AuthCard
        eyebrow="Account recovery"
        title="Reset your password"
        subtitle="Enter the code from your email and choose a new password."
        footer={
          <>
            <p>
              Didn&apos;t get a code?{' '}
              <AuthTextButton disabled={resendBusy || resendCooldown > 0 || !email} onClick={() => void resend()}>
                {resendBusy ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </AuthTextButton>
            </p>
            <p>
              <Link href="/auth/login">Back to sign in</Link>
            </p>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={submit}>
          <AuthField
            id="reset-email"
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
          <AuthOtpField id="reset-code" label="Reset code" value={code} onChange={setCode} />
          <AuthPasswordField
            id="reset-password"
            label="New password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            icon={<Lock className="size-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <AuthPasswordField
            id="reset-confirm-password"
            label="Confirm new password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Repeat new password"
            icon={<Lock className="size-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={confirmPassword && password !== confirmPassword ? 'Passwords do not match.' : undefined}
          />
          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          <AuthSubmit busy={busy} busyLabel="Updating…">
            Update Password
          </AuthSubmit>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
