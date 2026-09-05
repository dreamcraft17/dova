type AuthAsideProps = {
  variant: 'login' | 'register';
};

const panels = {
  login: {
    kicker: 'Customer account',
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
    kicker: 'New customer',
    headline: 'Register once with email verification on this page.',
    detail:
      'Enter your work email, send the 6-digit code, then finish the form. Verified accounts can shop immediately after signup.',
    facts: [
      { label: 'Step 1', value: 'Send code to your work email' },
      { label: 'Step 2', value: 'Enter OTP here, then create your account' },
    ],
    mobile: 'Verify your email on this page before you submit the form.',
  },
};

export function AuthAside({ variant }: AuthAsideProps) {
  const panel = panels[variant];
  return (
    <div className="auth-aside">
      <p className="auth-context-mobile">{panel.mobile}</p>
      <aside className="auth-panel" aria-label="DOVA customer information">
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
    </div>
  );
}
