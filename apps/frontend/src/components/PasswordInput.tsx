import { Eye, EyeOff } from 'lucide-react';
import { InputHTMLAttributes, useState } from 'react';
import { passwordToggleState } from 'dova-shared';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);
  const toggle = passwordToggleState(visible);

  return (
    <div className="password-field">
      <input {...props} type={toggle.inputType} />
      <button
        type="button"
        className="password-toggle-btn"
        onClick={() => setVisible((v) => !v)}
        aria-label={toggle.ariaLabel}
        aria-pressed={visible}
      >
        {toggle.icon === 'eye' ? <Eye size={18} /> : <EyeOff size={18} />}
      </button>
    </div>
  );
}
