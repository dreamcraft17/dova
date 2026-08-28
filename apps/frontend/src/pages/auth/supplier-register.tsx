import { FormEvent, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { AuthShell } from '../../components/AuthShell';
import { Loading } from '../../components/Loading';
import { GoogleIdentityStep } from '../../components/GoogleSignInButton';
import { isGoogleAuthEnabled } from '../../lib/google-auth';
import { api } from '../../lib/api';
import { PasswordInput } from '../../components/PasswordInput';

type GoogleIdentity = {
  idToken: string;
  email: string;
  fullName: string;
};

export default function SupplierRegister() {
  const router = useRouter();
  const [form, setForm] = useState({
    businessName: '',
    contactName: '',
    email: '',
    phone: '',
    password: '',
  });
  const [googleIdentity, setGoogleIdentity] = useState<GoogleIdentity | null>(null);
  const [usePassword, setUsePassword] = useState(!isGoogleAuthEnabled());
  const [file, setFile] = useState<File>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState('');

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    if (!usePassword && !googleIdentity?.idToken) {
      setError('Continue with Google to verify your identity, or switch to email and password.');
      return;
    }
    if (usePassword && form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setBusy(true);
    try {
      const body = new FormData();
      body.append('businessName', form.businessName);
      body.append('contactName', form.contactName || form.businessName);
      body.append('phone', form.phone);
      if (usePassword) {
        body.append('email', form.email);
        body.append('password', form.password);
      } else if (googleIdentity) {
        body.append('idToken', googleIdentity.idToken);
      }
      if (file) body.append('verificationDocs', file);
      const result = await api<{ message: string }>('/suppliers/register', {
        method: 'POST',
        body,
      });
      setDone(result.message);
      setTimeout(() => void router.push('/auth/login'), 1200);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <AuthShell>
      <div className="supplier-card">
        <h1>Become a DOVA Supplier</h1>
        <p>
          Join our trusted supplier network and connect your products directly with buyers.
        </p>
        {isGoogleAuthEnabled() ? (
          <div style={{ marginBottom: 16 }}>
            {!usePassword ? (
              <>
                {googleIdentity ? (
                  <p className="form-hint">
                    Signed in with Google as <strong>{googleIdentity.email}</strong>. Complete your business details below.
                  </p>
                ) : (
                  <GoogleIdentityStep
                    disabled={busy}
                    text="continue_with"
                    onVerified={(identity) => {
                      setGoogleIdentity(identity);
                      setForm((current) => ({
                        ...current,
                        email: identity.email,
                        contactName: current.contactName || identity.fullName,
                      }));
                    }}
                  />
                )}
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setUsePassword(true);
                    setGoogleIdentity(null);
                  }}
                >
                  Use email and password instead
                </button>
              </>
            ) : (
              <button
                type="button"
                className="link-button"
                onClick={() => {
                  setUsePassword(false);
                  setForm((current) => ({ ...current, password: '' }));
                }}
              >
                Continue with Google instead
              </button>
            )}
          </div>
        ) : null}
        <form onSubmit={submit}>
          <label>Contact / Full Name</label>
          <input
            required
            placeholder="Enter your full name"
            value={form.contactName}
            onChange={(e) => setForm({ ...form, contactName: e.target.value })}
          />
          <label>Farm / Company Name</label>
          <input
            required
            placeholder="Enter your farm or company"
            value={form.businessName}
            onChange={(e) => setForm({ ...form, businessName: e.target.value })}
          />
          {usePassword ? (
            <>
              <label>Email</label>
              <input
                type="email"
                required
                placeholder="Enter your email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <label>Password</label>
              <PasswordInput
                minLength={8}
                required
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
              />
            </>
          ) : (
            <>
              <label>Email</label>
              <input type="email" value={form.email} readOnly placeholder="Verified via Google" />
            </>
          )}
          <label>Phone Number</label>
          <input
            required
            placeholder="Enter your phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <label>Verification document (PDF / JPG / PNG, max 5 MB)</label>
          <p className="form-hint">
            Upload <strong>one clear document</strong> that proves your business or identity.
            Accepted examples:
          </p>
          <ul className="form-hint-list">
            <li>
              <strong>CAC / Business Name Registration</strong> (preferred for companies)
            </li>
            <li>
              <strong>Valid government ID</strong> of the owner/contact — NIN slip, National ID,
              Driver&apos;s Licence, or International Passport
            </li>
            <li>
              Optional for farms: <strong>proof of farm/business address</strong> (e.g. utility
              bill)
            </li>
          </ul>
          <p className="form-hint">
            Our admin team will review your upload before approving your supplier account.
          </p>
          <input
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => setFile(e.target.files?.[0])}
          />
          {file && (
            <p className="form-hint" style={{ marginTop: 8 }}>
              Selected: {file.name}
            </p>
          )}
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Submitting…" inline size="sm" /> : 'Register as Supplier'}
          </button>
          {error && <p className="error">{error}</p>}
          {done && <p>{done}</p>}
        </form>
        <div className="login-link">
          Already registered? <Link href="/auth/login">Login</Link>
        </div>
      </div>
    </AuthShell>
  );
}
