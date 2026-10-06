import { useMemo, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { SalesTrendChart } from '../../components/supplier/SalesTrendChart';
import { EmptyState, PageHead, Panel, StatCard, fieldStyles, formatNaira } from '../../components/supplier/ui';
import { useSupplierOrders } from '../../hooks/supplier/useSupplierOrders';
import { useSupplierProducts } from '../../hooks/supplier/useSupplierProducts';

const PERIODS = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
];

const headClass = 'h-auto px-3 py-3 text-[10px] font-bold uppercase tracking-[0.07em] text-muted-foreground';
const cellClass = 'px-3 py-3.5 text-xs';

function SalesContent() {
  const { orders, loading } = useSupplierOrders();
  const { products } = useSupplierProducts();
  const [days, setDays] = useState(30);

  const periodOrders = useMemo(() => {
    const since = new Date();
    since.setDate(since.getDate() - (days - 1));
    since.setHours(0, 0, 0, 0);
    return orders.filter((o) => o.createdAt && new Date(o.createdAt) >= since);
  }, [orders, days]);

  const nonCancelled = useMemo(() => periodOrders.filter((o) => o.status !== 'cancelled'), [periodOrders]);
  const grossSales = nonCancelled.reduce((sum, o) => sum + o.subtotal, 0);
  const unitsSold = nonCancelled.reduce((sum, o) => sum + o.quantity, 0);
  const completed = periodOrders.filter((o) => o.status === 'delivered');
  const avgOrderValue = completed.length ? completed.reduce((sum, o) => sum + o.subtotal, 0) / completed.length : 0;

  const fulfillment = [
    { label: 'Completed', count: completed.length },
    { label: 'Processing', count: periodOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled').length },
    { label: 'Cancelled', count: periodOrders.filter((o) => o.status === 'cancelled').length },
  ];

  const productSales = useMemo(() => {
    const stockByName = new Map(products.map((p) => [p.name, p.stockQuantity]));
    const byProduct = new Map<string, { unitsSold: number; orders: number; sales: number }>();
    for (const order of nonCancelled) {
      const entry = byProduct.get(order.productName) ?? { unitsSold: 0, orders: 0, sales: 0 };
      entry.unitsSold += order.quantity;
      entry.orders += 1;
      entry.sales += order.subtotal;
      byProduct.set(order.productName, entry);
    }
    return Array.from(byProduct.entries())
      .map(([productName, stats]) => ({ productName, stock: stockByName.get(productName), ...stats }))
      .sort((a, b) => b.sales - a.sales);
  }, [nonCancelled, products]);

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Sales & Performance"
        title="Sales & Analytics"
        lead="Understand product sales, order volume, revenue and marketplace performance over time."
        actions={
          <Select value={String(days)} onValueChange={(v: string) => setDays(Number(v))}>
            <SelectTrigger className={`${fieldStyles.control} h-10 w-40 font-bold`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIODS.map((p) => (
                <SelectItem key={p.days} value={String(p.days)}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      <div className="grid gap-3.5 sm:grid-cols-3">
        <StatCard label="Gross Sales" value={formatNaira(grossSales)} note="Excluding cancelled orders" loading={loading} />
        <StatCard label="Units Sold" value={unitsSold} note="All listed products" loading={loading} />
        <StatCard
          label="Average Order Value"
          value={formatNaira(Math.round(avgOrderValue))}
          note="Based on completed orders"
          loading={loading}
        />
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Sales Trend">
          <SalesTrendChart orders={orders} days={days} />
        </Panel>

        <Panel title="Fulfillment">
          <div className="grid gap-4">
            {fulfillment.map((row) => (
              <div key={row.label}>
                <div className="mb-1.5 flex justify-between text-[11px]">
                  <strong className="font-bold text-foreground">{row.label}</strong>
                  <span className="text-muted-foreground">{row.count}</span>
                </div>
                <div className="h-[7px] overflow-hidden rounded-full bg-[#e9eee9]">
                  <span
                    className="block h-full rounded-full bg-gradient-to-r from-[var(--emerald)] to-[var(--lime)]"
                    style={{ width: `${periodOrders.length ? Math.round((row.count / periodOrders.length) * 100) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel title="Product Sales" link={{ href: '/supplier/products', label: 'Catalog' }}>
        {productSales.length === 0 ? (
          <EmptyState>{loading ? 'Loading…' : 'No sales in this period yet.'}</EmptyState>
        ) : (
          <Table className="min-w-[640px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className={headClass}>Product</TableHead>
                <TableHead className={headClass}>Units Sold</TableHead>
                <TableHead className={headClass}>Orders</TableHead>
                <TableHead className={headClass}>Sales</TableHead>
                <TableHead className={headClass}>Stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productSales.map((row) => (
                <TableRow key={row.productName}>
                  <TableCell className={`${cellClass} font-bold text-[var(--near)]`}>{row.productName}</TableCell>
                  <TableCell className={cellClass}>{row.unitsSold}</TableCell>
                  <TableCell className={cellClass}>{row.orders}</TableCell>
                  <TableCell className={`${cellClass} font-bold text-[var(--forest)]`}>{formatNaira(row.sales)}</TableCell>
                  <TableCell className={cellClass}>{row.stock ?? '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Panel>
    </div>
  );
}

export default function SupplierSalesPage() {
  return (
    <SupplierGate title="Sales & Analytics" subtitle="DOVA Supplier Dashboard">
      <SalesContent />
    </SupplierGate>
  );
}
