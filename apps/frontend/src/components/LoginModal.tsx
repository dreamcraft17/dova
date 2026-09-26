import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Lock, Mail, X } from 'lucide-react';
import { api, configureLoginPersistence } from '../lib/api';
import { clearTokens, getRememberedEmail, setRememberedEmail } from '../lib/auth-session';
import { inter, dmSans } from '../lib/fonts';
import type { User } from 'dova-shared';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AuthBrand } from './auth/AuthCard';
import { AuthField } from './auth/AuthField';
import { AuthPasswordField } from './auth/AuthPasswordField';
import { AuthCheckbox, AuthSubmit } from './auth/AuthControls';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful login so caller can retry the action */
  onSuccess?: () => void;
}

export function LoginModal({ open, onClose, onSuccess }: LoginModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [busy, setBusy] = useState(false);
  const { establishSession } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      const savedEmail = getRememberedEmail();
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(true);
      }
      setTimeout(() => firstInputRef.current?.focus(), 50);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      clearTokens();
      configureLoginPersistence(rememberMe);
      const r = await api<{ user: User }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, rememberMe }),
      });
      setRememberedEmail(rememberMe ? email : null);
      establishSession(r.user);
      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        await router.push(
          r.user.role === 'admin'
            ? '/admin'
            : r.user.role === 'supplier'
              ? '/supplier'
              : '/marketplace',
        );
      }
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  return (
    // `contents` gives the storefront-hosted modal the dashboard theme tokens without `.admin-app`'s page background.
    <div className={`admin-app contents ${inter.variable} ${dmSans.variable}`}>
      <div
        className="fixed inset-0 z-[1000] grid place-items-center overflow-y-auto bg-[rgba(3,31,23,0.6)] p-4 backdrop-blur-sm"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-modal-title"
      >
        <div className="relative w-full max-w-[440px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.27)] sm:p-8">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close login modal"
            className="absolute right-4 top-4 grid size-9 place-items-center rounded-[11px] border border-border bg-white text-[var(--forest)] hover:bg-[#f1f7f2]"
          >
            <X className="size-4" />
          </button>

          <div className="mb-6">
            <AuthBrand portal="Customer & Supplier Portal" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--emerald)]">Welcome back</p>
          <h1 id="login-modal-title" className="mb-2 mt-1.5 text-2xl font-black text-[var(--deep)]">
            Sign in to continue
          </h1>
          <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">
            Sign in to continue exploring trusted agricultural products.
          </p>

          <form className="grid gap-4" onSubmit={submit}>
            <AuthField
              ref={firstInputRef}
              id="modal-email"
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
            <AuthPasswordField
              id="modal-password"
              label="Password"
              autoComplete="current-password"
              required
              placeholder="Enter your password"
              icon={<Lock className="size-4" />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <div className="flex items-center justify-between gap-3">
              <AuthCheckbox id="modal-remember" checked={rememberMe} onChange={setRememberMe}>
                Remember me
              </AuthCheckbox>
              <Link href="/auth/forgot-password" className="text-xs font-black text-[var(--emerald)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <AuthSubmit busy={busy} busyLabel="Signing in…">
              Sign In
            </AuthSubmit>
          </form>

          <div className="mt-5 space-y-1.5 text-center text-xs text-muted-foreground [&_a]:font-black [&_a]:text-[var(--emerald)] [&_a:hover]:underline">
            <p>
              Don&apos;t have an account? <Link href="/auth/register">Create one</Link>
            </p>
            <p>
              <Link href="/auth/supplier-register">Become a supplier</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
