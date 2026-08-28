import { FormEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { api } from '../../lib/api';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  const passwordChecks = useMemo(
    () => ({
      length: form.password.length >= 8,
      match: form.password.length > 0 && form.password === form.confirmPassword,
    }),
    [form.password, form.confirmPassword],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      await router.push(`/auth/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell aside={<AuthAside variant="register" />}>
      <AuthCard
        title="Buyer registration"
        subtitle="For customers purchasing from DOVA suppliers—not supplier onboarding."
        steps={[
          { label: 'Account details', state: 'current' },
          { label: 'Email verification', state: 'upcoming' },
        ]}
        notice={
          <p>
            After you submit, check your inbox for a <strong>6-digit code</strong>. You cannot sign in until it is entered.
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
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
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
          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? <Loading label="Creating account…" inline size="sm" /> : 'Create account & verify email'}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
