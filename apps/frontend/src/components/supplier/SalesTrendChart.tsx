import { useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import type { SupplierOrder } from '../../hooks/supplier/useSupplierOrders';
import { formatNaira } from './ui';

function useDailySales(orders: SupplierOrder[], days: number) {
  return useMemo(() => {
    const buckets: { key: string; label: string; sales: number }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      buckets.push({
        key: d.toISOString().slice(0, 10),
        label: d.toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
        sales: 0,
      });
    }
    const byDay = new Map(buckets.map((b) => [b.key, b]));
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      const bucket = byDay.get(order.createdAt?.slice(0, 10));
      if (bucket) bucket.sales += order.subtotal;
    }
    return buckets;
  }, [orders, days]);
}

export function SalesTrendChart({ orders, days = 14 }: { orders: SupplierOrder[]; days?: number }) {
  const data = useDailySales(orders, days);

  return (
    <div className="h-[220px] rounded-[15px] border border-border bg-gradient-to-b from-[#f4f8f4] to-white p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
          <defs>
            <linearGradient id="supplierSalesFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--emerald)" stopOpacity={0.18} />
              <stop offset="100%" stopColor="var(--emerald)" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="rgba(3,31,23,0.07)" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            fontSize={10}
            interval="preserveStartEnd"
            tick={{ fill: 'var(--admin-muted-ink)' }}
          />
          <Tooltip formatter={(value) => [formatNaira(Number(value)), 'Sales']} />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="var(--emerald)"
            strokeWidth={2.5}
            fill="url(#supplierSalesFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
