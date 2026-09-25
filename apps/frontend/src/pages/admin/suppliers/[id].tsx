import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { StatusBadge } from '../../../components/admin/status-badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAdminSuppliers } from '../../../hooks/admin/useAdminSuppliers';
import type { SupplierStatus } from 'dova-shared';

const STATUS_TONE: Record<SupplierStatus, 'green' | 'yellow' | 'red'> = {
  approved: 'green',
  pending: 'yellow',
  rejected: 'red',
};
const STATUS_LABEL: Record<SupplierStatus, string> = {
  approved: 'Verified',
  pending: 'Pending',
  rejected: 'Rejected',
};

function SupplierDetailContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const { suppliers, loading, actionBusy, decide } = useAdminSuppliers();
  const supplier = suppliers.find((s) => s.id === id);

  async function handleReject() {
    const reason = window.prompt('Rejection reason');
    if (!reason || !supplier) return;
    await decide(supplier.id, 'reject', reason);
  }

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }

  if (!supplier) {
    return (
      <Card className="p-6 text-sm text-muted-foreground">
        Supplier not found. <Link href="/admin/suppliers" className="text-secondary underline">Back to suppliers</Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/suppliers" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="size-4" /> Back to suppliers
      </Link>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-sm font-black text-primary-foreground">
            SUP
          </span>
          <div>
            <h1 className="text-2xl font-black text-primary">{supplier.businessName}</h1>
            <p className="text-xs text-muted-foreground">Supplier ID: {supplier.id}</p>
          </div>
        </div>
        {supplier.status === 'pending' ? (
          <div className="flex gap-2">
            <Button disabled={actionBusy} onClick={() => void decide(supplier.id, 'approve')}>
              Approve
            </Button>
            <Button variant="outline" disabled={actionBusy} onClick={() => void handleReject()}>
              Reject
            </Button>
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Location', value: supplier.location ?? '—' },
          { label: 'Products', value: supplier.productsCount ?? '—' },
          { label: 'Status', value: <StatusBadge tone={STATUS_TONE[supplier.status]}>{STATUS_LABEL[supplier.status]}</StatusBadge> },
          { label: 'Joined', value: new Date(supplier.createdAt).toLocaleDateString('en-NG') },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">{kpi.label}</p>
            <p className="mt-1 text-lg font-black text-primary">{kpi.value}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <h2 className="mb-3 text-base font-bold text-primary">Supplier Information</h2>
        <dl className="divide-y divide-border text-sm">
          {[
            ['Business name', supplier.businessName],
            ['Contact name', supplier.contactName ?? '—'],
            ['Phone', supplier.phone ?? '—'],
            ['Email', supplier.email ?? '—'],
            ['Operating area', supplier.location ?? '—'],
            [
              'Verification document',
              supplier.documentUrl ? (
                <a key="doc" href={supplier.documentUrl} target="_blank" rel="noreferrer" className="text-secondary underline">
                  View document
                </a>
              ) : (
                '—'
              ),
            ],
            ...(supplier.status === 'rejected' && supplier.rejectionReason
              ? [['Rejection reason', supplier.rejectionReason]]
              : []),
          ].map(([label, value]) => (
            <div key={String(label)} className="flex justify-between gap-4 py-2.5">
              <dt className="text-muted-foreground">{label}</dt>
              <dd className="text-right font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>
    </div>
  );
}

export default function AdminSupplierDetailPage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Supplier Details" subtitle="Supplier verification & operations">
          <SupplierDetailContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
