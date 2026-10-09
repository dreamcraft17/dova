import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { StatusBadge } from '../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminAnalytics, type AdminAnalyticsTrendPoint } from '../../hooks/admin/useAdminAnalytics';
import type { OrderStatus } from 'dova-shared';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

const ORDER_STATUS_TONE: Record<OrderStatus, 'green' | 'yellow' | 'blue' | 'red' | 'gray'> = {
  pending: 'yellow',
  paid: 'blue',
  processing: 'blue',
  shipped: 'blue',
  delivered: 'green',
  cancelled: 'red',
};

const CATEGORY_COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function formatDateLabel(date: string) {
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function SalesTrendChart({ trend, loading }: { trend: AdminAnalyticsTrendPoint[]; loading: boolean }) {
  if (loading) return <Skeleton className="h-[260px] w-full rounded-2xl" />;
  if (trend.length === 0) {
    return (
      <div className="grid h-[260px] place-items-center rounded-2xl bg-gradient-to-b from-[#f7f8f3] to-[#eef5ef] text-sm text-muted-foreground">
        No orders in this period.
      </div>
    );
  }
  return (
    <div className="h-[260px] rounded-2xl bg-gradient-to-b from-[#f7f8f3] to-[#eef5ef] p-5">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={trend}>
          <defs>
            <linearGradient id="adminSalesArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--bright)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--bright)" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#dbe6df" strokeOpacity={0.7} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tick={{ fill: 'var(--admin-muted-ink)' }}
            minTickGap={24}
          />
          <YAxis hide />
          <Tooltip
            cursor={{ stroke: 'var(--emerald)', strokeWidth: 1 }}
            labelFormatter={(value) => formatDateLabel(String(value))}
            formatter={(value: number, name) => [name === 'sales' ? formatNaira(value) : value, name === 'sales' ? 'Sales' : 'Orders']}
          />
          <Area type="monotone" dataKey="sales" stroke="var(--emerald)" strokeWidth={2} fill="url(#adminSalesArea)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function OrdersTrendChart({ trend, loading }: { trend: AdminAnalyticsTrendPoint[]; loading: boolean }) {
  if (loading) return <Skeleton className="h-[160px] w-full rounded-2xl" />;
  return (
    <div className="h-[160px] rounded-2xl bg-gradient-to-b from-[#f7f8f3] to-[#eef5ef] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={trend}>
          <CartesianGrid stroke="#dbe6df" strokeOpacity={0.7} vertical={false} />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateLabel}
            tickLine={false}
            axisLine={false}
            fontSize={10}
            tick={{ fill: 'var(--admin-muted-ink)' }}
            minTickGap={24}
          />
          <Tooltip cursor={{ fill: 'rgba(8,127,91,0.06)' }} labelFormatter={(value) => formatDateLabel(String(value))} formatter={(value: number) => [value, 'Orders']} />
          <Bar dataKey="orders" fill="var(--bright)" radius={[6, 6, 2, 2]} maxBarSize={28} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BreakdownBars({
  items,
  loading,
  nameKey,
}: {
  items: { orders: number; sales: number; [key: string]: unknown }[];
  loading: boolean;
  nameKey: string;
}) {
  if (loading) return <Skeleton className="h-[220px] w-full rounded-2xl" />;
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No data in this period.</p>;
  }
  const maxSales = Math.max(...items.map((i) => i.sales), 1);
  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={String(item[nameKey])} className="space-y-1">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="font-bold text-primary">{String(item[nameKey])}</span>
            <span className="text-muted-foreground">
              {formatNaira(item.sales)} &middot; {item.orders} orders
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.max((item.sales / maxSales) * 100, 3)}%`,
                backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function AnalyticsContent() {
  const [days, setDays] = useState(30);
  const { data, loading, error, reload } = useAdminAnalytics(days);
  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Data &amp; Insights</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Analytics</h1>
          <p className="mt-2 max-w-[60ch] text-muted-foreground">
            Marketplace performance &amp; trends, calculated live from orders.
          </p>
        </div>
        <div className="flex gap-2">
          {RANGES.map((range) => (
            <Button
              key={range.days}
              variant={days === range.days ? 'default' : 'outline'}
              className="h-10 rounded-[12px] px-4 text-[13px] font-black"
              onClick={() => setDays(range.days)}
            >
              {range.label}
            </Button>
          ))}
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Orders', value: summary?.orders },
          { label: 'Sales', value: summary ? formatNaira(summary.sales) : undefined },
          { label: 'Avg. Order Value', value: summary ? formatNaira(summary.averageOrderValue) : undefined },
          { label: 'Completion Rate', value: summary ? formatPercent(summary.completionRate) : undefined },
        ].map((stat) => (
          <Card
            key={stat.label}
            className="relative gap-0 p-5 after:absolute after:-right-9 after:-top-9 after:size-[105px] after:rounded-full after:bg-gradient-to-br after:from-[#d5ea7240] after:to-[#0ba66f16] after:content-['']"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{stat.label}</p>
            {loading ? (
              <Skeleton className="my-2 h-8 w-20" />
            ) : (
              <p className="my-2 text-[26px] font-black leading-tight text-primary">{stat.value ?? '—'}</p>
            )}
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-bold text-primary">Sales trend</h2>
          <span className="text-[11px] text-muted-foreground">Last {days} days</span>
        </div>
        <SalesTrendChart trend={data?.trend ?? []} loading={loading} />
      </Card>

      <div className="grid gap-[18px] lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Orders per day</h2>
          </div>
          <OrdersTrendChart trend={data?.trend ?? []} loading={loading} />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Orders by status</h2>
          </div>
          {loading ? (
            <Skeleton className="h-[160px] w-full rounded-2xl" />
          ) : (data?.byStatus ?? []).length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No orders in this period.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(data?.byStatus ?? []).map((s) => (
                <StatusBadge key={s.status} tone={ORDER_STATUS_TONE[s.status]} className="px-3 py-1.5 text-[11px]">
                  {s.status} &middot; {s.count}
                </StatusBadge>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="grid gap-[18px] lg:grid-cols-[1fr_1fr]">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Top categories</h2>
          </div>
          <BreakdownBars items={data?.byCategory ?? []} loading={loading} nameKey="category" />
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Top suppliers</h2>
          </div>
          <BreakdownBars items={data?.bySupplier ?? []} loading={loading} nameKey="supplier" />
        </Card>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Analytics" subtitle="Marketplace performance & trends">
          <AnalyticsContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
