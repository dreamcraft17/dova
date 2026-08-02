import Link from 'next/link';
import { ReactNode, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { FeedlogLink } from './FeedlogLink';
import { IconLogout, IconMail, IconMenu, IconShop, IconUser } from './DashboardIcons';
import { isFeedlogEnabled } from '../lib/feedlog';

export type DashItem = { id: string; label: string; icon?: ReactNode };

export function DashboardShell({
  variant,
  title,
  subtitle,
  items,
  active,
  onSelect,
  children,
}: {
  variant: 'admin' | 'supplier';
  title: string;
  subtitle?: string;
  items: DashItem[];
  active: string;
  onSelect: (id: string) => void;
  children: ReactNode;
}) {
  const { logout, user } = useAuth();
  const [navOpen, setNavOpen] = useState(false);
  const feedlogEnabled = isFeedlogEnabled();

  const select = (id: string) => {
    onSelect(id);
    setNavOpen(false);
  };

  if (variant === 'admin') {
    return (
      <div className="admin-dash">
        <header className="admin-dash-header">
          <div className="admin-dash-top-bar">
            <div className="admin-dash-logo">
              <button
                type="button"
                className="admin-dash-menu-toggle"
                aria-label="Toggle menu"
                aria-expanded={navOpen}
                onClick={() => setNavOpen((o) => !o)}
              >
                <IconMenu />
              </button>
              <div className="admin-dash-logo-text">
                <h2>{title}</h2>
                {subtitle && <p>{subtitle}</p>}
              </div>
            </div>

            <nav className={navOpen ? 'show' : undefined}>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={active === item.id ? 'active' : undefined}
                  onClick={() => select(item.id)}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="admin-dash-sub-menu">
              <Link href="/">
                <IconShop />
                Storefront
              </Link>
              {feedlogEnabled ? (
                <FeedlogLink isLoggedIn={Boolean(user)} className="admin-dash-feedlog-link">
                  <IconMail />
                  Feedback
                </FeedlogLink>
              ) : null}
              <button type="button" onClick={() => void logout()}>
                <IconLogout />
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="admin-dash-container">{children}</main>
      </div>
    );
  }

  return (
    <div className="supplier-dash">
      <nav className="supplier-dash-navbar">
        <div className="supplier-dash-nav-inner">
          <div className="supplier-dash-brand">
            <span>{title}</span>
            {subtitle && <small>{subtitle}</small>}
          </div>

          <button
            type="button"
            className="supplier-dash-toggler"
            aria-label="Toggle menu"
            aria-expanded={navOpen}
            onClick={() => setNavOpen((o) => !o)}
          >
            <IconMenu />
          </button>

          <div className={`supplier-dash-collapse${navOpen ? ' show' : ''}`}>
            <ul className="supplier-dash-nav">
              {items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={active === item.id ? 'active' : undefined}
                    onClick={() => select(item.id)}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                </li>
              ))}
              {feedlogEnabled ? (
                <li>
                  <FeedlogLink isLoggedIn={Boolean(user)} onClick={() => setNavOpen(false)}>
                    <IconMail />
                    Feedback
                  </FeedlogLink>
                </li>
              ) : null}
              <li className="supplier-dash-nav-profile">
                <button
                  type="button"
                  className={active === 'profile' ? 'active' : undefined}
                  onClick={() => select('profile')}
                >
                  <IconUser />
                  Profile
                </button>
              </li>
              <li>
                <button type="button" className="supplier-dash-logout" onClick={() => void logout()}>
                  <IconLogout />
                  Log Out
                </button>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <section className="supplier-dash-main">
        <div className="supplier-dash-container">{children}</div>
      </section>
    </div>
  );
}
