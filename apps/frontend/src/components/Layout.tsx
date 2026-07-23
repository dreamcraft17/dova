import Link from 'next/link';
import { ReactNode } from 'react';
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
  const dash =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/supplier' : '/customer';

  if (chrome === 'none') return <>{children}</>;

  return (
    <>
      <header className="header">
        <Link href="/" className="brand">
          <img src="/images/logo.jpg" alt="DOVA" />
          DOVA
        </Link>
        <nav>
          <Link href="/" className="nav-hide">
            Home
          </Link>
          <Link href="/products">Products</Link>
          <Link href="/about" className="nav-hide">
            About Us
          </Link>
          <Link href="/contact" className="nav-hide">
            Contact Us
          </Link>
          <Link href="/cart">
            Cart{count > 0 && <sup className="cart-count">{count}</sup>}
          </Link>
          {user ? (
            <span className="header-auth">
              <Link href={dash}>{user.fullName}</Link>
              <button className="button small" onClick={() => void logout()}>
                Logout
              </button>
            </span>
          ) : (
            <span className="header-auth">
              <Link href="/auth/login" className="nav-hide">
                Login
              </Link>
              <Link href="/auth/register" className="button small">
                Register
              </Link>
            </span>
          )}
        </nav>
      </header>

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
