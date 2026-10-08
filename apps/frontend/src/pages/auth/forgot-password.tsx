import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import { AuthShell } from '../../components/AuthShell';
import { AuthAside } from '../../components/auth/AuthAside';
import { AuthCard } from '../../components/auth/AuthCard';
import { AuthField } from '../../components/auth/AuthField';
import { AuthMessage, AuthSubmit } from '../../components/auth/AuthControls';
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
    <AuthShell aside={<AuthAside variant="recovery" />}>
      <AuthCard
        eyebrow="Account recovery"
        title="Forgot your password?"
        subtitle="Enter your account email and we'll send a 6-digit reset code."
        securityNote={
          <>
            <strong>Didn&apos;t get an email?</strong> Check your spam folder — you can request a new code on the next
            screen.
          </>
        }
        footer={
          <p>
            Remember your password? <Link href="/auth/login">Back to sign in</Link>
          </p>
        }
      >
        <form className="grid gap-4" onSubmit={submit}>
          <AuthField
            id="forgot-email"
            label="Email"
            type="email"
            autoComplete="email"
            inputMode="email"
            required
            placeholder="you@company.com"
            icon={<Mail className="size-4" />}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {message ? <AuthMessage tone="success">{message}</AuthMessage> : null}
          {error ? <AuthMessage tone="error">{error}</AuthMessage> : null}
          <AuthSubmit busy={busy} busyLabel="Sending…">
            Send Reset Code
          </AuthSubmit>
        </form>
      </AuthCard>
    </AuthShell>
  );
}
