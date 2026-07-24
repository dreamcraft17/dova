import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export function Layout({
  children,
  chrome = 'full',
}: {
  children: ReactNode;
  chrome?: 'full' | 'none';
}) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const dash =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/supplier' : '/customer';

  useEffect(() => {
    const close = () => setMenuOpen(false);
    router.events.on('routeChangeStart', close);
    return () => router.events.off('routeChangeStart', close);
  }, [router.events]);

  useEffect(() => {
    document.body.classList.toggle('menu-open', menuOpen);
    return () => document.body.classList.remove('menu-open');
  }, [menuOpen]);

  if (chrome === 'none') return <>{children}</>;

  const navLinks = (
    <>
      <Link href="/" onClick={() => setMenuOpen(false)}>
        Home
      </Link>
      <Link href="/products" onClick={() => setMenuOpen(false)}>
        Products
      </Link>
      <Link href="/about" onClick={() => setMenuOpen(false)}>
        About Us
      </Link>
      <Link href="/contact" onClick={() => setMenuOpen(false)}>
        Contact Us
      </Link>
      <Link href="/cart" onClick={() => setMenuOpen(false)} className="nav-cart">
        Cart{count > 0 && <sup className="cart-count">{count}</sup>}
      </Link>
      {user ? (
        <>
          <Link href={dash} onClick={() => setMenuOpen(false)} className="nav-account">
            {user.fullName}
          </Link>
          <button
            type="button"
            className="button small"
            onClick={() => {
              setMenuOpen(false);
              void logout();
            }}
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)}>
            Login
          </Link>
          <Link
            href="/auth/register"
            className="button small"
            onClick={() => setMenuOpen(false)}
          >
            Register
          </Link>
        </>
      )}
    </>
  );

  return (
    <>
      <header className="header">
        <Link href="/" className="brand">
          <img src="/images/logo.jpg" alt="DOVA" />
          DOVA
        </Link>

        <div className="header-actions">
          <Link href="/cart" className="header-cart-btn" aria-label="Cart">
            🛒{count > 0 && <sup className="cart-count">{count}</sup>}
          </Link>
          <button
            type="button"
            className={`menu-toggle${menuOpen ? ' is-open' : ''}`}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>

        <nav className="nav-desktop">{navLinks}</nav>
      </header>

      <div
        className={`nav-backdrop${menuOpen ? ' is-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden={!menuOpen}
      />
      <nav className={`nav-drawer${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <div className="nav-drawer-head">
          <strong>Menu</strong>
          <button type="button" className="nav-drawer-close" onClick={() => setMenuOpen(false)}>
            ✕
          </button>
        </div>
        {navLinks}
      </nav>

      <main>{children}</main>

      <footer className="site-footer">
        <div className="footer-container">
          <div className="footer-logo">
            <h2>DOVA</h2>
            <p>
              Connecting verified farmers and buyers through a trusted agricultural marketplace.
            </p>
          </div>
          <div>
            <h4>Quick Links</h4>
            <ul>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li>
                <Link href="/products">Products</Link>
              </li>
              <li>
                <Link href="/about">About Us</Link>
              </li>
              <li>
                <Link href="/contact">Contact Us</Link>
              </li>
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>support@dova.com</li>
              <li>+234 800 000 0000</li>
              <li>Nigeria</li>
            </ul>
          </div>
          <div>
            <h4>For Suppliers</h4>
            <ul>
              <li>
                <Link href="/auth/supplier-register">Become a Supplier</Link>
              </li>
              <li>
                <Link href="/auth/login">Supplier Login</Link>
              </li>
            </ul>
          </div>
        </div>
        <hr className="footer-divider" />
        <div className="copyright">© 2026 DOVA. All Rights Reserved.</div>
      </footer>
    </>
  );
}
