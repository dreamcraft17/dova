import { useEffect, useRef } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { isRegistrationSuccessBackdropClick, isRegistrationSuccessContinueKey } from '../lib/registration-success';

type RegistrationSuccessModalProps = {
  open: boolean;
  message: string;
  onContinue: () => void;
};

export function RegistrationSuccessModal({ open, message, onContinue }: RegistrationSuccessModalProps) {
  const continueRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = 'hidden';
    const timer = window.setTimeout(() => continueRef.current?.focus(), 50);
    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (isRegistrationSuccessContinueKey(e.key)) onContinue();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, onContinue]);

  if (!open) return null;

  return (
    <div
      className="modal-backdrop registration-success-backdrop"
      onClick={(e) => {
        if (isRegistrationSuccessBackdropClick(e.target, e.currentTarget)) onContinue();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-success-title"
      aria-describedby="registration-success-message"
    >
      <div className="modal-card login-card registration-success-modal">
        <div className="registration-success-icon" aria-hidden="true">
          <CheckCircle2 size={48} strokeWidth={1.75} />
        </div>
        <h1 id="registration-success-title">Account created</h1>
        <p id="registration-success-message">{message}</p>
        <button
          ref={continueRef}
          type="button"
          className="registration-success-continue"
          onClick={onContinue}
        >
          Continue to products
        </button>
      </div>
    </div>
  );
}
