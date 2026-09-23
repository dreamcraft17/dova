import Link from 'next/link';
import { ReactNode } from 'react';

type AuthShellProps = {
  children: ReactNode;
  aside?: ReactNode;
};

export function AuthShell({ children, aside }: AuthShellProps) {
  return (
    <div className="auth-shell">
      <div className="auth-layout">
        {aside}
        <div className="auth-main">
          <Link href="/" className="auth-brand">
            <img src="/images/logo.svg" alt="" width={44} height={44} />
            <span>DOVA CHAIN</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
