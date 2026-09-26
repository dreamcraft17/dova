import Link from 'next/link';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis } from 'recharts';
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
          <Button asChild>
            <Link href="/admin/orders">Review Orders</Link>
          </Button>
          <Button asChild variant="secondary" className="bg-accent text-accent-foreground hover:bg-accent/80">
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
          <Card key={stat.label} className="p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
              {stat.label}
            </p>
            {loading ? (
              <Skeleton className="mt-2 h-8 w-16" />
            ) : (
              <p className="mt-1 text-3xl font-black text-primary">{stat.value ?? '—'}</p>
            )}
            <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Marketplace Activity</h2>
            <Link href="/admin/analytics" className="text-sm font-semibold text-secondary hover:underline">
              Full analytics →
            </Link>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">Orders placed per day, last 7 days</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyActivity}>
                <CartesianGrid vertical={false} stroke="var(--border)" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={12} />
                <Bar dataKey="count" fill="var(--chart-1)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Needs Attention</h2>
            <Link href="/admin/audit" className="text-sm font-semibold text-secondary hover:underline">
              Audit →
            </Link>
          </div>
          <div className="divide-y divide-border">
            <Link
              href="/admin/suppliers"
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-bold text-foreground">Supplier verification</p>
                <p className="text-xs text-muted-foreground">Applications awaiting review</p>
              </div>
              <StatusBadge tone={stats && stats.pendingSuppliers > 0 ? 'yellow' : 'green'}>
                {stats ? stats.pendingSuppliers : '—'}
              </StatusBadge>
            </Link>
            <Link
              href="/admin/orders"
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-bold text-foreground">Orders awaiting fulfillment</p>
                <p className="text-xs text-muted-foreground">Pending, paid, or processing</p>
              </div>
              <StatusBadge tone={ordersAwaitingFulfillment > 0 ? 'blue' : 'green'}>
                {ordersAwaitingFulfillment}
              </StatusBadge>
            </Link>
            <Link
              href="/admin/feedback"
              className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div>
                <p className="text-sm font-bold text-foreground">Open feedback</p>
                <p className="text-xs text-muted-foreground">Not yet planned or resolved</p>
              </div>
              <StatusBadge tone={openFeedbackCount > 0 ? 'yellow' : 'green'}>
                {openFeedbackCount}
              </StatusBadge>
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-secondary hover:underline">
              View all →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
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
                      <Link href={`/admin/orders/${order.id}`} className="text-sm font-semibold text-secondary hover:underline">
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
            <Link href="/admin/users" className="text-sm font-semibold text-secondary hover:underline">
              View all →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
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
