import { Link } from 'react-router-dom';
import { PortalUIProvider, Toast, usePortalUI } from '../components/PortalUI';
import type { ReactNode } from 'react';

const navItems = [["/logistics", "▥", "Dashboard"], ["/logistics/available", "⌁", "Available Jobs"], ["/logistics/active", "➤", "Active Delivery"], ["/logistics/history", "◷", "Delivery History"], ["/logistics/earnings", "₦", "Earnings"], ["/logistics/notifications", "♧", "Notifications"], ["/logistics/profile", "♟", "My Profile"], ["/logistics/support", "?", "Support"]];

function LogisticsSidebar({ activePath }: { activePath: string }) {
  const { showToast, menuOpen } = usePortalUI();
  return (
    <aside className={`sidebar${menuOpen ? " open" : ""}`} id="sidebar">
      <Link className="brand" to="/logistics">
        <span className="brand-mark">D</span>
        <span><span className="brand-title">DOVA LOGISTICS</span><span className="brand-sub">Delivery Partner Portal</span></span>
      </Link>
      <div className="driver-box">
        <div className="driver-row"><div className="avatar">DR</div><div><div className="driver-name">Delivery Partner —</div><div className="driver-meta">Partner ID: —</div></div></div>
        <div className="online"><i></i>Availability status is backend-controlled</div>
      </div>
      <div className="nav-label">Delivery Operations</div>
      <nav className="nav">
        {navItems.map(([path, icon, label]) => (
          <Link key={path} className={activePath === path ? 'active' : ''} to={path}>
            <span className="nav-icon">{icon}</span>{label}
          </Link>
        ))}
      </nav>
      <div className="side-bottom">
        <Link to="/logistics/profile">⚙ Account Settings</Link>
        <button type="button" onClick={() => showToast('Logout will connect to DOVA authentication.')}>↪ Log Out</button>
      </div>
    </aside>
  );
}

function LogisticsTopbar({ title, subtitle }: { title: string; subtitle: string }) {
  const { toggleMenu, showToast } = usePortalUI();
  return (
    <header className="topbar">
      <div className="top-left">
        <button className="mobile-menu" type="button" onClick={toggleMenu}>☰</button>
        <div><div className="top-title">{title}</div><div className="top-sub">{subtitle}</div></div>
      </div>
      <div className="top-actions">
        <button aria-label="Notifications" className="icon" type="button" onClick={() => showToast('Notifications will sync with DOVA.')}>♧</button>
        <button aria-label="Search" className="icon" type="button" onClick={() => showToast('Delivery search will connect to assigned jobs.')}>⌕</button>
        <Link className="avatar-top" to="/logistics/profile">DR</Link>
      </div>
    </header>
  );
}

export default function LogisticsLayout({ children, activePath, title, subtitle }: {
  children: ReactNode; activePath: string; title: string; subtitle: string;
}) {
  return (
    <PortalUIProvider>
      <div className="logistics-app">
        <div className="app">
          <LogisticsSidebar activePath={activePath} />
          <main className="main">
            <LogisticsTopbar title={title} subtitle={subtitle} />
            <div className="content">{children}</div>
          </main>
        </div>
        <Toast />
      </div>
    </PortalUIProvider>
  );
}
