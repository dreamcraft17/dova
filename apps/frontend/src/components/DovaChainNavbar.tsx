'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Search, ShoppingCart, User, LogOut } from 'lucide-react';
import { plusJakartaSans, manrope } from '../lib/fonts';

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
      className={`${plusJakartaSans.variable} ${manrope.variable} sticky top-0 z-[1000] w-full bg-white/96 border-b border-[rgba(7,95,59,0.12)] backdrop-blur-[16px] -webkit-backdrop-filter backdrop-blur-[16px]`}
    >
      <div className="mx-auto w-[min(1280px,calc(100%-40px))]">
        {/* Desktop Layout */}
        <div className="hidden md:flex h-[82px] items-center gap-8">
          {/* Brand / Logo */}
          <Link
            href={brandHref}
            className="inline-flex items-center gap-3 flex-shrink-0 text-[#123226]! no-underline"
            aria-label="DOVA Chain home"
          >
            <div className="w-[52px] h-[52px] flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt="DOVA Chain logo"
                className="w-full h-full object-contain object-center scale-102"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col justify-center leading-[0.95]">
              <strong className="font-[family-name:var(--font-plus-jakarta-sans)] text-[24px] font-black tracking-[-0.045em] text-[#075f3b]">
                DOVA
              </strong>
              <span className="mt-[5px] font-[family-name:var(--font-manrope)] text-[9px] font-black tracking-[0.32em] text-[#d6a63a]">
                CHAIN
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="flex items-center justify-center gap-[26px] ml-auto">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-0 py-[30px] text-[13px] font-black font-[family-name:var(--font-manrope)] whitespace-nowrap no-underline transition-colors duration-180 ${
                  isActive(item) ? 'text-[#075f3b]!' : 'text-[#33443b]! hover:text-[#075f3b]'
                }`}
              >
                {item.label}
                <span
                  className={`absolute left-0 right-0 bottom-[22px] h-[2px] bg-[#075f3b] transition-transform duration-180 origin-center ${
                    isActive(item) ? 'scale-x-100' : 'scale-x-0 hover:scale-x-100'
                  }`}
                />
              </Link>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              className="w-[38px] h-[38px] flex items-center justify-center text-[#075f3b]! no-underline text-[19px] font-black transition-all duration-180 hover:translate-y-[-1px] hover:bg-[rgba(7,95,59,0.06)]"
              href="/marketplace"
              aria-label="Search products"
              title="Search products"
            >
              <Search size={19} />
            </Link>

            {canShop ? (
              <Link
                className="relative w-[38px] h-[38px] flex items-center justify-center text-[#075f3b]! no-underline text-[19px] font-black transition-all duration-180 hover:translate-y-[-1px] hover:bg-[rgba(7,95,59,0.06)]"
                href="/cart"
                aria-label="Open cart"
                title="Open cart"
              >
                <ShoppingCart size={19} />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#d6a63a] px-[3px] font-[family-name:var(--font-manrope)] text-[9px] font-black text-[#123226]">
                    {cartCount}
                  </span>
                )}
              </Link>
            ) : null}

            {user ? (
              <>
                <Link
                  href={dashboardHref}
                  className="flex max-w-[140px] items-center gap-1.5 text-[#075f3b]! no-underline transition-all duration-180 hover:translate-y-[-1px]"
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
                  className="flex h-[38px] w-[38px] flex-shrink-0 items-center justify-center border-0 bg-transparent text-[#075f3b] transition-all duration-180 hover:translate-y-[-1px] hover:bg-[rgba(7,95,59,0.06)]"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="font-[family-name:var(--font-manrope)] text-[12px] font-black text-[#075f3b]! no-underline transition-colors duration-180 hover:text-[#034a2e]"
              >
                Login
              </Link>
            )}

            <Link
              className="min-h-[44px] px-[20px] inline-flex items-center justify-center bg-[#075f3b] text-[#d6a63a]! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black tracking-[0.01em] border-0 rounded-full transition-all duration-180 hover:bg-[#034a2e] hover:translate-y-[-1px]"
              href={canShop ? shopHref : dashboardHref}
            >
              {canShop ? 'Shop DOVA' : 'Dashboard'}
            </Link>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden flex h-[72px] items-center gap-4 px-2">
          <Link
            href={brandHref}
            className="inline-flex items-center gap-2 flex-shrink-0 text-[#123226]! no-underline"
            onClick={closeMobile}
          >
            <div className="w-[46px] h-[46px] flex-shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src={logoSrc}
                alt="DOVA Chain logo"
                className="w-full h-full object-contain object-center"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
            <div className="flex flex-col justify-center leading-[0.95]">
              <strong className="font-[family-name:var(--font-plus-jakarta-sans)] text-[21px] font-black tracking-[-0.045em] text-[#075f3b]">
                DOVA
              </strong>
              <span className="mt-1 font-[family-name:var(--font-manrope)] text-[8px] font-black tracking-[0.32em] text-[#7a857f]">
                CHAIN
              </span>
            </div>
          </Link>

          <div className="ml-auto flex items-center gap-2">
            {canShop && cartCount > 0 ? (
              <Link
                href="/cart"
                aria-label="Open cart"
                className="relative flex h-[42px] w-[42px] items-center justify-center text-[#075f3b]!"
                onClick={closeMobile}
              >
                <ShoppingCart size={20} />
                <span className="absolute top-1 right-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-[#d6a63a] px-[3px] font-[family-name:var(--font-manrope)] text-[9px] font-black text-[#123226]">
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
                className={`block w-full h-[2px] bg-[#075f3b] transition-all duration-180 ${
                  mobileOpen ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`block w-full h-[2px] bg-[#075f3b] transition-all duration-180 ${
                  mobileOpen ? 'opacity-0' : ''
                }`}
              />
              <span
                className={`block w-full h-[2px] bg-[#075f3b] transition-all duration-180 ${
                  mobileOpen ? '-translate-y-[7px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="md:hidden flex flex-col gap-0 py-2 px-2 border-t border-[rgba(7,95,59,0.12)]">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="px-0.5 py-[14px] text-[#123226]! no-underline font-[family-name:var(--font-manrope)] text-[14px] font-black border-b border-[rgba(7,95,59,0.08)] transition-colors duration-180 hover:text-[#075f3b]"
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
                    className="flex-1 min-h-[44px] inline-flex items-center justify-center gap-2 border border-[rgba(7,95,59,0.18)] text-[#075f3b]! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black transition-colors duration-180 hover:bg-[rgba(7,95,59,0.06)]"
                    onClick={closeMobile}
                  >
                    <User size={15} />
                    <span className="truncate">{user.fullName}</span>
                  </Link>
                  <button
                    type="button"
                    aria-label="Logout"
                    onClick={handleLogout}
                    className="min-h-[44px] w-[44px] flex-shrink-0 inline-flex items-center justify-center border border-[rgba(7,95,59,0.18)] text-[#075f3b] transition-colors duration-180 hover:bg-[rgba(7,95,59,0.06)]"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <Link
                  className="min-h-[44px] inline-flex items-center justify-center border border-[rgba(7,95,59,0.18)] text-[#075f3b]! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black transition-colors duration-180 hover:bg-[rgba(7,95,59,0.06)]"
                  href="/auth/login"
                  onClick={closeMobile}
                >
                  Login
                </Link>
              )}
              <Link
                className="min-h-[44px] inline-flex items-center justify-center bg-[#075f3b] text-[#d6a63a]! no-underline font-[family-name:var(--font-manrope)] text-[12px] font-black tracking-[0.01em] border-0 rounded-full transition-all duration-180 hover:bg-[#034a2e] hover:translate-y-[-1px]"
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
