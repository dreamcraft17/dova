import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { api, configureLoginPersistence } from '../../lib/api';
import { clearTokens, getRememberedEmail, setRememberedEmail } from '../../lib/auth-session';
import type { User } from 'dova-shared';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { establishSession } = useAuth();
  const { showToast } = useToast();

  const passwordChanged = router.query.reason === 'password-changed';

  useEffect(() => {
    const savedEmail = getRememberedEmail();
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (typeof router.query.email === 'string') setEmail(router.query.email);
  }, [router.query.email]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      clearTokens();
      configureLoginPersistence(rememberMe);
      const r = await api<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      setRememberedEmail(rememberMe ? email : null);
      establishSession(r.user);
      const destination =
        r.user.role === 'admin'
          ? '/admin'
          : r.user.role === 'supplier'
            ? '/supplier'
            : r.user.emailVerifiedAt
              ? '/products'
              : '/customer/profile?verify=1';
      await router.push(destination);
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthShell aside={<AuthAside variant="login" />}>
      <AuthCard
        title="Sign in to your customer account"
        subtitle="Use the email and password you registered with."
        notice={
          passwordChanged ? (
            <p>Password updated. Sign in with your new password.</p>
          ) : undefined
        }
        footer={
          <>
            <p>
              New to DOVA? <Link href="/auth/register">Create a customer account</Link>
            </p>
            <p className="auth-footer-secondary">
              List products on DOVA? <Link href="/auth/supplier-register">Supplier application</Link>
            </p>
          </>
        }
      >
        <form className="auth-form" onSubmit={submit}>
          <AuthField
            id="login-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@company.com"
            icon={<Mail size={16} />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <AuthPasswordField
            id="login-password"
            label="Password"
            name="password"
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="Minimum 8 characters"
            icon={<Lock size={16} />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="auth-form-row">
            <label className="auth-checkbox">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span>Remember me</span>
            </label>
            <Link href="/auth/forgot-password" className="auth-inline-link">
              Forgot password?
            </Link>
          </div>
          <button type="submit" className="auth-submit" disabled={busy}>
            {busy ? <Loading label="Signing in…" inline size="sm" /> : 'Sign in'}
          </button>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
