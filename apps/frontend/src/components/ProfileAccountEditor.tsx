import Link from 'next/link';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import type { User } from 'dova-shared';
import { useAuth } from '../context/AuthContext';
import { ApiError, api } from '../lib/api';
import { useToast } from '../context/ToastContext';
import { StatusPill, SupplierCard, buttonStyles, fieldStyles } from './supplier/ui';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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

  if (variant === 'supplier') {
    return (
      <div className="space-y-3.5">
        {!verified ? <EmailVerificationPanel user={user} variant={variant} /> : null}
        <SupplierCard className="p-6">
          <h3 className="mb-4 text-[15px] font-bold text-[var(--near)]">Account Details</h3>
          <form onSubmit={(e) => void saveProfile(e)}>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="supplier-fullname" className={fieldStyles.label}>
                  Full Name *
                </Label>
                <Input
                  id="supplier-fullname"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  minLength={2}
                  required
                  autoComplete="name"
                  className={fieldStyles.control}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="supplier-phone" className={fieldStyles.label}>
                  Phone Number
                </Label>
                <Input
                  id="supplier-phone"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  minLength={7}
                  placeholder="+234 ..."
                  autoComplete="tel"
                  className={fieldStyles.control}
                />
              </div>
              <div className="grid gap-1.5 md:col-span-2">
                <Label htmlFor="supplier-email" className={fieldStyles.label}>
                  Email Address
                </Label>
                <div className="flex items-center gap-2">
                  <Input id="supplier-email" value={user.email} disabled className={`${fieldStyles.control} flex-1`} />
                  <StatusPill tone={verified ? 'green' : 'yellow'}>{verified ? 'Verified' : 'Not verified'}</StatusPill>
                </div>
              </div>
            </div>
            {profileErr ? <p className="mt-3 text-xs text-destructive">{profileErr}</p> : null}
            {profileMsg ? <p className="mt-3 text-xs text-[var(--emerald)]">{profileMsg}</p> : null}
            <div className="mt-5 flex justify-end">
              <Button type="submit" className={buttonStyles.primary} disabled={profileBusy}>
                {profileBusy ? 'Saving…' : 'Save Changes'}
              </Button>
            </div>
          </form>
        </SupplierCard>

        {canChangePassword ? (
          <SupplierCard className="p-6">
            <h3 className="mb-1 text-[15px] font-bold text-[var(--near)]">Security</h3>
            <p className="mb-4 text-[11px] text-muted-foreground">
              Change your password while signed in, or use{' '}
              <Link href="/auth/forgot-password" className="font-bold text-[var(--emerald)] hover:underline">
                forgot password
              </Link>{' '}
              if you cannot sign in.
            </p>
            <form onSubmit={(e) => void submitPassword(e)}>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="grid gap-1.5">
                  <Label htmlFor="supplier-current-password" className={fieldStyles.label}>
                    Current Password
                  </Label>
                  <Input
                    id="supplier-current-password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="current-password"
                    className={fieldStyles.control}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="supplier-new-password" className={fieldStyles.label}>
                    New Password
                  </Label>
                  <Input
                    id="supplier-new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className={fieldStyles.control}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="supplier-confirm-password" className={fieldStyles.label}>
                    Confirm New Password
                  </Label>
                  <Input
                    id="supplier-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    minLength={8}
                    required
                    autoComplete="new-password"
                    className={fieldStyles.control}
                  />
                </div>
              </div>
              {passwordErr ? <p className="mt-3 text-xs text-destructive">{passwordErr}</p> : null}
              {passwordMsg ? <p className="mt-3 text-xs text-[var(--emerald)]">{passwordMsg}</p> : null}
              <div className="mt-5 flex justify-end">
                <Button type="submit" variant="outline" className={buttonStyles.light} disabled={passwordBusy}>
                  {passwordBusy ? 'Updating…' : 'Change Password'}
                </Button>
              </div>
            </form>
          </SupplierCard>
        ) : null}
      </div>
    );
  }

  const cardStyle = { background: '#fff', border: '1px solid var(--line)', borderRadius: 14, padding: '20px' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {!verified ? <EmailVerificationPanel user={user} variant={variant} /> : null}
      <section style={cardStyle}>
        <h2 style={{ margin: '0 0 16px', fontSize: 18, color: 'var(--green)' }}>Profile Information</h2>

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

        <form onSubmit={(e) => void saveProfile(e)} className="form-grid">
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
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)', gridColumn: '1 / -1' }}>
            Account type: Customer · Member since {memberSince}
          </p>
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
        <section style={cardStyle}>
          <h2 style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--green)' }}>Security</h2>
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

  if (variant === 'supplier') {
    return (
      <SupplierCard className="border-[#ead79d] bg-[#fff7df] p-6">
        <h2 className="mb-1 text-[15px] font-bold text-[var(--near)]">Email verification</h2>
        <p className="mb-4 text-[11px] text-[#7c6214]">
          Enter the 6-digit code we sent to <strong>{user.email}</strong>. For older accounts created before inline
          verification, complete this here.
        </p>
        <form onSubmit={(e) => void submit(e)} className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="supplier-otp" className={fieldStyles.label}>
              Verification Code
            </Label>
            <Input
              className={`${fieldStyles.control} max-w-[200px] tracking-[0.3em]`}
              id="supplier-otp"
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
          </div>
          {error ? <p className="text-xs text-destructive">{error}</p> : null}
          <div className="flex flex-wrap items-center gap-2">
            <Button type="submit" className={buttonStyles.primary} disabled={busy}>
              {busy ? 'Verifying…' : 'Verify Email'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className={buttonStyles.light}
              disabled={resendBusy || resendCooldown > 0}
              onClick={() => void resend()}
            >
              {resendBusy ? 'Sending…' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
            </Button>
          </div>
        </form>
      </SupplierCard>
    );
  }

  const cardStyle = { background: '#fffbeb', border: '1px solid #fcd34d', borderRadius: 14, padding: '20px' };

  return (
    <section style={cardStyle} aria-labelledby="email-verification-heading">
      <h2
        id="email-verification-heading"
        style={{ margin: '0 0 8px', fontSize: 18, color: 'var(--green)' }}
      >
        Email verification
      </h2>
      <p style={{ margin: '0 0 16px', fontSize: 14, color: 'var(--muted)', lineHeight: 1.55 }}>
        Enter the 6-digit code we sent to <strong>{user.email}</strong>. For older accounts created before inline verification, complete this here before checkout.
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
