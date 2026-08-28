import { FormEvent, useEffect, useState } from 'react';
import { Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
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
      await router.push(
        r.user.role === 'admin' ? '/admin' : r.user.role === 'supplier' ? '/supplier' : '/products',
      );
    } catch (err) {
      const message = (err as Error).message;
      if (/verify your email/i.test(message)) {
        let sent = false;
        try {
          await api('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email }) });
          sent = true;
          showToast('Verification code sent to your email.', 'success');
        } catch (resendErr) {
          const resendMessage = (resendErr as Error).message;
          showToast(
            /wait/i.test(resendMessage)
              ? 'Check your inbox for the verification code we sent earlier.'
              : resendMessage,
            'error',
          );
        }
        await router.push(
          `/auth/verify-email?email=${encodeURIComponent(email)}&from=login${sent ? '&sent=1' : ''}`,
        );
        return;
      }
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const verifyHref = email
    ? `/auth/verify-email?email=${encodeURIComponent(email)}&from=login`
    : '/auth/verify-email?from=login';

  return (
    <AuthShell aside={<AuthAside variant="login" />}>
      <AuthCard
        title="Welcome back"
        subtitle="Sign in to continue shopping from verified agricultural suppliers."
        notice={
          passwordChanged ? (
            <p>Your password was updated. Sign in with your new password.</p>
          ) : undefined
        }
        footer={
          <>
            <p>
              Don&apos;t have an account? <Link href="/auth/register">Create one</Link>
            </p>
            <p className="auth-footer-secondary">
              Selling on DOVA? <Link href="/auth/supplier-register">Apply as a supplier</Link>
            </p>
          </>
        }
      >
        <form className="auth-form" onSubmit={submit}>
          <AuthField
            id="login-email"
            label="Email address"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={18} />}
          />
          <AuthPasswordField
            id="login-password"
            label="Password"
            name="password"
            autoComplete="current-password"
            required
            minLength={8}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={18} />}
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
          <p className="auth-helper-text">
            Haven&apos;t verified your email yet? <Link href={verifyHref}>Enter verification code</Link>
          </p>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
