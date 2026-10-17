import { useEffect, useRef } from 'react';
import { CheckCircle2, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isRegistrationSuccessBackdropClick, isRegistrationSuccessContinueKey } from '../lib/registration-success';

const WHATSAPP_COMMUNITY_URL = 'https://chat.whatsapp.com/Dna6yvE6ETjDqOUGWeu3Bv';

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
      className="fixed inset-0 z-[1000] grid place-items-center bg-[rgba(3,31,23,0.6)] p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (isRegistrationSuccessBackdropClick(e.target, e.currentTarget)) onContinue();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-success-title"
      aria-describedby="registration-success-message"
    >
      <div className="w-full max-w-[400px] rounded-[28px] bg-white p-8 text-center shadow-[0_30px_80px_rgba(0,0,0,0.27)]">
        <div
          className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-[#eaf6f1] text-[var(--emerald)]"
          aria-hidden="true"
        >
          <CheckCircle2 className="size-9" strokeWidth={1.75} />
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--emerald)]">Welcome to DOVA</p>
        <h1 id="registration-success-title" className="mt-1.5 text-2xl font-black text-[var(--deep)]">
          Account created
        </h1>
        <p id="registration-success-message" className="mt-2 text-[13px] leading-relaxed text-muted-foreground">
          {message}
        </p>
        <a
          href={WHATSAPP_COMMUNITY_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] border border-[#25D366] bg-[#eafaf1] text-[13px] font-black text-[#1f8d4e] hover:bg-[#dcf5e6]"
        >
          <MessageCircle className="size-4" />
          Join our community on WhatsApp
        </a>
        <Button
          ref={continueRef}
          type="button"
          onClick={onContinue}
          className="mt-3 h-11 w-full rounded-[12px] bg-[var(--deep)] text-[13px] font-black text-white hover:bg-[var(--forest)]"
        >
          Continue to products
        </Button>
      </div>
    </div>
  );
}
