import { FormEvent, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordToggleState } from 'dova-shared';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';
import { PasswordInput } from '../../components/PasswordInput';

export default function Register() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const passwordToggle = passwordToggleState(showPassword);
  const confirmPasswordToggle = passwordToggleState(showConfirmPassword);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await api('/auth/register', { method: 'POST', body: JSON.stringify(form) });
      router.push('/auth/login');
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="register-card">
        <h1>Create Account</h1>
        <p>Join DOVA and start shopping directly from verified suppliers.</p>
        <form onSubmit={submit}>
          <label>Full Name</label>
          <input
            type="text"
            required
            placeholder="Enter your full name"
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
          />
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label>Password</label>
          <div className="password-input-wrap">
            <input
              type={passwordToggle.inputType}
              required
              placeholder="Create a password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
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
          <label>Confirm Password</label>
          <div className="password-input-wrap">
            <input
              type={confirmPasswordToggle.inputType}
              required
              placeholder="Confirm your password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
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
            {busy ? <Loading label="Creating account…" inline size="sm" /> : 'Register'}
          </button>
          {error && <p className="error">{error}</p>}
        </form>
        <div className="login-link">
          Already have an account? <Link href="/auth/login">Login</Link>
        </div>
      </div>
    </AuthShell>
  );
}
