import { type ComponentProps, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordToggleState } from 'dova-shared';
import { cn } from '@/lib/utils';
import { AuthField } from './AuthField';

type AuthPasswordFieldProps = Omit<ComponentProps<typeof AuthField>, 'type' | 'trailing'>;

export function AuthPasswordField({ className, ...props }: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const toggle = passwordToggleState(visible);

  return (
    <AuthField
      {...props}
      type={toggle.inputType}
      className={cn('pr-11', className)}
      trailing={
        <button
          type="button"
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-[9px] text-muted-foreground hover:bg-muted hover:text-[var(--deep)]"
          onClick={() => setVisible((value) => !value)}
          aria-label={toggle.ariaLabel}
          aria-pressed={visible}
        >
          {toggle.icon === 'eye' ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
        </button>
      }
    />
  );
}
