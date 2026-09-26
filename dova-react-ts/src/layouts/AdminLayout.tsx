import { Link } from 'react-router-dom';
import { PortalUIProvider, Toast, usePortalUI } from '../components/PortalUI';
import type { ReactNode } from 'react';

const navItems = [["/admin", "▥", "Dashboard"], ["/admin/suppliers", "▣", "Suppliers"], ["/admin/products", "◇", "Products"], ["/admin/bundles", "▤", "Bundles"], ["/admin/orders", "🛒", "Orders"], ["/admin/logistics", "⌁", "Logistics"], ["/admin/users", "♟", "Users"], ["/admin/inventory", "▦", "Inventory"], ["/admin/finance", "₦", "Finance & Payouts"], ["/admin/analytics", "◫", "Analytics"], ["/admin/monitoring", "◉", "System Monitoring"], ["/admin/contacts", "✉", "Contacts"], ["/admin/feedback", "✉", "Feedback"], ["/admin/audit", "☷", "Audit Logs"], ["/admin/settings", "⚙", "Settings"]];

function AdminSidebar({ activePath }: { activePath: string }) {
  const { showToast, menuOpen } = usePortalUI();
  return (
    <aside className={`sidebar${menuOpen ? " open" : ""}`} id="sidebar">
      <Link className="brand" to="/admin">
        <span className="brand-mark">D</span>
        <span><span className="brand-title">DOVA ADMIN</span><span className="brand-sub">Dashboard Management</span></span>
      </Link>
      <div className="sidebar-actions">
        <Link to="/">▥ Storefront</Link>
        <button type="button" onClick={() => showToast('Logout will connect to the backend authentication service.')}>↪ Logout</button>
      </div>
      <div className="nav-label">Management</div>
      <nav className="nav">
        {navItems.map(([path, icon, label]) => (
          <Link key={path} className={activePath === path ? 'active' : ''} to={path}>
            <span className="nav-icon">{icon}</span>{label}
          </Link>
        ))}
      </nav>
      <div className="sidebar-foot">
        <strong>Administrator</strong>
        <span>Role-based access, authentication and permissions should be supplied by the backend.</span>
      </div>
    </aside>
  );
}

function AdminTopbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { toggleMenu, showToast } = usePortalUI();
  return (
    <header className="topbar">
      <div className="top-left">
        <button className="mobile-menu" type="button" onClick={toggleMenu}>☰</button>
        <div><div className="top-title">{title}</div><div className="top-sub">{subtitle}</div></div>
      </div>
      <div className="top-actions">
        <button className="icon" type="button" onClick={() => showToast('Notifications will connect to the admin notification service.')}>♧</button>
        <button className="icon" type="button" onClick={() => showToast('Global search will connect to the backend.')}>⌕</button>
        <Link className="admin-avatar" to="/admin/settings">AD</Link>
      </div>
    </header>
  );
}

export default function AdminLayout({ children, activePath, title, subtitle }: {
  children: ReactNode; activePath: string; title: string; subtitle: string;
}) {
  return (
    <PortalUIProvider>
      <div className="admin-app">
        <div className="app">
          <AdminSidebar activePath={activePath} />
          <main className="main">
            <AdminTopbar title={title} subtitle={subtitle} />
            <div className="content">{children}</div>
          </main>
        </div>
        <Toast />
      </div>
    </PortalUIProvider>
  );
}
