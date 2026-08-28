import { Leaf, ShieldCheck, Truck } from 'lucide-react';

type AuthAsideProps = {
  variant: 'login' | 'register';
};

const copy = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Fresh produce, trusted suppliers.',
    body: 'Sign in to browse verified farms, manage your cart, and track deliveries across Nigeria.',
    points: [
      { icon: ShieldCheck, text: 'Verified supplier network' },
      { icon: Truck, text: 'Morning & evening delivery slots' },
      { icon: Leaf, text: 'Farm-to-business sourcing' },
    ],
  },
  register: {
    eyebrow: 'Join DOVA',
    title: 'Shop direct from verified suppliers.',
    body: 'Create your buyer account in minutes. We send a one-time code to confirm your email before your first order.',
    points: [
      { icon: ShieldCheck, text: 'Email verification keeps accounts secure' },
      { icon: Leaf, text: 'Transparent pricing from source' },
      { icon: Truck, text: 'Pickup or delivery at checkout' },
    ],
  },
};

export function AuthAside({ variant }: AuthAsideProps) {
  const content = copy[variant];
  return (
    <aside className="auth-aside" aria-label="About DOVA">
      <p className="auth-aside-eyebrow">{content.eyebrow}</p>
      <h2>{content.title}</h2>
      <p className="auth-aside-body">{content.body}</p>
      <ul className="auth-aside-list">
        {content.points.map(({ icon: Icon, text }) => (
          <li key={text}>
            <Icon size={18} strokeWidth={2.2} aria-hidden="true" />
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
