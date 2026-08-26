import { FormEvent, useEffect, useState } from 'react';
import { ROLES, type Role } from 'dova-shared';
import { Loading } from './Loading';
import { api } from '../lib/api';

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
  supplier?: { id: string; businessName: string; status: string };
};

type AdminUserModalProps = {
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

export function AdminUserModal({ userId, open, currentUserId, onClose, onSaved }: AdminUserModalProps) {
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

  useEffect(() => {
    if (!open) return;
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !userId) return null;

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
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

  return (
    <div
      className="modal-backdrop admin-user-modal-backdrop"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-user-modal-title"
    >
      <div className="modal-card admin-user-modal">
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close user editor">
          ×
        </button>
        <h1 id="admin-user-modal-title">Manage user</h1>
        {loading ? (
          <Loading label="Loading user…" />
        ) : (
          <>
            {detail && (
              <div className="admin-user-meta">
                <p>
                  <strong>Joined:</strong> {new Date(detail.createdAt).toLocaleString('en-NG')}
                </p>
                {typeof detail.orderCount === 'number' && (
                  <p>
                    <strong>Orders:</strong> {detail.orderCount}
                  </p>
                )}
                {detail.supplier && (
                  <p>
                    <strong>Supplier:</strong> {detail.supplier.businessName} ({detail.supplier.status})
                  </p>
                )}
                {detail.emailVerifiedAt && (
                  <p>
                    <strong>Email verified:</strong> {new Date(detail.emailVerifiedAt).toLocaleString('en-NG')}
                  </p>
                )}
              </div>
            )}

            <form className="admin-user-form" onSubmit={saveProfile}>
              <h2>Profile & access</h2>
              <label htmlFor="admin-user-name">Full name</label>
              <input
                id="admin-user-name"
                required
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
              <label htmlFor="admin-user-email">Email</label>
              <input
                id="admin-user-email"
                type="email"
                required
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
              <label htmlFor="admin-user-phone">Phone</label>
              <input
                id="admin-user-phone"
                type="tel"
                placeholder="Optional"
                value={form.phoneNumber}
                onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              />
              <label htmlFor="admin-user-role">Role</label>
              <select
                id="admin-user-role"
                value={form.role}
                disabled={isSelf}
                onChange={(event) => setForm({ ...form, role: event.target.value as Role })}
              >
                {ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
              {isSelf && <p className="form-hint">You cannot change your own role.</p>}
              <label className="admin-user-checkbox">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  disabled={isSelf}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />{' '}
                Account active
              </label>
              {isSelf && <p className="form-hint">You cannot deactivate your own account.</p>}
              <div className="admin-dash-actions">
                <button type="submit" className="admin-dash-btn admin-dash-btn-primary" disabled={busy}>
                  {busy ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>

            <form className="admin-user-form" onSubmit={resetPassword}>
              <h2>Reset password</h2>
              <label htmlFor="admin-user-password">New password</label>
              <input
                id="admin-user-password"
                type="password"
                minLength={8}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
              <label htmlFor="admin-user-confirm">Confirm password</label>
              <input
                id="admin-user-confirm"
                type="password"
                minLength={8}
                value={form.confirmPassword}
                onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
              />
              <div className="admin-dash-actions">
                <button
                  type="submit"
                  className="admin-dash-btn admin-dash-btn-secondary"
                  disabled={busy || !form.password || form.password.length < 8}
                >
                  {busy ? 'Resetting…' : 'Reset password'}
                </button>
              </div>
            </form>

            {error && <p className="error">{error}</p>}
            {message && <p className="admin-user-success">{message}</p>}
          </>
        )}
      </div>
    </div>
  );
}
