import { Link2, Truck } from 'lucide-react';
import { Layout } from '../../components/Layout';
import { RequireAuth } from '../../components/RequireAuth';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Card } from '@/components/ui/card';

function LogisticsEmptyState() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Delivery Operations</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">Logistics</h1>
        <p className="mt-2 max-w-[70ch] text-muted-foreground">Manage connected delivery partners and fulfillment operations.</p>
      </div>

      <Card className="relative overflow-hidden border-dashed p-8 md:p-14">
        <div className="pointer-events-none absolute -right-20 -top-24 size-64 rounded-full bg-secondary/10" />
        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <div className="mb-6 flex size-20 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/15">
            <Truck className="size-9" strokeWidth={1.7} aria-hidden="true" />
          </div>
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-muted px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-muted-foreground">
            <Link2 className="size-3.5" aria-hidden="true" /> No connection
          </span>
          <h2 className="text-2xl font-black tracking-tight text-primary md:text-3xl">We haven&apos;t configured any logistics yet</h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            There are no logistics providers connected to DOVA. Once a provider is configured, delivery services and fulfillment updates will appear here.
          </p>
          <div className="mt-8 rounded-2xl border border-border bg-muted/40 px-5 py-4 text-left text-sm text-muted-foreground">
            <p className="font-bold text-primary">What will appear here</p>
            <p className="mt-1">Connected providers, delivery status, shipment references, and logistics payment activity.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function AdminLogisticsPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Logistics" subtitle="Delivery partners & fulfillment operations">
          <LogisticsEmptyState />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
