import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, type ReactNode } from 'react';
import {
  BarChart3,
  Bell,
  Diamond,
  Home,
  LogOut,
  Mail,
  Plus,
  Settings,
  ShoppingCart,
  User,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { FeedlogLink } from '../FeedlogLink';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { SupplierInfo } from '../../hooks/supplier/useSupplierInfo';
import { inter, dmSans } from '../../lib/fonts';
import { initialsOf } from './ui';

type NavItem = { href: string; label: string; icon: typeof Home; feedback?: boolean };

const NAV_ITEMS: NavItem[] = [
  { href: '/supplier', label: 'Dashboard', icon: Home },
  { href: '/supplier/products', label: 'Products', icon: Diamond },
  { href: '/supplier/add-product', label: 'Add Product', icon: Plus },
  { href: '/supplier/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/supplier/sales', label: 'Sales & Analytics', icon: BarChart3 },
  { href: '/supplier/profile', label: 'Profile', icon: User },
  { href: '/feedback', label: 'Feedback', icon: Mail, feedback: true },
  { href: '/supplier/settings', label: 'Settings', icon: Settings },
];

const NAV_BUTTON_CLASS =
  'h-auto gap-3 rounded-[13px] px-3 py-3 text-xs font-bold text-white/60 hover:bg-gradient-to-br hover:from-[rgba(212,175,55,0.98)] hover:to-[rgba(240,216,120,0.88)] hover:text-[var(--near)] data-active:bg-gradient-to-br data-active:from-[rgba(212,175,55,0.98)] data-active:to-[rgba(240,216,120,0.88)] data-active:font-bold data-active:text-[var(--near)]';

function isNavItemActive(pathname: string, href: string) {
  if (href === '/supplier') return pathname === '/supplier';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SupplierSidebar({ supplierInfo }: { supplierInfo?: SupplierInfo }) {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" className="border-r border-[rgba(212,175,55,0.12)]">
      <SidebarHeader className="px-4 pb-6 pt-6">
        <Link href="/supplier" className="flex items-center gap-3 px-2">
          <span className="grid size-[38px] shrink-0 place-items-center rounded-[11px] bg-gradient-to-br from-[var(--gold)] to-[var(--gold3)] text-base font-black text-[var(--near)]">
            D
          </span>
          <span className="flex flex-col leading-tight">
            <span className="text-[15px] font-black tracking-[-0.03em] text-white">DOVA SUPPLIER</span>
            <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-white/45">
              Farmer &amp; Supplier Portal
            </span>
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarMenu className="gap-1.5">
          {NAV_ITEMS.map(({ href, label, icon: Icon, feedback }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={!feedback && isNavItemActive(router.pathname, href)}
                className={NAV_BUTTON_CLASS}
              >
                {feedback ? (
                  <FeedlogLink isLoggedIn>
                    <Icon />
                    <span>{label}</span>
                  </FeedlogLink>
                ) : (
                  <Link href={href}>
                    <Icon />
                    <span>{label}</span>
                  </Link>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-2 px-3 pb-5">
        <div className="rounded-[14px] border border-white/10 bg-white/5 p-3">
          <p className="truncate text-[12px] font-bold text-white">{supplierInfo?.businessName ?? 'Supplier'}</p>
          <p className="truncate text-[10px] text-white/45" title={supplierInfo?.id}>
            {user?.fullName ? `${user.fullName} · ` : ''}Supplier ID: {supplierInfo?.id.slice(0, 8).toUpperCase() ?? '—'}
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-[13px] bg-white/5 px-3 py-3 text-left text-[11px] font-bold text-white/70 hover:bg-white/10 hover:text-white"
          onClick={() => void logout().then(() => router.push('/'))}
        >
          <LogOut className="size-3.5" />
          Log Out
        </button>
      </SidebarFooter>
    </Sidebar>
  );
}

function SupplierTopbar({
  title,
  subtitle,
  supplierInfo,
}: {
  title: string;
  subtitle?: string;
  supplierInfo?: SupplierInfo;
}) {
  const { showToast } = useToast();

  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between gap-4 border-b border-border bg-white/90 px-4 backdrop-blur-md md:px-7">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div className="min-w-0">
          <p className="truncate text-sm font-black text-[var(--forest)]">{title}</p>
          {subtitle ? <p className="truncate text-[10px] text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          aria-label="Notifications"
          className="grid size-[38px] place-items-center rounded-[11px] border border-border bg-white text-[var(--forest)] hover:bg-[var(--cream)]"
          onClick={() => showToast('Notifications are not wired up yet.', 'info')}
        >
          <Bell className="size-4" />
        </button>
        <Link
          href="/supplier/profile"
          aria-label="Supplier profile"
          className="grid size-[38px] place-items-center rounded-full bg-[var(--forest)] text-[11px] font-black text-white"
        >
          {supplierInfo?.businessName ? initialsOf(supplierInfo.businessName) : 'SU'}
        </Link>
      </div>
    </header>
  );
}

export function SupplierLayout({
  title,
  subtitle,
  supplierInfo,
  children,
}: {
  title: string;
  subtitle?: string;
  supplierInfo?: SupplierInfo;
  children: ReactNode;
}) {
  // Radix portals (Select, Sheet) mount on <body>, outside this wrapper, so they need the theme tokens there too.
  useEffect(() => {
    document.body.classList.add('admin-app', 'supplier-app');
    return () => document.body.classList.remove('admin-app', 'supplier-app');
  }, []);

  return (
    <SidebarProvider className={`admin-app supplier-app ${inter.variable} ${dmSans.variable}`}>
      <SupplierSidebar supplierInfo={supplierInfo} />
      <SidebarInset className="bg-background">
        <SupplierTopbar title={title} subtitle={subtitle} supplierInfo={supplierInfo} />
        <main className="w-full flex-1 px-4 pb-14 pt-8 md:px-7">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
