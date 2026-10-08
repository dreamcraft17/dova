import Link from 'next/link';
import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { SupplierGate } from '../../components/supplier/SupplierGate';
import { SalesTrendChart } from '../../components/supplier/SalesTrendChart';
import {
  EmptyState,
  ListRow,
  OrderStatusBadge,
  PageHead,
  Panel,
  StatCard,
  Timeline,
  buttonStyles,
  formatNaira,
  initialsOf,
} from '../../components/supplier/ui';
import { useAuth } from '../../context/AuthContext';
import { useSupplierInfo } from '../../hooks/supplier/useSupplierInfo';
import { useSupplierProducts } from '../../hooks/supplier/useSupplierProducts';
import { useSupplierOrders } from '../../hooks/supplier/useSupplierOrders';

function DashboardContent() {
  const { user } = useAuth();
  const { info } = useSupplierInfo();
  const { products, loading: productsLoading } = useSupplierProducts();
  const { orders, loading: ordersLoading } = useSupplierOrders();

  const pendingOrders = useMemo(() => orders.filter((o) => o.status === 'pending').length, [orders]);
  const sales = useMemo(
    () => orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.subtotal, 0),
    [orders],
  );
  const productPerformance = useMemo(() => {
    const revenueByName = new Map<string, { revenue: number; units: number }>();
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      const entry = revenueByName.get(order.productName) ?? { revenue: 0, units: 0 };
      entry.revenue += order.subtotal;
      entry.units += order.quantity;
      revenueByName.set(order.productName, entry);
    }
    return products
      .map((product) => ({ product, ...(revenueByName.get(product.name) ?? { revenue: 0, units: 0 }) }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);
  }, [products, orders]);

  return (
    <div className="space-y-[18px]">
      <PageHead
        eyebrow="Supplier Overview"
        title="Supplier Dashboard"
        lead={`Welcome back${user?.fullName ? `, ${user.fullName}` : ''}. Manage products, orders, sales and your DOVA supplier profile from one place.`}
        actions={
          <>
            <Button asChild className={buttonStyles.primary}>
              <Link href="/supplier/add-product">＋ Add Product</Link>
            </Button>
            <Button asChild variant="outline" className={buttonStyles.light}>
              <Link href="/supplier/orders">View Orders</Link>
            </Button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <StatCard label="Listed Products" value={products.length} note="Live count from your catalog" loading={productsLoading} />
        <StatCard label="Pending Orders" value={pendingOrders} note="Orders awaiting action" loading={ordersLoading} />
        <StatCard label="Sales" value={formatNaira(sales)} note="All-time, excluding cancelled" loading={ordersLoading} />
        <StatCard label="Available Balance" value="₦ —" note="Connect payout wallet" />
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Sales Overview" link={{ href: '/supplier/sales', label: 'Full analytics' }}>
          <SalesTrendChart orders={orders} />
        </Panel>

        <Panel title="Recent Orders" link={{ href: '/supplier/orders', label: 'View all' }}>
          {orders.length === 0 ? (
            <EmptyState>{ordersLoading ? 'Loading…' : 'No incoming orders yet.'}</EmptyState>
          ) : (
            orders.slice(0, 3).map((order) => (
              <ListRow
                key={order.itemId}
                thumb="ORD"
                title={`Order #${order.orderNumber}`}
                subtitle={`${order.productName} · Qty ${order.quantity} · ${formatNaira(order.subtotal)}`}
                trailing={<OrderStatusBadge status={order.status} />}
              />
            ))
          )}
        </Panel>
      </div>

      <div className="grid gap-3.5 lg:grid-cols-[1.4fr_0.8fr]">
        <Panel title="Product Performance" link={{ href: '/supplier/products', label: 'Manage products' }}>
          {productPerformance.length === 0 ? (
            <EmptyState>{productsLoading ? 'Loading…' : 'No products yet. Add your first product.'}</EmptyState>
          ) : (
            productPerformance.map(({ product, revenue, units }) => (
              <ListRow
                key={product.id}
                thumb={initialsOf(product.name)}
                title={product.name}
                subtitle={`${units} sold · ${product.stockQuantity} in stock · ${product.categoryName}`}
                trailing={
                  <span className="whitespace-nowrap text-xs font-black text-[var(--forest)]">
                    {formatNaira(revenue)}
                  </span>
                }
              />
            ))
          )}
        </Panel>

        <Panel title="Supplier Activity">
          <Timeline
            items={[
              {
                title: 'Products and orders',
                body:
                  productsLoading || ordersLoading
                    ? 'Loading account activity…'
                    : `${products.length} products listed · ${orders.length} order items received.`,
              },
              { title: 'Payments', body: 'Payout and settlement events will appear here.' },
              {
                title: 'Account',
                body: info ? `Verification status: ${info.status === 'approved' ? 'Verified' : info.status}.` : '—',
              },
            ]}
          />
        </Panel>
      </div>
    </div>
  );
}

export default function SupplierDashboardPage() {
  return (
    <SupplierGate title="Supplier Dashboard" subtitle="DOVA Supplier Dashboard">
      <DashboardContent />
    </SupplierGate>
  );
}
