import Link from 'next/link';
import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FeedlogLink } from './FeedlogLink';
import { isFeedlogEnabled } from '../lib/feedlog';

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
  const [routeLoading, setRouteLoading] = useState(false);
  const feedlogEnabled = isFeedlogEnabled();
  const dash =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/supplier' : '/customer';
  // Admin and supplier accounts don't shop — showing Cart to them leads to a confusing
  // "please log in" message at checkout (the /cart API 403s for non-customer roles).
  const canShop = !user || user.role === 'customer';

  useEffect(() => {
    const close = () => setMenuOpen(false);
    const start = () => {
      close();
      setRouteLoading(true);
    };
    const end = () => setRouteLoading(false);
    router.events.on('routeChangeStart', start);
    router.events.on('routeChangeComplete', end);
    router.events.on('routeChangeError', end);
    return () => {
      router.events.off('routeChangeStart', start);
      router.events.off('routeChangeComplete', end);
      router.events.off('routeChangeError', end);
    };
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
      {feedlogEnabled ? (
        <FeedlogLink isLoggedIn={Boolean(user)} onClick={() => setMenuOpen(false)} />
      ) : null}
      {canShop && (
        <Link href="/cart" onClick={() => setMenuOpen(false)} className="nav-cart">
          Cart{count > 0 && <sup className="cart-count">{count}</sup>}
        </Link>
      )}
      {user ? (
        <span className="header-auth">
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
        </span>
      ) : (
        <span className="header-auth">
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
        </span>
      )}
    </>
  );

  return (
    <>
      {routeLoading ? <div className="route-progress" aria-hidden="true" /> : null}
      <header className="header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <img src="/images/logo.jpg" alt="DOVA" />
            DOVA
          </Link>
          <nav className="nav-desktop">{navLinks}</nav>
        </div>

        <div className="header-actions">
          {canShop && (
            <Link href="/cart" className="header-cart-btn" aria-label="Cart">
              🛒{count > 0 && <sup className="cart-count">{count}</sup>}
            </Link>
          )}
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
              {feedlogEnabled ? (
                <li>
                  <FeedlogLink isLoggedIn={Boolean(user)}>Feedback &amp; Roadmap</FeedlogLink>
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <h4>Contact</h4>
            <ul>
              <li>support@dova.com</li>
              <li><a href="tel:+2349032696825">+234 903 269 6825</a></li>
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
