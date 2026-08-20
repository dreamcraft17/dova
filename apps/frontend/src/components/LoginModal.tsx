import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';
import { Loading } from './Loading';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useRouter } from 'next/router';
import { PasswordInput } from './PasswordInput';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful login so caller can retry the action */
  onSuccess?: () => void;
}

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const { refresh } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus first input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const r = await api<{ user: { role: string } }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await refresh();
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(
          r.user.role === 'admin'
            ? '/admin'
            : r.user.role === 'supplier'
              ? '/supplier'
              : '/products',
        );
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
      setBusy(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
    >
      <div className="modal-card login-card">
        <button className="modal-close" onClick={onClose} aria-label="Close login modal">
          ×
        </button>
        <h1 id="login-modal-title">Welcome Back</h1>
        <p>Login to continue exploring trusted agricultural products.</p>
        <form onSubmit={submit}>
          <label htmlFor="modal-email">Email</label>
          <input
            id="modal-email"
            ref={firstInputRef}
            type="email"
            required
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="modal-password">Password</label>
          <div className="password-input-wrap">
            <input
              id="modal-password"
              type={showPassword ? 'text' : 'password'}
              required
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="password-toggle-btn"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div className="remember">
            <label>
              <input type="checkbox" /> Remember Me
            </label>
            <span style={{ color: '#999' }}>Forgot Password?</span>
          </div>
          <button type="submit" disabled={busy}>
            {busy ? <Loading label="Logging in…" inline size="sm" /> : 'Login'}
          </button>
        </form>
        <div className="register-link">
          Don&apos;t have an account? <Link href="/auth/register">Register</Link>
        </div>
        <div className="supplier-link">
          <Link href="/auth/supplier-register">Become a Supplier</Link>
        </div>
      </div>
    </div>
  );
}
