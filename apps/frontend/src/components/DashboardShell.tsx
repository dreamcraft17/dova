import Link from 'next/link';
import { ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';

export type DashItem = { id: string; label: string };

export function DashboardShell({
  title,
  items,
  active,
  onSelect,
  children,
}: {
  title: string;
  items: DashItem[];
  active: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const { logout } = useAuth();

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <h2>{title}</h2>
        <ul>
          {items.map((item) => (
            <li key={item.id} className={active === item.id ? 'active' : undefined}>
              <button type="button" onClick={() => onSelect(item.id)}>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
        <div className="sidebar-foot">
          <ul>
            <li>
              <Link href="/">Storefront</Link>
            </li>
            <li>
              <button type="button" onClick={() => void logout()}>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  );
}
