import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { ProfileAccountEditor } from '../../components/ProfileAccountEditor';
import { RequireAuth } from '../../components/RequireAuth';
import { useAuth } from '../../context/AuthContext';

const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconOrders = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);
const IconCart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);

export default function CustomerProfile() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const t = router.query.tab;
    if (t === 'history') void router.replace('/customer/history');
    if (t === 'cart') void router.replace('/cart');
  }, [router, router.query.tab]);

  if (!user) return null;

  const initials = user.fullName.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

  const navItems = [
    { id: 'profile', label: 'Profile', href: '/customer/profile', icon: <IconUser />, current: true },
    { id: 'history', label: 'Purchase History', href: '/customer/history', icon: <IconOrders />, current: false },
    { id: 'cart', label: 'My Cart', href: '/cart', icon: <IconCart />, current: false },
  ] as const;

  return (
    <Layout>
      <RequireAuth roles={['customer']}>
        <div className="profile-layout">
          <aside className="profile-sidebar">
            <div className="profile-banner">
              <div className="profile-avatar">{initials}</div>
              <p className="profile-name">{user.fullName}</p>
              <p className="profile-email">{user.email}</p>
            </div>

            <nav className="profile-nav" role="tablist" aria-label="Account sections">
              {navItems.map((item) => (
                item.current ? (
                  <span
                    key={item.id}
                    role="tab"
                    aria-selected="true"
                    className="profile-nav-item active"
                  >
                    <span className="profile-nav-icon">{item.icon}</span>
                    {item.label}
                  </span>
                ) : (
                  <Link
                    key={item.id}
                    href={item.href}
                    role="tab"
                    aria-selected="false"
                    className="profile-nav-item"
                  >
                    <span className="profile-nav-icon">{item.icon}</span>
                    {item.label}
                  </Link>
                )
              ))}
            </nav>
          </aside>

          <main className="profile-content">
            <ProfileAccountEditor user={user} variant="customer" />
          </main>
        </div>
      </RequireAuth>
    </Layout>
  );
}
