import { FormEvent, useState } from 'react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';

function SettingsContent() {
  const { user, refresh } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber ?? '');
  const [profileBusy, setProfileBusy] = useState(false);
  const [profileMessage, setProfileMessage] = useState('');
  const [profileError, setProfileError] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState('');
  const [passwordError, setPasswordError] = useState('');

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    setProfileBusy(true);
    setProfileError('');
    setProfileMessage('');
    try {
      await api('/auth/me', {
        method: 'PATCH',
        body: JSON.stringify({ fullName, phoneNumber: phoneNumber || undefined }),
      });
      await refresh();
      setProfileMessage('Profile updated.');
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setProfileBusy(false);
    }
  }

  async function changePassword(e: FormEvent) {
    e.preventDefault();
    setPasswordError('');
    setPasswordMessage('');
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setPasswordBusy(true);
    try {
      await api('/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password changed.');
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : 'Failed to change password.');
    } finally {
      setPasswordBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Account</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Settings</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">Manage your administrator profile and password.</p>
      </div>

      <Card className="max-w-xl p-5">
        <h2 className="mb-3 text-base font-bold text-primary">Profile</h2>
        <form className="space-y-3" onSubmit={(e) => void saveProfile(e)}>
          <div className="space-y-1.5">
            <Label htmlFor="settings-name">Full name</Label>
            <Input id="settings-name" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-email">Email</Label>
            <Input id="settings-email" value={user?.email ?? ''} disabled />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-phone">Phone</Label>
            <Input id="settings-phone" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Optional" />
          </div>
          <Button type="submit" disabled={profileBusy}>
            {profileBusy ? 'Saving…' : 'Save changes'}
          </Button>
          {profileError ? <p className="text-sm text-destructive">{profileError}</p> : null}
          {profileMessage ? <p className="text-sm text-secondary">{profileMessage}</p> : null}
        </form>
      </Card>

      <Card className="max-w-xl p-5">
        <h2 className="mb-3 text-base font-bold text-primary">Change password</h2>
        <form className="space-y-3" onSubmit={(e) => void changePassword(e)}>
          <div className="space-y-1.5">
            <Label htmlFor="settings-current-password">Current password</Label>
            <Input
              id="settings-current-password"
              type="password"
              minLength={8}
              required
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-new-password">New password</Label>
            <Input
              id="settings-new-password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="settings-confirm-password">Confirm new password</Label>
            <Input
              id="settings-confirm-password"
              type="password"
              minLength={8}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <Button type="submit" variant="outline" disabled={passwordBusy}>
            {passwordBusy ? 'Changing…' : 'Change password'}
          </Button>
          {passwordError ? <p className="text-sm text-destructive">{passwordError}</p> : null}
          {passwordMessage ? <p className="text-sm text-secondary">{passwordMessage}</p> : null}
        </form>
      </Card>
    </div>
  );
}

export default function AdminSettingsPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Settings" subtitle="Administrator account">
          <SettingsContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
