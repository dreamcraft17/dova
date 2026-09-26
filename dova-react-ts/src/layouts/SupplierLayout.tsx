import { Link } from 'react-router-dom';
import { PortalUIProvider, Toast, usePortalUI } from '../components/PortalUI';
import type { ReactNode } from 'react';

const navItems = [["/supplier", "⌂", "Dashboard"], ["/supplier/products", "◇", "Products"], ["/supplier/add-product", "＋", "Add Product"], ["/supplier/orders", "🛒", "Orders"], ["/supplier/sales", "▥", "Sales & Analytics"], ["/supplier/profile", "●", "Profile"], ["/supplier/feedback", "✉", "Feedback"], ["/supplier/settings", "⚙", "Settings"]];

function SupplierSidebar({ activePath }: { activePath: string }) {
  const { showToast, menuOpen } = usePortalUI();
  return (
    <aside className={`sidebar${menuOpen ? " open" : ""}`} id="sidebar">
      <Link className="brand" to="/supplier">
        <span className="brand-mark">D</span>
        <span>DOVA SUPPLIER<small>Farmer &amp; Supplier Portal</small></span>
      </Link>
      <nav className="nav">
        {navItems.map(([path, icon, label]) => (
          <Link key={path} className={activePath === path ? 'active' : ''} to={path}>
            <span className="nav-icon">{icon}</span>{label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="user-mini"><strong>Demo Supplier</strong><span>Green Valley · Supplier ID: SUP-001</span></div>
        <button className="logout" type="button" onClick={() => showToast('Connect this action to your authentication/logout endpoint.')}>↪&nbsp; Log Out</button>
      </div>
    </aside>
  );
}

function SupplierTopbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { toggleMenu, showToast } = usePortalUI();
  return (
    <header className="topbar">
      <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
        <button aria-label="Open menu" className="icon-btn mobile-menu" type="button" onClick={toggleMenu}>☰</button>
        <div><div className="top-title">{title}</div><div className="top-sub">{subtitle}</div></div>
      </div>
      <div className="top-actions">
        <button className="icon-btn" type="button" onClick={() => showToast('Notifications will connect to the backend.')}>♧</button>
        <Link className="avatar" to="/supplier/profile">DS</Link>
      </div>
    </header>
  );
}

export default function SupplierLayout({ children, activePath, title, subtitle }: {
  children: ReactNode; activePath: string; title: string; subtitle: string;
}) {
  return (
    <PortalUIProvider>
      <div className="supplier-app">
        <div className="app">
          <SupplierSidebar activePath={activePath} />
          <main className="main">
            <SupplierTopbar title={title} subtitle={subtitle} />
            <div className="content">{children}</div>
          </main>
        </div>
        <Toast />
      </div>
    </PortalUIProvider>
  );
}
