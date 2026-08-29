import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { RegistrationSuccessModal } from '../../components/RegistrationSuccessModal';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { ApiError, api, configureLoginPersistence } from '../../lib/api';
import type { User } from 'dova-shared';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [sendBusy, setSendBusy] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { establishSession } = useAuth();
  const { showToast } = useToast();

  const passwordChecks = useMemo(
    () => ({
      length: form.password.length >= 8,
      match: form.password.length > 0 && form.password === form.confirmPassword,
    }),
    [form.password, form.confirmPassword],
  );

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  async function sendCode() {
    if (!form.email || sendBusy || resendCooldown > 0) return;
    setSendBusy(true);
    setError('');
    try {
      await api('/auth/send-registration-code', {
        method: 'POST',
        body: JSON.stringify({ email: form.email, fullName: form.fullName.trim() || undefined }),
      });
      setCodeSent(true);
      setResendCooldown(60);
      showToast('Verification code sent to your email.', 'success');
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not send verification code.';
      setError(message);
      if (err instanceof ApiError && message.includes('wait')) setResendCooldown(60);
    } finally {
      setSendBusy(false);
    }
  }

  const continueAfterRegistration = useCallback(() => {
    void router.push('/products');
  }, [router]);

  useEffect(() => {
    if (!showSuccessModal) return;
    const timer = window.setTimeout(continueAfterRegistration, 4000);
    return () => window.clearTimeout(timer);
  }, [showSuccessModal, continueAfterRegistration]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (code.length !== 6) {
      setError('Enter the 6-digit code from your email.');
      return;
    }
    setBusy(true);
    try {
      configureLoginPersistence(true);
      const session = await api<{ user: User; message?: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ ...form, code, rememberMe: true }),
      });
      establishSession(session.user);
      const message = session.message ?? 'Your account was created successfully.';
      setSuccessMessage(message);
      setShowSuccessModal(true);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell aside={<AuthAside variant="register" />}>
      <AuthCard
        title="Customer registration"
        subtitle="For customers purchasing from DOVA suppliers—not supplier onboarding."
        notice={
          <p>
            Enter your work email, tap <strong>Send code</strong>, then type the 6-digit OTP below before you create your account.
          </p>
        }
        footer={
          <p>
            Already registered? <Link href="/auth/login">Sign in</Link>
          </p>
        }
      >
        <form className="auth-form" onSubmit={submit} noValidate>
          <AuthField
            id="register-name"
            label="Full name"
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            placeholder="Ada Okonkwo"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <AuthField
            id="register-email"
            label="Work email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@company.com"
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setCode('');
              setCodeSent(false);
            }}
          />
          <div className="auth-otp-row">
            <label htmlFor="register-code" className="auth-field-label">
              Email verification code
            </label>
            <div className="auth-otp-controls">
              <input
                id="register-code"
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
              <button
                type="button"
                className="auth-inline-button"
                disabled={sendBusy || resendCooldown > 0 || !form.email}
                onClick={() => void sendCode()}
              >
                {sendBusy ? 'Sending…' : resendCooldown > 0 ? `Resend ${resendCooldown}s` : codeSent ? 'Resend code' : 'Send code'}
              </button>
            </div>
          </div>
          <AuthPasswordField
            id="register-password"
            label="Password"
            name="new-password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <AuthPasswordField
            id="register-confirm-password"
            label="Confirm password"
            name="confirm-password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="Repeat password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={
              form.confirmPassword && !passwordChecks.match ? 'Passwords do not match.' : undefined
            }
          />
          {form.password ? (
            <ul className="auth-checklist" aria-live="polite">
              <li className={passwordChecks.length ? 'is-met' : ''}>At least 8 characters</li>
              <li className={passwordChecks.match ? 'is-met' : ''}>Passwords match</li>
            </ul>
          ) : null}
          {error ? <p className="auth-form-error" role="alert">{error}</p> : null}
          <button type="submit" className="auth-submit" disabled={busy || code.length !== 6 || showSuccessModal}>
            {busy ? <Loading label="Creating account…" inline size="sm" /> : 'Create account'}
          </button>
        </form>
      </AuthCard>
      <RegistrationSuccessModal
        open={showSuccessModal}
        message={successMessage}
        onContinue={continueAfterRegistration}
      />
    </AuthShell>
  );
};
