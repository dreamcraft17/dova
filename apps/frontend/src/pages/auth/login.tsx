import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordToggleState } from 'dova-shared';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const passwordToggle = passwordToggleState(showPassword);
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();
  const { showToast } = useToast();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ user: { role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      router.push(
        r.user.role === 'admin' ? '/admin' : r.user.role === 'supplier' ? '/supplier' : '/products',
      );
    } catch (err) {
      showToast((err as Error).message, 'error');
      setBusy(false);
    }
  }

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
              <input type="checkbox" /> Remember Me
            </label>
            <span style={{ color: '#999' }}>Forgot Password?</span>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Logging in…" inline size="sm" /> : 'Login'}
          </button>
        </form>
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
