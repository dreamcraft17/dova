import { ReactNode, useEffect } from 'react';
import Link from 'next/link';

const NAV_LINKS: readonly { label: string; href: string; external?: true }[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/marketplace' },
  { label: 'Bundles', href: '/bundles' },
  { label: 'About', href: 'https://dova.dntech.id/about', external: true },
  { label: 'Contact', href: '/contact' },
  { label: 'Feedback', href: '/feedback' },
];

export function ChainChrome({ title, children }: { title: string; children: ReactNode }) {
  useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <div className="storefront-app">
      <div className="top">
        <div className="container">
          <span>DOVA CHAIN · FOOD SUPPLY CHAIN</span>
          <span>Nigeria · Starting with Plantain Flour</span>
        </div>
      </div>
      <header className="nav">
        <div className="container navin">
          <Link className="logo" href="/">
            DOVA<i>CHAIN</i>
          </Link>
          <nav className="links" aria-label="Storefront navigation">
            {NAV_LINKS.map((link) =>
              link.external ? (
                <a key={link.href} href={link.href}>
                  {link.label}
                </a>
              ) : (
                <Link key={link.href} href={link.href}>
                  {link.label}
                </Link>
              ),
            )}
          </nav>
          <div className="actions">
            <Link className="icon" href="/marketplace" aria-label="Search">
              ⌕
            </Link>
            <Link className="icon" href="/cart" aria-label="Cart">
              🛒
            </Link>
            <Link className="btn gold" href="/marketplace">
              Shop
            </Link>
          </div>
        </div>
      </header>
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
              <a href="https://dova.dntech.id/about">About Us</a>
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