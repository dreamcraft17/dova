import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { User } from 'dova-shared';
import { useAuth } from '../context/AuthContext';
import { ApiError, api } from '../lib/api';
import { useToast } from '../context/ToastContext';

type Props = {
  user: User;
  variant?: 'customer' | 'supplier';
};

export function ProfileAccountEditor({ user, variant = 'customer' }: Props) {
  const { refresh, logout } = useAuth();
  const router = useRouter();
  const [fullName, setFullName] = useState(user.fullName);
  const [phoneNumber, setPhoneNumber] = useState(user.phoneNumber ?? '');
  const [profileMsg, setProfileMsg] = useState('');
  const [profileErr, setProfileErr] = useState('');
  const [profileBusy, setProfileBusy] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);

  useEffect(() => {
    setFullName(user.fullName);
    setPhoneNumber(user.phoneNumber ?? '');
  }, [user.fullName, user.phoneNumber]);

  const memberSince = new Date(user.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const verified = Boolean(user.emailVerifiedAt);
  const canChangePassword = user.role !== 'admin';

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileMsg('');
    setProfileErr('');
    setProfileBusy(true);
    try {
      await api<User>('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.trim() || undefined,
        }),
      });
      await refresh();
      setProfileMsg('Profile saved.');
    } catch (err) {
      setProfileErr(err instanceof ApiError ? err.message : 'Could not save profile.');
    } finally {
      setProfileBusy(false);
    }
  }

  async function submitPassword(e: FormEvent) {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordErr('');
    if (newPassword !== confirmPassword) {
      setPasswordErr('New passwords do not match.');
      return;
    }
    setPasswordBusy(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      setPasswordMsg('Password updated. Signing you out…');
      await logout();
      await router.push('/auth/login?reason=password-changed');
    } catch (err) {
      setPasswordErr(err instanceof ApiError ? err.message : 'Could not change password.');
    } finally {
      setPasswordBusy(false);
    }
  }

  const cardStyle = variant === 'customer'
    ? { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '20px' }
    : undefined;

  return (
    <div style={variant === 'customer' ? { display: 'flex', flexDirection: 'column', gap: 20 } : undefined}>
      {!verified ? <EmailVerificationPanel user={user} variant={variant} /> : null}
      <section className={variant === 'supplier' ? 'supplier-dash-panel supplier-dash-profile-card' : undefined} style={cardStyle}>
        {variant === 'customer' ? (
          <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--green)' }}>Profile Information</h2>
        ) : (
          <h3>Account</h3>
        )}

        <dl className={variant === 'supplier' ? undefined : undefined}>
          {variant === 'supplier' && (
            <>
              <div className="supplier-dash-profile-row">
                <dt>Email</dt>
                <dd>{user.email}</dd>
              </div>
              <div className="supplier-dash-profile-row">
                <dt>Email verification</dt>
                <dd>
                  <span className={`supplier-dash-badge ${verified ? 'success' : 'warn'}`}>
                    {verified ? 'Verified' : 'Not verified'}
                  </span>
                  {verified && user.emailVerifiedAt ? (
                    <span style={{ marginLeft: 8, fontSize: 12, color: 'var(--muted)' }}>
                      {new Date(user.emailVerifiedAt).toLocaleDateString('en-NG')}
                    </span>
                  ) : null}
                </dd>
              </div>
            </>
          )}
        </dl>

        {variant === 'customer' && (
          <div style={{ marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}>{user.email}</span>
            <span style={{
              padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
              background: verified ? '#dcfce7' : '#fef3c7',
              color: verified ? '#15803d' : '#b45309',
            }}>
              {verified ? 'Email verified' : 'Email not verified'}
            </span>
            {verified && user.emailVerifiedAt ? (
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                since {new Date(user.emailVerifiedAt).toLocaleDateString('en-NG')}
              </span>
            ) : null}
          </div>
        )}

        <form onSubmit={(e) => void saveProfile(e)} className="form-grid" style={{ marginTop: variant === 'supplier' ? 12 : 0 }}>
          <label>
            Full name
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              minLength={2}
              required
              autoComplete="name"
            />
          </label>
          <label>
            Phone number
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              minLength={7}
              placeholder="Add phone number"
              autoComplete="tel"
            />
          </label>
          {variant === 'customer' && (
            <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', gridColumn: '1 / -1' }}>
              Account type: Customer · Member since {memberSince}
            </p>
          )}
          {profileErr && <p className="error" style={{ gridColumn: '1 / -1' }}>{profileErr}</p>}
          {profileMsg && <p style={{ gridColumn: '1 / -1', color: 'var(--green)', margin: 0 }}>{profileMsg}</p>}
          <div style={{ gridColumn: '1 / -1' }}>
            <button type="submit" className="button" disabled={profileBusy}>
              {profileBusy ? 'Saving…' : 'Save profile'}
            </button>
          </div>
        </form>
      </section>

      {canChangePassword ? (
        <section className={variant === 'supplier' ? 'supplier-dash-panel supplier-dash-profile-card' : undefined} style={cardStyle}>
          {variant === 'customer' ? (
            <h2 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--green)' }}>Security</h2>
          ) : (
            <h3>Security</h3>
          )}
          <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)' }}>
            Change your password while signed in, or use{' '}
            <Link href="/auth/forgot-password">forgot password</Link> if you cannot sign in.
          </p>
          <form onSubmit={(e) => void submitPassword(e)} className="form-grid">
            <label>
              Current password
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="current-password"
              />
            </label>
            <label>
              New password
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            <label>
              Confirm new password
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                minLength={8}
                required
                autoComplete="new-password"
              />
            </label>
            {passwordErr && <p className="error" style={{ gridColumn: '1 / -1' }}>{passwordErr}</p>}
            {passwordMsg && <p style={{ gridColumn: '1 / -1', color: 'var(--green)', margin: 0 }}>{passwordMsg}</p>}
            <div style={{ gridColumn: '1 / -1' }}>
              <button type="submit" className="button secondary" disabled={passwordBusy}>
                {passwordBusy ? 'Updating…' : 'Change password'}
              </button>
            </div>
          </form>
        </section>
      ) : null}
    </div>
  );
}

