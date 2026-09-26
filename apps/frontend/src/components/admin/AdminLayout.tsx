import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, type ReactNode } from 'react';
import {
  Activity,
  BarChart3,
  Bell,
  LayoutDashboard,
  Mail,
  MessageSquare,
  Package,
  PackagePlus,
  ScrollText,
  Search,
  Settings,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
  Warehouse,
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { inter, dmSans } from '../../lib/fonts';

const NAV_ITEMS: Array<{ href: string; label: string; icon: typeof LayoutDashboard }> = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/suppliers', label: 'Suppliers', icon: Store },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/bundles', label: 'Bundles', icon: PackagePlus },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/admin/logistics', label: 'Logistics', icon: Truck },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/inventory', label: 'Inventory', icon: Warehouse },
  { href: '/admin/finance', label: 'Finance & Payouts', icon: Wallet },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/monitoring', label: 'System Monitoring', icon: Activity },
  { href: '/admin/contacts', label: 'Contacts', icon: Mail },
  { href: '/admin/feedback', label: 'Feedback', icon: MessageSquare },
  { href: '/admin/audit', label: 'Audit Logs', icon: ScrollText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

function isNavItemActive(pathname: string, href: string) {
  if (href === '/admin') return pathname === '/admin';
  return pathname === href || pathname.startsWith(`${href}/`);
}

function initials(fullName: string | undefined) {
  if (!fullName) return 'AD';
  const parts = fullName.trim().split(/\s+/);
  const chars = parts.length > 1 ? [parts[0][0], parts[parts.length - 1][0]] : [parts[0]?.[0] ?? 'A', parts[0]?.[1] ?? 'D'];
  return chars.join('').toUpperCase();
}

function AdminSidebar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <Sidebar collapsible="offcanvas" className="border-none">
      <SidebarHeader className="gap-3 border-b border-sidebar-border p-4">
        <Link href="/admin" className="flex items-center gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gold)] to-[var(--gold2)] text-lg font-black text-[var(--deep)]">
            D
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-[family-name:var(--font-heading)] text-sm font-black tracking-wide text-white">
              DOVA ADMIN
            </span>
            <span className="text-xs text-white/60">Dashboard Management</span>
          </span>
        </Link>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
        >
          <Link href="/">Storefront</Link>
        </Button>
      </SidebarHeader>
      <SidebarContent className="px-2 py-3">
        <div className="px-2.5 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#b9cec5]">
          Management
        </div>
        <SidebarMenu className="gap-[5px]">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => (
            <SidebarMenuItem key={href}>
              <SidebarMenuButton
                asChild
                isActive={isNavItemActive(router.pathname, href)}
                className="h-auto gap-3 rounded-[13px] px-3 py-3 text-[13px] font-bold text-[#edf6f2] data-active:bg-gradient-to-r data-active:from-[var(--gold)] data-active:to-[#e4c65c] data-active:font-bold data-active:text-[var(--deep)] data-active:shadow-[0_9px_24px_rgba(0,0,0,0.13)]"
              >
                <Link href={href}>
                  <Icon />
                  <span>{label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4 text-white">
        <p className="text-sm font-bold">{user?.fullName ?? 'Administrator'}</p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="mt-2 w-full border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          onClick={() => void logout().then(() => router.push('/'))}
        >
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

function AdminTopbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  return (
    <header className="sticky top-0 z-10 flex h-[76px] items-center justify-between gap-4 border-b border-border bg-background/95 px-4 backdrop-blur md:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <SidebarTrigger className="md:hidden" />
        <div className="min-w-0">
          <h1 className="truncate text-lg font-black tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="truncate text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Notifications"
          onClick={() => showToast('Notifications are not wired up yet.', 'info')}
        >
          <Bell />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Search"
          onClick={() => showToast('Global search is not wired up yet.', 'info')}
        >
          <Search />
        </Button>
        <Link href="/admin/settings" aria-label="Admin settings">
          <Avatar className="size-9 cursor-pointer">
            <AvatarFallback className="bg-primary text-xs font-bold text-primary-foreground">
              {initials(user?.fullName)}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  );
}

export function AdminLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  // Radix portals (Select, Sheet) mount on <body>, outside this wrapper, so they need the theme tokens there too.
  useEffect(() => {
    document.body.classList.add('admin-app');
    return () => document.body.classList.remove('admin-app');
  }, []);

  return (
    <SidebarProvider className={`admin-app ${inter.variable} ${dmSans.variable}`}>
      <AdminSidebar />
      <SidebarInset>
        <AdminTopbar title={title} subtitle={subtitle} />
        <main className="mx-auto w-full max-w-[1550px] flex-1 px-4 py-6 md:px-8 md:py-8">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
