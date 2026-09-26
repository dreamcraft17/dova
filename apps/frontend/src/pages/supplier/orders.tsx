import { useMemo, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import {
  EmptyState,
  OrderStatusBadge,
  PageHead,
  StatCard,
  SupplierCard,
  fieldStyles,
  formatNaira,
} from '../../components/supplier/ui';
import { useSupplierOrders } from '../../hooks/supplier/useSupplierOrders';

const NEXT_STATUS: Record<string, string[]> = {
  pending: ['processing'],
  paid: ['processing'],
  processing: ['shipped'],
  shipped: ['delivered'],
};

const STATUS_GROUPS: Record<string, string[]> = {
  new: ['pending', 'paid'],
  processing: ['processing', 'shipped'],
  completed: ['delivered'],
  cancelled: ['cancelled'],
};

const headClass = 'h-auto px-3 py-3 text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground';
const cellClass = 'px-3 py-3.5 text-xs';

function OrdersContent() {
  const { orders, loading, error, actionBusy, setStatus } = useSupplierOrders();
  const [search, setSearch] = useState('');
  const [group, setGroup] = useState('all');

  const counts = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(STATUS_GROUPS).map(([key, statuses]) => [key, orders.filter((o) => statuses.includes(o.status)).length]),
      ),
    [orders],
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (group === 'all' || STATUS_GROUPS[group].includes(o.status)) &&
        (!term ||
          o.orderNumber.toLowerCase().includes(term) ||
          o.customerName.toLowerCase().includes(term) ||
          o.productName.toLowerCase().includes(term)),
    );
  }, [orders, search, group]);

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Order Management"
        title="Orders"
        lead="See customer orders that contain your products, their status and the action required from you."
      />

      {error ? (
        <SupplierCard className="border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">{error}</SupplierCard>
      ) : null}

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="New Orders" value={counts.new} note="Needs attention" loading={loading} />
        <StatCard label="Processing" value={counts.processing} note="Being prepared or shipped" loading={loading} />
        <StatCard label="Completed" value={counts.completed} note="Fulfilled orders" loading={loading} />
        <StatCard label="Cancelled" value={counts.cancelled} note="All time" loading={loading} />
      </div>

      <SupplierCard className="p-5">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Search order ID, customer or product..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`${fieldStyles.control} flex-1`}
          />
          <Select value={group} onValueChange={setGroup}>
            <SelectTrigger className={`${fieldStyles.control} sm:w-44`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState>{loading ? 'Loading…' : orders.length === 0 ? 'No incoming orders yet.' : 'No orders match your filters.'}</EmptyState>
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={headClass}>Order</TableHead>
                <TableHead className={headClass}>Customer</TableHead>
                <TableHead className={headClass}>Product</TableHead>
                <TableHead className={headClass}>Qty</TableHead>
                <TableHead className={headClass}>Amount</TableHead>
                <TableHead className={headClass}>Status</TableHead>
                <TableHead className={headClass}>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((order) => {
                const nextOptions = NEXT_STATUS[order.status] ?? [];
                return (
                  <TableRow key={order.itemId}>
                    <TableCell className={cellClass}>
                      <strong className="font-bold text-[var(--near)]">#{order.orderNumber}</strong>
                      <p className="text-[10px] text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-NG') : '—'}
                      </p>
                    </TableCell>
                    <TableCell className={cellClass}>
                      <p>{order.customerName}</p>
                      <p className="max-w-[220px] truncate text-[10px] text-muted-foreground">{order.deliveryAddress}</p>
                    </TableCell>
                    <TableCell className={cellClass}>{order.productName}</TableCell>
                    <TableCell className={cellClass}>{order.quantity}</TableCell>
                    <TableCell className={`${cellClass} font-bold text-[var(--forest)]`}>{formatNaira(order.subtotal)}</TableCell>
                    <TableCell className={cellClass}>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className={cellClass}>
                      {nextOptions.length === 0 ? (
                        <span className="text-[10px] text-muted-foreground">—</span>
                      ) : (
                        <Select
                          key={order.status}
                          disabled={actionBusy}
                          onValueChange={(value: string) => void setStatus(order.itemId, value)}
                        >
                          <SelectTrigger className="h-8 w-36 rounded-[10px] border-border bg-white text-[11px] font-bold text-[var(--forest)]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent>
                            {nextOptions.map((option) => (
                              <SelectItem key={option} value={option} className="capitalize">
                                Mark as {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </SupplierCard>
    </div>
  );
}

export default function SupplierOrdersPage() {
  return (
    <SupplierGate title="Orders" subtitle="DOVA Supplier Dashboard">
      <OrdersContent />
    </SupplierGate>
  );
}