type EmailVerificationPanelProps = {
  user: User;
  variant: 'customer' | 'supplier';
};

function EmailVerificationPanel({ user, variant }: EmailVerificationPanelProps) {
  const router = useRouter();
  const { refresh, establishSession } = useAuth();
  const { showToast } = useToast();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const promptedResend = useRef(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(() => setResendCooldown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  useEffect(() => {
    if (!router.isReady || router.query.verify !== '1' || promptedResend.current) return;
    promptedResend.current = true;
    void resend({ quiet: true });
  }, [router.isReady, router.query.verify]);

  async function resend(options: { quiet?: boolean } = {}) {
    if (resendBusy || resendCooldown > 0) return;
    setResendBusy(true);
    setError('');
    try {
      await api('/auth/resend-otp', { method: 'POST', body: JSON.stringify({ email: user.email }) });
      if (!options.quiet) {
        showToast('Verification code sent to your email.', 'success');
      }
      setResendCooldown(60);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Could not resend code.';
      if (options.quiet && /wait/i.test(message)) {
        setResendCooldown(60);
        return;
      }
      setError(message);
      if (err instanceof ApiError && message.includes('wait')) setResendCooldown(60);
    } finally {
      setResendBusy(false);
    }
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const result = await api<{ user: User }>('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({ email: user.email, code }),
      });
      establishSession(result.user);
      await refresh();
      showToast('Email verified. You can place orders now.', 'success');
      if (router.query.verify) {
        const { verify: _verify, ...rest } = router.query;
        await router.replace({ pathname: router.pathname, query: rest }, undefined, { shallow: true });
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Invalid verification code.');
    } finally {
      setBusy(false);
    }
  }

  const cardStyle = variant === 'customer'
    ? { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '20px' }
    : undefined;

  return (
    <section
      className={variant === 'supplier' ? 'supplier-dash-panel supplier-dash-profile-card' : undefined}
      style={cardStyle}
      aria-labelledby="email-verification-heading"
    >
      <h2
        id="email-verification-heading"
        style={{ margin: '0 0 8px', fontSize: variant === 'customer' ? 18 : undefined, color: 'var(--green)' }}
      >
        Email verification
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }}>
        Enter the 6-digit code we sent to <strong>{user.email}</strong>. Checkout stays blocked until this is done.
      </p>
      <form onSubmit={(e) => void submit(e)} className="form-grid">
        <label style={{ gridColumn: '1 / -1' }}>
          Verification code
          <input
            className="otp-input"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            required
            placeholder="000000"
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
          />
        </label>
        {error ? <p className="error" style={{ gridColumn: '1 / -1', margin: 0 }}>{error}</p> : null}
        <div style={{ gridColumn: '1 / -1', display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center' }}>
          <button type="submit" className="button" disabled={busy}>
            {busy ? 'Verifying…' : 'Verify email'}
          </button>
          <button
            type="button"
            className="button secondary"
            disabled={resendBusy || resendCooldown > 0}
            onClick={() => void resend()}
          >
            {resendBusy ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>
      </form>
    </section>
  );
}
