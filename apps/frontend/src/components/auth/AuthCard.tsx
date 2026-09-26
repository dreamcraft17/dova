import Link from 'next/link';
import type { ReactNode } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export type AuthStep = {
  label: string;
  state: 'done' | 'current' | 'upcoming';
};

type AuthCardProps = {
  eyebrow: string;
  title: string;
  subtitle: ReactNode;
  portal?: string;
  steps?: AuthStep[];
  notice?: ReactNode;
  securityNote?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthBrand({ portal }: { portal: string }) {
  return (
    <Link href="/" className="flex items-center gap-3">
      <span className="grid size-[50px] shrink-0 place-items-center rounded-[14px] bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-2xl font-black text-[var(--deep)] shadow-[0_8px_25px_rgba(0,0,0,0.13)]">
        D
      </span>
      <span className="leading-tight">
        <strong className="block text-lg font-black tracking-wide text-[var(--deep)]">DOVA CHAIN</strong>
        <span className="mt-0.5 block text-[11px] text-muted-foreground">{portal}</span>
      </span>
    </Link>
  );
}

export function AuthCard({
  eyebrow,
  title,
  subtitle,
  portal = 'Customer & Supplier Portal',
  steps,
  notice,
  securityNote,
  children,
  footer,
}: AuthCardProps) {
  return (
    <article className="rounded-[28px] bg-white p-6 shadow-[0_30px_80px_rgba(0,0,0,0.27)] sm:p-8">
      <div className="mb-6">
        <AuthBrand portal={portal} />
      </div>

      {steps?.length ? (
        <ol className="mb-5 grid gap-2 sm:grid-cols-2" aria-label="Progress">
          {steps.map((step, index) => (
            <li
              key={step.label}
              aria-current={step.state === 'current' ? 'step' : undefined}
              className={cn(
                'flex items-center gap-2 rounded-[12px] border px-3 py-2 text-[11px] font-bold',
                step.state === 'done' && 'border-transparent bg-[var(--deep)] text-white',
                step.state === 'current' && 'border-[var(--emerald)] bg-[#eaf6f1] text-[var(--deep)]',
                step.state === 'upcoming' && 'border-border text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'grid size-5 shrink-0 place-items-center rounded-full text-[10px] font-black',
                  step.state === 'done' && 'bg-[var(--gold)] text-[var(--deep)]',
                  step.state === 'current' && 'bg-[var(--emerald)] text-white',
                  step.state === 'upcoming' && 'bg-muted text-muted-foreground',
                )}
                aria-hidden="true"
              >
                {step.state === 'done' ? <Check className="size-3" strokeWidth={3} /> : index + 1}
              </span>
              {step.label}
            </li>
          ))}
        </ol>
      ) : null}

      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[var(--emerald)]">{eyebrow}</p>
      <h1 className="mb-2 mt-1.5 text-[28px] font-black leading-tight tracking-[-0.02em] text-[var(--deep)]">{title}</h1>
      <p className="mb-5 text-[13px] leading-relaxed text-muted-foreground">{subtitle}</p>

      {notice ? (
        <div className="mb-5 rounded-[12px] border border-[#cce8db] bg-[#eaf6f1] px-4 py-3 text-xs leading-relaxed text-[#17694f]">
          {notice}
        </div>
      ) : null}

      {children}

      {securityNote ? (
        <div className="mt-4 rounded-[12px] bg-[#f1f7f2] p-3 text-[11px] leading-relaxed text-muted-foreground [&_strong]:text-[var(--deep)]">
          {securityNote}
        </div>
      ) : null}

      {footer ? (
        <footer className="mt-5 space-y-1.5 text-center text-xs text-muted-foreground [&_a]:font-black [&_a]:text-[var(--emerald)] [&_a:hover]:underline">
          {footer}
        </footer>
      ) : null}

      <div className="mt-4 text-center">
        <Link href="/" className="text-[11px] font-black text-[var(--emerald)] hover:underline">
          ← Back to DOVA
        </Link>
      </div>
    </article>
  );
}
