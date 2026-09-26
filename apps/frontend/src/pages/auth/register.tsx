import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Lock, Mail, User as UserIcon } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { RegistrationSuccessModal } from '../../components/RegistrationSuccessModal';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard, type AuthStep } from '../../components/auth/AuthCard';
import { AuthField, AuthOtpField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { AuthMessage, AuthSecondaryButton, AuthSubmit } from '../../components/auth/AuthControls';
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

  const passwordMatch = form.password.length > 0 && form.password === form.confirmPassword;

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
    void router.push('/marketplace');
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

  const steps: AuthStep[] = [
    { label: 'Send verification code', state: codeSent ? 'done' : 'current' },
    { label: 'Enter code & create account', state: codeSent ? 'current' : 'upcoming' },
  ];

  return (
    <AuthShell aside={<AuthAside variant="register" />}>
      <AuthCard
        eyebrow="Customer registration"
        title="Create your account"
        subtitle="For customers purchasing from DOVA suppliers — not supplier onboarding."
        steps={steps}
        notice={
          <>
            Enter your work email, tap <strong>Send code</strong>, then type the 6-digit code below before you create
            your account.
          </>
        }
        footer={
          <>
            <p>
              Already registered? <Link href="/auth/login">Sign in</Link>
            </p>
            <p>
              Selling on DOVA? <Link href="/auth/supplier-register">Apply as a supplier</Link>
            </p>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={submit} noValidate>
          <AuthField
            id="register-name"
            label="Full name"
            type="text"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            placeholder="Ada Okonkwo"
            icon={<UserIcon className="size-4" />}
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
            icon={<Mail className="size-4" />}
            value={form.email}
            onChange={(e) => {
              setForm({ ...form, email: e.target.value });
              setCode('');
              setCodeSent(false);
            }}
          />
          <AuthOtpField
            id="register-code"
            label="Email verification code"
            value={code}
            onChange={setCode}
            action={
              <AuthSecondaryButton
                disabled={sendBusy || resendCooldown > 0 || !form.email}
                onClick={() => void sendCode()}
              >
                {sendBusy
                  ? 'Sending…'
                  : resendCooldown > 0
                    ? `Resend ${resendCooldown}s`
                    : codeSent
                      ? 'Resend code'
                      : 'Send code'}
              </AuthSecondaryButton>
            }
          />
          <AuthPasswordField
            id="register-password"
            label="Password"
            name="new-password"
            autoComplete="new-password"
            required
            minLength={8}
            placeholder="At least 8 characters"
            icon={<Lock className="size-4" />}
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
            icon={<Lock className="size-4" />}
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            error={form.confirmPassword && !passwordMatch ? 'Passwords do not match.' : undefined}
          />
          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          <AuthSubmit busy={busy} busyLabel="Creating account…" disabled={code.length !== 6 || showSuccessModal}>
            Create Account
          </AuthSubmit>
        </form>
      </AuthCard>
      <RegistrationSuccessModal
        open={showSuccessModal}
        message={successMessage}
        onContinue={continueAfterRegistration}
      />
    </AuthShell>
  );
}
