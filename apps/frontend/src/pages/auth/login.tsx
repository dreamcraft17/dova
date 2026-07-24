import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { refresh } = useAuth();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const r = await api<{ user: { role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      router.push(
        r.user.role === 'admin' ? '/admin' : r.user.role === 'supplier' ? '/supplier' : '/customer',
      );
    } catch (err) {
      setError((err as Error).message);
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
          <input
            type="password"
            required
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <div className="remember">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <span style={{ color: '#999' }}>Forgot Password?</span>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Logging in…" inline size="sm" /> : 'Login'}
          </button>
          {error && <p className="error">{error}</p>}
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
