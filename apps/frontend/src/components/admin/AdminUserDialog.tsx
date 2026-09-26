import { FormEvent, useEffect, useState } from 'react';
import { ROLES, type Role } from 'dova-shared';
import { api } from '../../lib/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

export type AdminUserDetail = {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  role: Role;
  isActive: boolean;
  emailVerifiedAt?: string;
  createdAt: string;
  orderCount?: number;
  supplierOrderCount?: number;
  canDelete?: boolean;
  supplier?: { id: string; businessName: string; status: string };
};

type AdminUserDialogProps = {
  userId: string | null;
  open: boolean;
  currentUserId?: string;
  onClose: () => void;
  onSaved: () => void;
};

const emptyForm = {
  fullName: '',
  email: '',
  phoneNumber: '',
  role: 'customer' as Role,
  isActive: true,
  password: '',
  confirmPassword: '',
};

export function AdminUserDialog({ userId, open, currentUserId, onClose, onSaved }: AdminUserDialogProps) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const isSelf = Boolean(currentUserId && userId === currentUserId);

  useEffect(() => {
    if (!open || !userId) {
      setDetail(null);
      setForm(emptyForm);
      setError('');
      setMessage('');
      return;
    }
    setLoading(true);
    setError('');
    void api<AdminUserDetail>(`/admin/users/${userId}`)
      .then((data) => {
        setDetail(data);
        setForm({
          fullName: data.fullName,
          email: data.email,
          phoneNumber: data.phoneNumber || '',
          role: data.role,
          isActive: data.isActive,
          password: '',
          confirmPassword: '',
        });
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [open, userId]);

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api(`/admin/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phoneNumber: form.phoneNumber || undefined,
          role: form.role,
          isActive: form.isActive,
        }),
      });
      setMessage('User updated.');
      onSaved();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function resetPassword(event: FormEvent) {
    event.preventDefault();
    if (!userId) return;
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api(`/admin/users/${userId}/reset-password`, {
        method: 'POST',
        body: JSON.stringify({ password: form.password }),
      });
      setForm((current) => ({ ...current, password: '', confirmPassword: '' }));
      setMessage('Password reset successfully.');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function deleteUser() {
    if (!userId || isSelf) return;
    const label = detail?.email || 'this user';
    if (!window.confirm(`Delete ${label}? This cannot be undone.`)) return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      await api(`/admin/users/${userId}`, { method: 'DELETE' });
      onSaved();
      onClose();
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  const canDeleteUser = Boolean(detail && !isSelf);

  return (
    <Dialog open={open} onOpenChange={(next: boolean) => { if (!next) onClose(); }}>
      <DialogContent className="admin-app max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Manage user</DialogTitle>
          <DialogDescription>{detail?.email ?? 'Loading user details…'}</DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading user…</p>
        ) : (
          <div className="space-y-6">
            {detail ? (
              <div className="space-y-1 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
                <p>Joined: {new Date(detail.createdAt).toLocaleString('en-NG')}</p>
                {typeof detail.orderCount === 'number' && <p>Orders: {detail.orderCount}</p>}
                {typeof detail.supplierOrderCount === 'number' && detail.supplierOrderCount > 0 && (
                  <p>Supplier orders: {detail.supplierOrderCount}</p>
                )}
                {detail.supplier && (
                  <p>
                    Supplier: {detail.supplier.businessName} ({detail.supplier.status})
                  </p>
                )}
                {detail.emailVerifiedAt && <p>Email verified: {new Date(detail.emailVerifiedAt).toLocaleString('en-NG')}</p>}
              </div>
            ) : null}

            <form className="space-y-3" onSubmit={saveProfile}>
              <h3 className="text-sm font-bold text-primary">Profile & access</h3>
              <div className="space-y-1.5">
                <Label htmlFor="admin-user-name">Full name</Label>
                <Input
                  id="admin-user-name"
                  required
                  value={form.fullName}
                  onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-user-email">Email</Label>
                <Input
                  id="admin-user-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-user-phone">Phone</Label>
                <Input
                  id="admin-user-phone"
                  type="tel"
                  placeholder="Optional"
                  value={form.phoneNumber}
                  onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-user-role">Role</Label>
                <Select
                  value={form.role}
                  disabled={isSelf}
                  onValueChange={(value: string) => setForm({ ...form, role: value as Role })}
                >
                  <SelectTrigger id="admin-user-role" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isSelf && <p className="text-xs text-muted-foreground">You cannot change your own role.</p>}
              </div>
              <div className="flex items-center justify-between rounded-lg border border-input px-3 py-2.5">
                <Label htmlFor="admin-user-active" className="cursor-pointer">
                  Account active
                </Label>
                <Switch
                  id="admin-user-active"
                  checked={form.isActive}
                  disabled={isSelf}
                  onCheckedChange={(checked: boolean) => setForm({ ...form, isActive: checked })}
                />
              </div>
              {isSelf && <p className="text-xs text-muted-foreground">You cannot deactivate your own account.</p>}
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save changes'}
              </Button>
            </form>

            <Separator />

            <form className="space-y-3" onSubmit={resetPassword}>
              <h3 className="text-sm font-bold text-primary">Reset password</h3>
              <div className="space-y-1.5">
                <Label htmlFor="admin-user-password">New password</Label>
                <Input
                  id="admin-user-password"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="admin-user-confirm">Confirm password</Label>
                <Input
                  id="admin-user-confirm"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                />
              </div>
              <Button
                type="submit"
                variant="outline"
                disabled={busy || !form.password || form.password.length < 8}
              >
                {busy ? 'Resetting…' : 'Reset password'}
              </Button>
            </form>

            {!isSelf ? (
              <>
                <Separator />
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-destructive">Delete account</h3>
                  <p className="text-xs text-muted-foreground">
                    Permanently removes this account and related data, including order history tied to this user.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    disabled={busy || !canDeleteUser}
                    onClick={() => void deleteUser()}
                  >
                    Delete user
                  </Button>
                </div>
              </>
            ) : null}

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {message ? <p className="text-sm text-secondary">{message}</p> : null}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
