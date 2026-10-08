import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Lock, Mail } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField } from '../../components/auth/AuthField';
import { AuthPasswordField } from '../../components/auth/AuthPasswordField';
import { AuthCheckbox, AuthSubmit } from '../../components/auth/AuthControls';
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
              ? '/marketplace'
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
        eyebrow="Authorized access"
        title="Sign in to your account"
        subtitle="Use the email and password you registered with."
        notice={passwordChanged ? 'Password updated. Sign in with your new password.' : undefined}
        securityNote={
          <>
            <strong>One sign-in for every role.</strong> After signing in you&apos;ll go straight to the marketplace,
            your supplier dashboard or the admin console.
          </>
        }
        footer={
          <>
            <p>
              New to DOVA? <Link href="/auth/register">Create a customer account</Link>
            </p>
            <p>
              List products on DOVA? <Link href="/auth/supplier-register">Supplier application</Link>
            </p>
          </>
        }
      >
        <form className="grid gap-4" onSubmit={submit}>
          <AuthField
            id="login-email"
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@company.com"
            icon={<Mail className="size-4" />}
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
            placeholder="Enter your password"
            icon={<Lock className="size-4" />}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="flex items-center justify-between gap-3">
            <AuthCheckbox id="login-remember" checked={rememberMe} onChange={setRememberMe}>
              Remember me
            </AuthCheckbox>
            <Link href="/auth/forgot-password" className="text-xs font-black text-[var(--emerald)] hover:underline">
              Forgot password?
            </Link>
          </div>
          <AuthSubmit busy={busy} busyLabel="Signing in…">
            Sign In
          </AuthSubmit>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
