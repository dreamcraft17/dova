import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordToggleState } from 'dova-shared';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { api, ApiError } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function ResetPassword() {
  const router = useRouter();
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordToggle = passwordToggleState(showPassword);
  const confirmPasswordToggle = passwordToggleState(showConfirmPassword);
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
    <AuthShell>
      <div className="register-card verify-email-card">
        <h1>Reset Password</h1>
        <p>Enter the code from your email and choose a new password.</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Reset code</label>
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
          <label>New password</label>
          <div className="password-input-wrap">
            <input
              type={passwordToggle.inputType}
              required
              minLength={8}
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={passwordToggle.ariaLabel}
            >
              {passwordToggle.icon === 'eye' ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <label>Confirm password</label>
          <div className="password-input-wrap">
            <input
              type={confirmPasswordToggle.inputType}
              required
              minLength={8}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              aria-label={confirmPasswordToggle.ariaLabel}
            >
              {confirmPasswordToggle.icon === 'eye' ? <Eye size={18} /> : <EyeOff size={18} />}
            </button>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Updating…" inline size="sm" /> : 'Update password'}
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
          <Link href="/auth/login">Back to login</Link>
        </div>
      </div>
    </AuthShell>
  );
}
