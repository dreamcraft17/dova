type AuthAsideProps = {
  variant: 'login' | 'register';
};

const panels = {
  login: {
    kicker: 'Buyer account',
    headline: 'Pick up where your last order left off.',
    detail:
      'Browse verified suppliers, keep your cart, and choose morning or evening delivery when you checkout.',
    facts: [
      { label: 'Cut-off', value: 'Orders before 6:00 PM ship next day' },
      { label: 'Coverage', value: 'Verified farms & suppliers across Nigeria' },
    ],
    mobile: 'Sign in to access your cart and delivery slots.',
  },
  register: {
    kicker: 'New buyer',
    headline: 'Register once, verify your email, then shop.',
    detail:
      'DOVA connects businesses to verified agricultural suppliers. After signup we send a 6-digit code—no payment required yet.',
    facts: [
      { label: 'Step 1', value: 'Account details on this page' },
      { label: 'Step 2', value: 'Enter the code from your inbox' },
    ],
    mobile: 'We email a 6-digit code before your first sign-in.',
  },
};

export function AuthAside({ variant }: AuthAsideProps) {
  const panel = panels[variant];
  return (
    <>
      <p className="auth-context-mobile">{panel.mobile}</p>
      <aside className="auth-panel" aria-label="DOVA buyer information">
        <p className="auth-panel-kicker">{panel.kicker}</p>
        <h2 className="auth-panel-headline">{panel.headline}</h2>
        <p className="auth-panel-detail">{panel.detail}</p>
        <dl className="auth-panel-facts">
          {panel.facts.map((fact) => (
            <div key={fact.label} className="auth-panel-fact">
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </>
  );
}
