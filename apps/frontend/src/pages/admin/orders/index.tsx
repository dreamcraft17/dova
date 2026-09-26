import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { StatusBadge } from '../../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminOrders } from '../../../hooks/admin/useAdminOrders';
import type { OrderStatus } from 'dova-shared';

const STATUS_TONE: Record<OrderStatus, 'green' | 'yellow' | 'blue' | 'red'> = {
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

function OrdersContent() {
  const { orders, loading, error, reload } = useAdminOrders();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'all' && o.status !== statusFilter) return false;
      if (!q) return true;
      return o.orderNumber.toLowerCase().includes(q) || o.customerName?.toLowerCase().includes(q);
    });
  }, [orders, search, statusFilter]);

  const counts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((o) => o.status === 'pending' || o.status === 'paid').length,
      inDelivery: orders.filter((o) => o.status === 'processing' || o.status === 'shipped').length,
      completed: orders.filter((o) => o.status === 'delivered').length,
    }),
    [orders],
  );

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Order Operations</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Orders</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">All platform orders across every supplier.</p>
      </div>

      {error ? (
        <Card className="border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}{' '}
          <button type="button" className="underline" onClick={() => void reload()}>
            Retry
          </button>
        </Card>
      ) : null}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'All', value: counts.all },
          { label: 'Pending', value: counts.pending },
          { label: 'In Delivery', value: counts.inDelivery },
          { label: 'Completed', value: counts.completed },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{stat.label}</p>
            <p className="mt-1 text-3xl font-black text-primary">{loading ? '—' : stat.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Input
            placeholder="Search order number or customer"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="md:max-w-xs"
          />
          <Select value={statusFilter} onValueChange={(v: string) => setStatusFilter(v as typeof statusFilter)}>
            <SelectTrigger className="w-full md:w-48">
              <SelectValue placeholder="All status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                  {loading ? 'Loading…' : 'No orders found.'}
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((o) => (
                <TableRow key={o.id}>
                  <TableCell className="font-bold">#{o.orderNumber}</TableCell>
                  <TableCell>{o.customerName}</TableCell>
                  <TableCell>{formatNaira(o.totalAmount)}</TableCell>
                  <TableCell>
                    <StatusBadge tone={STATUS_TONE[o.status]}>{o.status}</StatusBadge>
                  </TableCell>
                  <TableCell>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/admin/orders/${o.id}`}>Open</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export default function AdminOrdersPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Orders" subtitle="Order operations">
          <OrdersContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
