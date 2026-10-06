import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const authInputClass =
  'h-11 rounded-[12px] border-border bg-white px-3.5 text-[13px] text-foreground shadow-none placeholder:text-muted-foreground/70 focus-visible:border-[var(--emerald)] focus-visible:ring-[3px] focus-visible:ring-[#0ba66f26] aria-invalid:border-destructive';

type AuthFieldProps = ComponentProps<'input'> & {
  id: string;
  label: string;
  hint?: ReactNode;
  error?: string;
  icon?: ReactNode;
  trailing?: ReactNode;
};

export function AuthField({ id, label, hint, error, icon, trailing, className, ...props }: AuthFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[11px] font-black text-[var(--deep)]">
        {label}
      </Label>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <Input
          id={id}
          className={cn(authInputClass, icon && 'pl-10', className)}
          aria-invalid={Boolean(error)}
          aria-describedby={hint ? `${id}-hint` : undefined}
          {...props}
        />
        {trailing}
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="text-[11px] text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {error ? <p className="text-[11px] font-semibold text-destructive">{error}</p> : null}
    </div>
  );
}

type AuthOtpFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  action?: ReactNode;
};

export function AuthOtpField({ id, label, value, onChange, action }: AuthOtpFieldProps) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id} className="text-[11px] font-black text-[var(--deep)]">
        {label}
      </Label>
      <div className="flex gap-2">
        <Input
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="\d{6}"
          maxLength={6}
          required
          placeholder="000000"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={cn(authInputClass, 'flex-1 text-center text-base font-black tracking-[0.45em]')}
        />
        {action}
      </div>
    </div>
  );
}
