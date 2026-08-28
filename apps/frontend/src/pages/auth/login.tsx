import { FormEvent, useEffect, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordToggleState } from 'dova-shared';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { api, configureLoginPersistence } from '../../lib/api';
import { clearTokens, getRememberedEmail, setRememberedEmail } from '../../lib/auth-session';
import type { User } from 'dova-shared';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const passwordToggle = passwordToggleState(showPassword);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { establishSession } = useAuth();
  const { showToast } = useToast();

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
        showToast('Verify your email to continue.', 'error');
        await router.push(`/auth/verify-email?email=${encodeURIComponent(email)}&from=login`);
        return;
      }
      showToast(message, 'error');
    } finally {
      setBusy(false);
    }
  }

  const verifyHref = email
    ? `/auth/verify-email?email=${encodeURIComponent(email)}`
    : '/auth/verify-email';

  return (
    <AuthShell>
      <div className="login-card">
        <h1>Welcome Back</h1>
        <p>Login to continue exploring trusted agricultural products.</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Password</label>
          <div className="password-input-wrap">
            <input
              type={passwordToggle.inputType}
              required
              placeholder="Enter your password"
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
          <div className="remember">
            <label>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />{' '}
              Remember Me
            </label>
            <Link href="/auth/forgot-password">Forgot Password?</Link>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Logging in…" inline size="sm" /> : 'Login'}
          </button>
        </form>
        <div className="login-link">
          Haven&apos;t verified yet? <Link href={verifyHref}>Verify email</Link>
        </div>
        <div className="register-link">
          Don&apos;t have an account? <Link href="/auth/register">Register</Link>
        </div>
        <div className="supplier-link">
          <Link href="/auth/supplier-register">Become a Supplier</Link>
        </div>
      </div>
    </AuthShell>
  );
}
