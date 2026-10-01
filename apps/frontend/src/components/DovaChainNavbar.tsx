'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { manrope, fraunces } from '../lib/fonts';

type NavItem = {
  label: string;
  href: string;
  // Extra path prefixes that should also light up this link, e.g. a
  // "Products" link pointing at /marketplace that should stay active on
  // /products/[id] detail pages too.
  matchPrefixes?: string[];
};

type NavUser = {
  fullName: string;
};

type DovaChainNavbarProps = {
  logoSrc?: string;
  brandHref?: string;
  navItems?: NavItem[];
  shopHref?: string;
  user?: NavUser | null;
  cartCount?: number;
  canShop?: boolean;
  dashboardHref?: string;
  onLogout?: () => void;
};

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { label: 'How It Works', href: '#how' },
  { label: 'Products', href: '/marketplace' },
  { label: 'Bundles', href: '/bundles' },
  { label: 'Farmers', href: '#farmers' },
  { label: 'DOVA AI', href: '#ai' },
  { label: 'About', href: '#about' },
];

export default function DovaChainNavbar({
  logoSrc = '/images/logo.svg',
  brandHref = '/',
  navItems = DEFAULT_NAV_ITEMS,
  shopHref = '/marketplace',
  user = null,
  cartCount = 0,
  canShop = true,
  dashboardHref = '/customer/profile',
  onLogout,
}: DovaChainNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  const isActive = (item: NavItem) => {
    if (item.href.startsWith('#')) return false;
    const paths = [item.href, ...(item.matchPrefixes ?? [])];
    return paths.some((href) => router.asPath === href || router.asPath.startsWith(href + '/'));
  };

  const closeMobile = () => setMobileOpen(false);

  const handleLogout = () => {
    closeMobile();
    onLogout?.();
  };

  return (
    <header
      className={`${fraunces.variable} ${manrope.variable} sticky top-0 z-[1000] w-full bg-[#031f17] border-b border-white/10`}
    >
      <div className="mx-auto w-[min(1280px,calc(100%-40px))]">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-[72px] items-center gap-[22px]">
          {/* Brand / Logo */}
          <Link
            href={brandHref}
            className="inline-flex items-center gap-[7px] flex-shrink-0 text-white! no-underline tracking-[0.08em]"
            aria-label="DOVA Chain home"
          >
            <div className="w-[58px] h-[58px] flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt="DOVA Chain logo"
                className="w-full h-full object-contain object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="font-[family-name:var(--font-fraunces)] text-[1.22rem] font-extrabold tracking-[-0.025em] text-white">
              DOVA
            </span>
            <span className="font-[family-name:var(--font-manrope)] text-[0.68rem] font-black tracking-[0.2em] text-[#f0d878]">
              CHAIN
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center justify-center gap-[26px] ml-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-0 py-[30px] text-[13px] font-black font-[family-name:var(--font-manrope)] whitespace-nowrap no-underline transition-colors duration-180 ${
                  isActive(item) ? 'text-[#f0d878]!' : 'text-white/76! hover:text-[#f0d878]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-[22px] h-[2px] bg-[#d4af37] transition-transform duration-180 origin-center ${
                    isActive(item) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              className="w-[38px] h-[38px] flex items-center justify-center rounded-full border border-white/25 text-white! no-underline text-[19px] font-black transition-all duration-180 hover:translate-y-[-1px] hover:bg-white/10"
              href="/marketplace"
              aria-label="Search products"
              title="Search products"
            >
              <Search size={17} />
            </Link>

            {canShop ? (
              <Link
                className="relative w-[38px] h-[38px] flex items-center justify-center text-white! no-underline text-[19px] font-black transition-all duration-180 hover:translate-y-[-1px] hover:bg-white/10"
                href="/cart"
                aria-label="Open cart"
                title="Open cart"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#d4af37] px-[3px] font-[family-name:var(--font-manrope)] text-[9px] font-black text-[#031f17]">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : null}

            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex max-w-[140px] items-center gap-1.5 text-white! no-underline transition-all duration-180 hover:translate-y-[-1px]"
                  title={user.fullName}
                >
                  <User size={18} className="flex-shrink-0" />
                  <span className="truncate font-[family-name:var(--font-manrope)] text-[12px] font-black">
                    {user.fullName}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={onLogout}
                  aria-label="Logout"
                  title="Logout"
                  className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center border-0 bg-transparent text-white transition-all duration-180 hover:translate-y-[-1px] hover:bg-white/10"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="font-[family-name:var(--font-manrope)] text-[12px] font-black text-white! no-underline transition-colors duration-180 hover:text-[#f0d878]!"
              >
                Login
              </Link>
            )}

            <Link
              className="min-h-[44px] px-[20px] inline-flex items-center justify-center bg-[#d4af37] text-[#031f17]! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black tracking-[0.01em] border-0 rounded-full transition-all duration-180 hover:bg-[#f0d878] hover:translate-y-[-1px]"
              href={canShop ? shopHref : dashboardHref}
            >
              {canShop ? 'Shop DOVA' : 'Dashboard'}
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex h-[66px] items-center gap-4 px-2">
          <Link
            href={brandHref}
            className="inline-flex items-center gap-[7px] flex-shrink-0 text-white! no-underline tracking-[0.08em]"
            onClick={closeMobile}
          >
            <div className="w-[48px] h-[48px] flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt="DOVA Chain logo"
                className="w-full h-full object-contain object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <span className="font-[family-name:var(--font-fraunces)] text-[1.05rem] font-extrabold tracking-[-0.025em] text-white">
              DOVA
            </span>
            <span className="font-[family-name:var(--font-manrope)] text-[0.6rem] font-black tracking-[0.2em] text-[#f0d878]">
              CHAIN
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {canShop && cartCount > 0 ? (
              <Link
                href="/cart"
                aria-label="Open cart"
                className="relative flex h-[42px] w-[42px] items-center justify-center text-white!"
                onClick={closeMobile}
              >
                <ShoppingCart size={20} />
                <span className="absolute top-1 right-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#d4af37] px-[3px] font-[family-name:var(--font-manrope)] text-[9px] font-black text-[#031f17]">
                  {cartCount}
                </span>
              </Link>
            ) : null}
            <button
              type="button"
              className={`w-[42px] h-[42px] p-[9px] border-0 bg-transparent cursor-pointer flex flex-col justify-center items-center gap-[5px] transition-all duration-180 ${
                mobileOpen ? 'gap-0' : ''
              }`}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <span
                className={`block w-full h-[2px] bg-white transition-all duration-180 ${
                  mobileOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-full h-[2px] bg-white transition-all duration-180 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-full h-[2px] bg-white transition-all duration-180 ${
                  mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-0 py-2 px-2 border-t border-white/10">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-0.5 py-[14px] text-white/82! no-underline font-[family-name:var(--font-manrope)] text-[14px] font-black border-b border-white/10 transition-colors duration-180 hover:text-[#f0d878]!"
                onClick={closeMobile}
              >
                {item.label}
              </Link>
            ))}

            <div className="flex flex-col gap-[10px] pt-[14px]">
              {user ? (
                <div className="flex gap-[10px]">
                  <Link
                    href={dashboardHref}
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 border border-white/25 text-white! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black transition-colors duration-180 hover:bg-white/10"
                    onClick={closeMobile}
                  >
                    <User size={15} />
                    <span className="truncate">{user.fullName}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Logout"
                    onClick={handleLogout}
                    className="min-h-[44px] w-[44px] flex-shrink-0 inline-flex items-center justify-center border border-white/25 text-white transition-colors duration-180 hover:bg-white/10"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  className="min-h-[44px] inline-flex items-center justify-center border border-white/25 text-white! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black transition-colors duration-180 hover:bg-white/10"
                  href="/auth/login"
                  onClick={closeMobile}
                >
                  Login
                </Link>
              )}
              <Link
                className="min-h-[44px] inline-flex items-center justify-center bg-[#d4af37] text-[#031f17]! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black tracking-[0.01em] border-0 rounded-full transition-all duration-180 hover:bg-[#f0d878] hover:translate-y-[-1px]"
                href={canShop ? shopHref : dashboardHref}
                onClick={closeMobile}
              >
                {canShop ? 'Shop DOVA' : 'Dashboard'}
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
