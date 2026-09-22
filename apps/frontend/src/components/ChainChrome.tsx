import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_LINKS: readonly { label: string; href: string; anchor?: boolean }[] = [
  { label: 'How It Works', href: '/#how', anchor: true },
  { label: 'Products', href: '/marketplace' },
  { label: 'Bundles', href: '/bundles' },
  { label: 'Farmers', href: '/#farmers', anchor: true },
  { label: 'DOVA AI', href: '/chat' },
  { label: 'About', href: '/about' },
];

export function ChainChrome({ title, children }: { title: string; children: ReactNode }) {
  const { user } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const dashboard =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/supplier' : '/customer/profile';

  useEffect(() => {
    document.title = title;
  }, [title]);

  useEffect(() => {
    setMenuOpen(false);
  }, []);

  return (
    <div className="storefront-app">
      <header className="nav">
        <div className="container navin">
          <Link className="logo" href="/">
            DOVA<i>CHAIN</i>
          </Link>
          <nav className="links" aria-label="Storefront navigation">
            {NAV_LINKS.map((link) =>
              link.anchor ? (
                <a key={link.href} href={link.href}>{link.label}</a>
              ) : (
                <Link key={link.href} href={link.href}>{link.label}</Link>
              ),
            )}
          </nav>
          <div className="actions">
            <Link className="icon" href="/marketplace" aria-label="Search">
              ⌕
            </Link>
            <Link className="icon" href="/cart" aria-label="Cart">
              🛒{count > 0 && <span style={{ marginLeft: 4, fontSize: 10 }}>{count}</span>}
            </Link>
            <Link className="btn gold" href="/marketplace">
              Shop
            </Link>
            <button type="button" className="menuBtn" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
              ☰
            </button>
          </div>
        </div>
      </header>
      <div className={`drawerBackdrop${menuOpen ? ' open' : ''}`} onClick={() => setMenuOpen(false)} aria-hidden={!menuOpen} />
      <div className={`drawer${menuOpen ? ' open' : ''}`} aria-hidden={!menuOpen}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <Link className="logo" href="/" onClick={() => setMenuOpen(false)}>
            DOVA<i>CHAIN</i>
          </Link>
          <button type="button" style={{ background: 'transparent', border: 0, color: '#fff', fontSize: 18 }} onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>
        <nav className="links" aria-label="Mobile navigation">
          {NAV_LINKS.map((link) =>
            link.anchor ? (
              <a key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</a>
            ) : (
              <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}>{link.label}</Link>
            ),
          )}
          {user && (
            <Link href={dashboard} onClick={() => setMenuOpen(false)}>
              My account
            </Link>
          )}
        </nav>
        <div className="actions">
          {user ? (
            <Link className="btn outline" style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }} href={dashboard} onClick={() => setMenuOpen(false)}>
              {user.fullName}
            </Link>
          ) : (
            <Link className="btn outline" style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }} href="/auth/login" onClick={() => setMenuOpen(false)}>
              Login
            </Link>
          )}
          <Link className="btn gold" href="/marketplace" onClick={() => setMenuOpen(false)}>
            Shop
          </Link>
        </div>
      </div>
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