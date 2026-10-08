import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export type AdminNavItem = { id: string; glyph: string; label: string };

export function AdminLayout({
  items,
  active,
  onSelect,
  title,
  subtitle,
  children,
}: {
  items: AdminNavItem[];
  active: string;
  onSelect: (id: string) => void;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = `${title} — DOVA Admin`;
  }, [title]);

  useEffect(() => {
    setMenuOpen(false);
  }, [active]);

  return (
    <div className="admin-app">
      <div className="app">
        <aside className={`sidebar${menuOpen ? ' open' : ''}`} id="sidebar">
          <Link className="brand" href="/admin">
            <span className="brand-mark">D</span>
            <span>
              <span className="brand-title">DOVA ADMIN</span>
              <span className="brand-sub">Dashboard Management</span>
            </span>
          </Link>
          <div className="sidebar-actions">
            <Link href="/marketplace">▥ Storefront</Link>
            <button
              type="button"
              onClick={() => {
                void logout();
                showToast('Logged out.', 'success');
              }}
            >
              {user?.fullName ? `↪ Logout ${user.fullName.split(' ')[0]}` : '↪ Logout'}
            </button>
          </div>
          <div className="nav-label">Management</div>
          <nav className="nav">
            {items.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={active === item.id ? 'active' : ''}
                onClick={(e) => { e.preventDefault(); onSelect(item.id); }}
              >
                <span className="nav-icon">{item.glyph}</span>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="sidebar-foot">
            <strong>Administrator</strong>
            <span>Role-based access, authentication and permissions supplied by the backend.</span>
          </div>
        </aside>
        <main className="main">
          <header className="topbar">
            <div className="top-left">
              <button className="mobile-menu" type="button" onClick={() => setMenuOpen((o) => !o)}>
                ☰
              </button>
              <div>
                <div className="top-title">{title}</div>
                <div className="top-sub">{subtitle}</div>
              </div>
            </div>
            <div className="top-actions">
              <button className="icon" type="button" onClick={() => showToast('Notifications coming soon.', 'info')}>
                ♧
              </button>
              <button className="icon" type="button" onClick={() => showToast('Global search coming soon.', 'info')}>
                ⌕
              </button>
              <span className="admin-avatar">AD</span>
            </div>
          </header>
          <div className="content">{children}</div>
        </main>
      </div>
    </div>
  );
}