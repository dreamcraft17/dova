import Link from 'next/link';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAdminDashboard, type AdminDashboardOrder } from '../../hooks/admin/useAdminDashboard';
import type { OrderStatus } from 'dova-shared';

const HEAD_BUTTON = 'h-10 rounded-[12px] px-4 text-[13px] font-black';
const TABLE_HEAD = 'text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground';

const ORDER_STATUS_TONE: Record<OrderStatus, 'green' | 'yellow' | 'blue' | 'red' | 'gray'> = {
  pending: 'yellow',
  paid: 'blue',
  processing: 'blue',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function useWeeklyOrderActivity(orders: AdminDashboardOrder[]) {
  return useMemo(() => {
    const days: { key: string; label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en-US', { weekday: 'short' }),
        count: 0,
      });
    }
    const byDay = new Map(days.map((d) => [d.key, d]));
    for (const order of orders) {
      const key = order.createdAt?.slice(0, 10);
      const bucket = key ? byDay.get(key) : undefined;
      if (bucket) bucket.count += 1;
    }
    return days;
  }, [orders]);
}

function DashboardContent() {
  const { stats, users, orders, feedbackPosts, loading, error, reload } = useAdminDashboard();
  const weeklyActivity = useWeeklyOrderActivity(orders);

  const grossSales = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0),
    [orders],
  );
  const ordersAwaitingFulfillment = useMemo(
    () => orders.filter((o) => o.status === 'pending' || o.status === 'paid' || o.status === 'processing').length,
    [orders],
  );
  const openFeedbackCount = useMemo(
    () => feedbackPosts.filter((p) => p.status === 'open').length,
    [feedbackPosts],
  );
  const recentOrders = orders.slice(0, 5);
  const recentUsers = users.slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">
            Platform Control Center
          </p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">
            Admin Dashboard
          </h1>
          <p className="mt-2 max-w-[60ch] text-muted-foreground">
            A single command center for suppliers, products, orders, and platform health.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild className={HEAD_BUTTON}>
            <Link href="/admin/orders">Review Orders</Link>
          </Button>
          <Button asChild variant="gold" className={HEAD_BUTTON}>
            <Link href="/admin/monitoring">System Health</Link>
          </Button>
        </div>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Retry
          </button>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
        {[
          { label: 'Suppliers', value: stats?.suppliers, note: 'Registered & verified' },
          { label: 'Products', value: stats?.products, note: 'Catalog listings' },
          { label: 'Orders', value: stats?.orders, note: 'All time' },
          { label: 'Customers', value: stats?.users, note: 'Registered users' },
          { label: 'Gross Sales', value: loading ? undefined : formatNaira(grossSales), note: 'Sum of non-cancelled orders' },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="relative gap-0 p-5 after:absolute after:-right-9 after:-top-9 after:size-[105px] after:rounded-full after:bg-gradient-to-br after:from-[#d5ea7240] after:to-[#0ba66f16] after:content-['']"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
              {stat.label}
            </p>
            {loading ? (
              <Skeleton className="my-2 h-8 w-16" />
            ) : (
              <p className="my-2 text-[30px] font-black leading-tight text-primary">{stat.value ?? '—'}</p>
            )}
            <p className="text-[11px] text-muted-foreground">{stat.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Marketplace Activity</h2>
            <Link href="/admin/analytics" className="text-[11px] font-black text-secondary hover:underline">
              Full analytics →
            </Link>
          </div>
          <div className="h-[245px] rounded-2xl bg-gradient-to-b from-[#f7f8f3] to-[#eef5ef] p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <defs>
                  <linearGradient id="adminActivityBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--bright)" />
                    <stop offset="100%" stopColor="var(--emerald)" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#dbe6df" strokeOpacity={0.7} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={10} tick={{ fill: 'var(--admin-muted-ink)' }} />
                <Tooltip cursor={{ fill: 'rgba(8,127,91,0.06)' }} formatter={(value) => [value, 'Orders']} />
                <Bar dataKey="count" fill="url(#adminActivityBar)" radius={[9, 9, 2, 2]} maxBarSize={38} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-[11px] text-muted-foreground">Orders placed per day, last 7 days</p>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Needs Attention</h2>
            <Link href="/admin/audit" className="text-[11px] font-black text-secondary hover:underline">
              Audit →
            </Link>
          </div>
          <div className="divide-y divide-border">
            {[
              {
                href: '/admin/suppliers',
                thumb: 'SUP',
                title: 'Supplier verification',
                note: 'Applications awaiting review',
                count: stats?.pendingSuppliers,
                tone: stats && stats.pendingSuppliers > 0 ? ('yellow' as const) : ('green' as const),
              },
              {
                href: '/admin/orders',
                thumb: 'ORD',
                title: 'Orders awaiting fulfillment',
                note: 'Pending, paid, or processing',
                count: ordersAwaitingFulfillment,
                tone: ordersAwaitingFulfillment > 0 ? ('blue' as const) : ('green' as const),
              },
              {
                href: '/admin/feedback',
                thumb: 'FBK',
                title: 'Open feedback',
                note: 'Not yet planned or resolved',
                count: openFeedbackCount,
                tone: openFeedbackCount > 0 ? ('yellow' as const) : ('green' as const),
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex items-center gap-3">
                  <span className="grid size-[38px] shrink-0 place-items-center rounded-[11px] bg-[#edf6f1] text-[10px] font-black text-secondary">
                    {item.thumb}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-primary">{item.title}</p>
                    <p className="text-[11px] text-muted-foreground">{item.note}</p>
                  </div>
                </div>
                <StatusBadge tone={item.tone} className="px-2 py-1 text-[10px] font-black">
                  {item.count ?? '—'}
                </StatusBadge>
              </Link>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[1.4fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Recent Orders</h2>
            <Link href="/admin/orders" className="text-[11px] font-black text-secondary hover:underline">
              View all →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={TABLE_HEAD}>Order</TableHead>
                <TableHead className={TABLE_HEAD}>Customer</TableHead>
                <TableHead className={TABLE_HEAD}>Amount</TableHead>
                <TableHead className={TABLE_HEAD}>Status</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                    {loading ? 'Loading…' : 'No orders yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                recentOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-bold">#{order.orderNumber}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>{formatNaira(order.totalAmount)}</TableCell>
                    <TableCell>
                      <StatusBadge tone={ORDER_STATUS_TONE[order.status]}>{order.status}</StatusBadge>
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${order.id}`} className="text-[11px] font-black text-secondary hover:underline">
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Recent Users</h2>
            <Link href="/admin/users" className="text-[11px] font-black text-secondary hover:underline">
              View all →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className={TABLE_HEAD}>Name</TableHead>
                <TableHead className={TABLE_HEAD}>Role</TableHead>
                <TableHead className={TABLE_HEAD}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    {loading ? 'Loading…' : 'No users yet.'}
                  </TableCell>
                </TableRow>
              ) : (
                recentUsers.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-bold">{u.fullName}</TableCell>
                    <TableCell className="capitalize">{u.role}</TableCell>
                    <TableCell>
                      <StatusBadge tone={u.isActive ? 'green' : 'gray'}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Admin Dashboard" subtitle="DOVA Chain Administration">
          <DashboardContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
