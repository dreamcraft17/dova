import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';

export default function ForgotPassword() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    setMessage('');
    try {
      const result = await api<{ message: string }>('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(result.message);
      router.push(`/auth/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="register-card verify-email-card">
        <h1>Forgot Password</h1>
        <p>Enter your account email and we&apos;ll send a 6-digit reset code.</p>
        <form onSubmit={submit}>
          <label>Email</label>
          <input
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Sending…" inline size="sm" /> : 'Send reset code'}
          </button>
          {message && <p className="success">{message}</p>}
          {error && <p className="error">{error}</p>}
        </form>
        <div className="login-link">
          Remember your password? <Link href="/auth/login">Back to login</Link>
        </div>
      </div>
    </AuthShell>
  );
}
