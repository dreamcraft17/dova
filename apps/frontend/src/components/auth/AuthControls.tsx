import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';

export function AuthSubmit({
  busy,
  busyLabel,
  disabled,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  disabled?: boolean;
  children: ReactNode;
}) {
  return (
    <Button
      type="submit"
      disabled={busy || disabled}
      className="h-11 w-full rounded-[12px] bg-[var(--deep)] text-[13px] font-black text-white hover:bg-[var(--forest)]"
    >
      {busy ? (
        <>
          <Loader2 className="size-4 animate-spin" />
          {busyLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function AuthSecondaryButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        'h-11 shrink-0 rounded-[12px] border-border bg-white px-4 text-xs font-black text-[var(--forest)] hover:bg-[#f1f7f2]',
        className,
      )}
      {...props}
    />
  );
}

export function AuthTextButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      className={cn(
        'font-black text-[var(--emerald)] hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline',
        className,
      )}
      {...props}
    />
  );
}

export function AuthMessage({ tone, children }: { tone: 'error' | 'success'; children: ReactNode }) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-[12px] border px-3 py-2.5 text-xs leading-relaxed',
        tone === 'error'
          ? 'border-[#f3cdc9] bg-[#fdecea] text-[#9b3027]'
          : 'border-[#cce8db] bg-[#eaf6f1] text-[#17694f]',
      )}
    >
      {children}
    </p>
  );
}

export function AuthCheckbox({
  id,
  checked,
  onChange,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value: boolean | 'indeterminate') => onChange(value === true)}
        className="data-checked:border-[var(--emerald)] data-checked:bg-[var(--emerald)]"
      />
      {children}
    </label>
  );
}
