import type { ReactNode } from 'react';
import { inter, dmSans } from '../lib/fonts';

type AuthShellProps = {
  children: ReactNode;
  aside: ReactNode;
};

const AUTH_BACKDROP = 'radial-gradient(circle at 10% 10%, #0ba66f20, transparent 35%), linear-gradient(135deg, var(--near), var(--forest))';

export function AuthShell({ children, aside }: AuthShellProps) {
  return (
    // `contents` keeps the theme tokens/fonts without `.admin-app`'s cream background painting over the backdrop.
    <div className={`admin-app contents ${inter.variable} ${dmSans.variable}`}>
      <div className="flex min-h-screen items-center px-4 py-8 sm:px-6 lg:py-12" style={{ background: AUTH_BACKDROP }}>
        <div className="mx-auto grid w-full max-w-[1120px] items-start gap-6 lg:grid-cols-[1fr_480px] lg:gap-14">
          {aside}
          <div className="mx-auto w-full max-w-[480px] lg:mx-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
