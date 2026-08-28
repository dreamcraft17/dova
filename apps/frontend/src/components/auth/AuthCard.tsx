import { ReactNode } from 'react';

export type AuthStep = {
  label: string;
  state: 'done' | 'current' | 'upcoming';
};

type AuthCardProps = {
  title: string;
  subtitle: string;
  steps?: AuthStep[];
  notice?: ReactNode;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, subtitle, steps, notice, children, footer }: AuthCardProps) {
  return (
    <article className="auth-card">
      {steps?.length ? (
        <ol className="auth-steps" aria-label="Registration progress">
          {steps.map((step, index) => (
            <li key={step.label} className={`auth-step auth-step--${step.state}`}>
              <span className="auth-step-index" aria-hidden="true">
                {index + 1}
              </span>
              <span className="auth-step-label">{step.label}</span>
            </li>
          ))}
        </ol>
      ) : null}
      <header className="auth-card-header">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </header>
      {notice ? <div className="auth-notice">{notice}</div> : null}
      {children}
      <footer className="auth-card-footer">{footer}</footer>
    </article>
  );
}
