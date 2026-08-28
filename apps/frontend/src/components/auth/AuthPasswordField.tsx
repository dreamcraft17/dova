import { InputHTMLAttributes, ReactNode, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { passwordToggleState } from 'dova-shared';

type AuthPasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
};

export function AuthPasswordField({ id, label, hint, error, icon, ...props }: AuthPasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const toggle = passwordToggleState(visible);

  return (
    <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="auth-field-control">
        {icon ? <span className="auth-field-icon" aria-hidden="true">{icon}</span> : null}
        <input id={id} type={toggle.inputType} aria-invalid={Boolean(error)} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
        <button
          type="button"
          className="password-toggle-btn"
          onClick={() => setVisible((value) => !value)}
          aria-label={toggle.ariaLabel}
          aria-pressed={visible}
        >
          {toggle.icon === 'eye' ? <Eye size={18} /> : <EyeOff size={18} />}
        </button>
      </div>
      {hint ? (
        <p id={`${id}-hint`} className="auth-field-hint">
          {hint}
        </p>
      ) : null}
      {error ? <p className="auth-field-error">{error}</p> : null}
    </div>
  );
}
