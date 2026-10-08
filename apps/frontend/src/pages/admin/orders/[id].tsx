import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { StatusBadge } from '../../../components/admin/status-badge';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminOrderDetail } from '../../../hooks/admin/useAdminOrders';
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

function OrderDetailContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const { order, loading, error } = useAdminOrderDetail(id);

  if (loading) return <p className="text-sm text-muted-foreground">Loading…</p>;

  if (error || !order) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        {error ?? 'Order not found.'} <Link href="/admin/orders" className="text-secondary underline">Back to orders</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="size-4" /> Back to orders
      </Link>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black text-primary">#{order.orderNumber}</h1>
          <p className="text-xs text-muted-foreground">
            Placed {new Date(order.createdAt).toLocaleString('en-NG')}
          </p>
        </div>
        <StatusBadge tone={STATUS_TONE[order.status]} className="text-sm">
          {order.status}
        </StatusBadge>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h2 className="mb-3 text-base font-bold text-primary">Order Items</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Subtotal</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold">{item.product.name}</TableCell>
                  <TableCell>{item.product.supplierName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatNaira(item.subtotal)}</TableCell>
                  <TableCell className="capitalize">{item.supplierOrderStatus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 flex justify-end text-sm font-bold text-primary">
            Total: {formatNaira(order.totalAmount)}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 text-base font-bold text-primary">Customer & Delivery</h2>
          <dl className="divide-y divide-border text-sm">
            {[
              ['Customer', order.customerName ?? '—'],
              ['Phone', order.deliveryPhone],
              ['Delivery address', order.deliveryAddress],
              ['Fulfillment', order.fulfillmentType ?? '—'],
              ['Payment reference', order.paymentReference ?? '—'],
              [
                'Payment verified',
                order.paymentVerifiedAt ? new Date(order.paymentVerifiedAt).toLocaleString('en-NG') : 'Not yet verified',
              ],
            ].map(([label, value]) => (
              <div key={String(label)} className="flex justify-between gap-4 py-2.5">
                <dt className="text-muted-foreground">{label}</dt>
                <dd className="text-right font-medium text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Order Details" subtitle="Order operations">
          <OrderDetailContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
