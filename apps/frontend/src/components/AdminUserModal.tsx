import { FormEvent, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
  const [mounted, setMounted] = useState(false);
  const isSelf = Boolean(currentUserId && userId === currentUserId);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const canDelete = Boolean(detail && !isSelf && (detail.orderCount ?? 0) === 0);

  if (!open || !userId || !mounted) return null;

  return createPortal(
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
        <div className="admin-user-modal-header">
          <div>
            <h1 id="admin-user-modal-title">Manage user</h1>
            {detail && <p className="admin-user-modal-subtitle">{detail.email}</p>}
          </div>
          <button type="button" className="modal-close admin-user-modal-close" onClick={onClose} aria-label="Close user editor">
            ×
          </button>
        </div>

        <div className="admin-user-modal-body">
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
                <div className="admin-user-form-actions">
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
                  autoComplete="new-password"
                  value={form.password}
                  onChange={(event) => setForm({ ...form, password: event.target.value })}
                />
                <label htmlFor="admin-user-confirm">Confirm password</label>
                <input
                  id="admin-user-confirm"
                  type="password"
                  minLength={8}
                  autoComplete="new-password"
                  value={form.confirmPassword}
                  onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })}
                />
                <div className="admin-user-form-actions">
                  <button
                    type="submit"
                    className="admin-dash-btn admin-dash-btn-secondary"
                    disabled={busy || !form.password || form.password.length < 8}
                  >
                    {busy ? 'Resetting…' : 'Reset password'}
                  </button>
                </div>
              </form>

              {!isSelf && (
                <div className="admin-user-form admin-user-danger">
                  <h2>Delete account</h2>
                  <p className="form-hint">
                    {canDelete
                      ? 'Permanently remove this user. Use this for failed registrations or test accounts.'
                      : 'Users with order history cannot be deleted. Deactivate the account instead.'}
                  </p>
                  <div className="admin-user-form-actions">
                    <button
                      type="button"
                      className="admin-dash-btn admin-dash-btn-danger"
                      disabled={busy || !canDelete}
                      onClick={() => void deleteUser()}
                    >
                      Delete user
                    </button>
                  </div>
                </div>
              )}

              {error && <p className="error admin-user-error">{error}</p>}
              {message && <p className="admin-user-success">{message}</p>}
            </>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
