import Link from 'next/link';
import { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="auth-shell">
      <Link href="/" className="auth-brand">
        <img src="/images/logo.jpg" alt="DOVA" />
        DOVA
      </Link>
      {children}
    </div>
  );
}
