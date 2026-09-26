type AuthAsideProps = {
  variant: 'login' | 'register' | 'supplier' | 'recovery' | 'verify';
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
  supplier: {
    kicker: 'Supplier network',
    headline: 'Sell your produce to verified buyers.',
    detail:
      'Apply once with your business details and one verification document. Our team reviews every application before your supplier dashboard opens.',
    facts: [
      { label: 'Review', value: 'Admin verifies your document before approval' },
      { label: 'Dashboard', value: 'Manage products, orders and sales in one place' },
    ],
    mobile: 'Apply once — our team reviews your document before approval.',
  },
  recovery: {
    kicker: 'Password help',
    headline: 'Get back into your account in two steps.',
    detail:
      "We'll email a 6-digit reset code to your account address. Enter it with your new password, then sign in as usual.",
    facts: [
      { label: 'Step 1', value: 'Request a reset code by email' },
      { label: 'Step 2', value: 'Enter the code and choose a new password' },
    ],
    mobile: "We'll email you a 6-digit code to reset your password.",
  },
  verify: {
    kicker: 'Almost there',
    headline: 'One quick check before you start.',
    detail:
      "Enter the 6-digit code sent to your inbox to activate your account. Didn't get it? You can request a new code from this page.",
    facts: [
      { label: 'Code', value: '6 digits, sent to your email address' },
      { label: 'Resend', value: 'Request a new code every 60 seconds' },
    ],
    mobile: 'Enter the 6-digit code from your inbox to continue.',
  },
};

export function AuthAside({ variant }: AuthAsideProps) {
  const panel = panels[variant];
  return (
    <div className="text-white">
      <p className="text-center text-xs text-white/70 lg:hidden">{panel.mobile}</p>
      <aside className="hidden lg:block" aria-label="DOVA account information">
        <p className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-[var(--gold2)] before:h-0.5 before:w-[22px] before:rounded-full before:bg-[var(--gold)] before:content-['']">
          {panel.kicker}
        </p>
        <h2 className="mt-4 max-w-[15ch] font-[family-name:var(--font-heading)] text-[44px] font-black leading-[1.04] tracking-[-0.035em]">
          {panel.headline}
        </h2>
        <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-white/65">{panel.detail}</p>
        <dl className="mt-8 grid max-w-[540px] gap-3 sm:grid-cols-2">
          {panel.facts.map((fact) => (
            <div key={fact.label} className="rounded-[16px] border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
              <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-[var(--lime2)]">{fact.label}</dt>
              <dd className="mt-1.5 text-[13px] font-semibold leading-snug text-white/85">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </aside>
    </div>
  );
}
