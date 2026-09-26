import { Link } from 'react-router-dom';
import { useState } from 'react';

export function HomeHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <header className="site-header">
      <div className="container nav">
        <Link aria-label="DOVA Chain home" className="brand" to="/">
          <span className="dova">DOVA</span>
          <span className="chain">CHAIN</span>
        </Link>
        <nav aria-label="Primary navigation" className="nav-links">
          <Link to="#how">How It Works</Link>
          <Link to="/marketplace">Products</Link>
          <Link to="/bundles">Bundles</Link>
          <Link to="#farmers">Farmers</Link>
          <Link to="#ai">DOVA AI</Link>
          <Link to="#about">About</Link>
        </nav>
        <div className="nav-actions">
          <Link aria-label="Search products" className="search-link" to="/marketplace" title="Search products">⌕</Link>
          <Link aria-label="Open cart" className="cart-link" to="/cart">🛒</Link>
          <Link className="btn gold" to="/marketplace">Shop DOVA</Link>
        </div>
        <button
          aria-controls="mobileMenu"
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className="menu-btn"
          type="button"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? '×' : '☰'}
        </button>
      </div>
      <div aria-label="Mobile navigation" className={`mobile-menu${open ? ' open' : ''}`} id="mobileMenu">
        <Link onClick={close} to="#how">How It Works</Link>
        <Link onClick={close} to="/marketplace">Products</Link>
        <Link onClick={close} to="/bundles">Bundles</Link>
        <Link onClick={close} to="#farmers">Farmers</Link>
        <Link onClick={close} to="#ai">DOVA AI</Link>
        <Link onClick={close} to="#roadmap">Roadmap</Link>
        <div className="mobile-actions">
          <Link onClick={close} className="btn ghost" to="/login">Login</Link>
          <Link onClick={close} className="btn gold" to="/marketplace">Shop DOVA</Link>
        </div>
      </div>
    </header>
  );
}
