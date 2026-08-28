import { InputHTMLAttributes, ReactNode } from 'react';

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  icon?: ReactNode;
};

export function AuthField({ id, label, hint, error, icon, className, ...props }: AuthFieldProps) {
  return (
    <div className={`auth-field${error ? ' auth-field--error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <div className="auth-field-control">
        {icon ? <span className="auth-field-icon" aria-hidden="true">{icon}</span> : null}
        <input id={id} className={className} aria-invalid={Boolean(error)} aria-describedby={hint ? `${id}-hint` : undefined} {...props} />
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
