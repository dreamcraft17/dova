import { ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import DovaChainNavbar from './DovaChainNavbar';

const NAV_ITEMS = [
  { label: 'How It Works', href: '/#how' },
  { label: 'Products', href: '/marketplace', matchPrefixes: ['/products'] },
  { label: 'Bundles', href: '/bundles' },
  { label: 'Farmers', href: '/#farmers' },
  { label: 'DOVA AI', href: '/chat' },
  { label: 'About', href: '/about' },
];

export function ChainChrome({ title, children }: { title: string; children: ReactNode }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const dashboard =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/supplier' : '/customer/profile';
  const canShop = !user || user.role === 'customer';

  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="storefront-app">
      <DovaChainNavbar
        navItems={NAV_ITEMS}
        user={user ? { fullName: user.fullName } : null}
        cartCount={count}
        canShop={canShop}
        dashboardHref={dashboard}
        onLogout={() => {
          void logout();
        }}
      />
      <main>{children}</main>
      <footer className="footer">
        <div className="container">
          <div className="footgrid">
            <div>
              <strong style={{ letterSpacing: '0.12em' }}>
                DOVA<span style={{ color: 'var(--gold)' }}>CHAIN</span>
              </strong>
              <p>From Farm to Table. On Time, Every Time.</p>
              <p>Building a technology-enabled food supply chain, starting with Plantain Flour.</p>
            </div>
            <div>
              <h4>SHOP</h4>
              <Link href="/marketplace">Products</Link>
              <Link href="/bundles">Bundles</Link>
              <Link href="/cart">Cart</Link>
            </div>
            <div>
              <h4>COMPANY</h4>
              <Link href="/about">About Us</Link>
              <Link href="/contact">Contact Us</Link>
              <Link href="/feedback">Feedback</Link>
            </div>
            <div>
              <h4>NETWORK</h4>
              <Link href="/#farmers">Farmers</Link>
              <Link href="/#businesses">Businesses</Link>
              <a href="https://dova.dntech.id/chat">DOVA AI</a>
            </div>
          </div>
          <div className="bottom">
            <span>© 2026 DOVA Chain. All rights reserved.</span>
            <span>officialdovachain@gmail.com · Nigeria</span>
          </div>
        </div>
      </footer>
    </div>
  );
}