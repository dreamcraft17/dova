import { useRouter } from 'next/router';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { StatusBadge } from '../../../components/admin/status-badge';
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
import { useAdminSuppliers } from '../../../hooks/admin/useAdminSuppliers';
import { useAdminProducts } from '../../../hooks/admin/useAdminProducts';
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

function formatNaira(amount: number) {
  return `₦${amount.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}

function SupplierDetailContent() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  const { suppliers, loading, actionBusy, decide } = useAdminSuppliers();
  const { products, loading: productsLoading } = useAdminProducts();
  const supplier = suppliers.find((s) => s.id === id);
  const supplierProducts = useMemo(
    () => products.filter((p) => p.supplierId === id),
    [products, id],
  );

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

      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-black text-primary-foreground">
            {supplier.businessName.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">
              Supplier Overview
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-primary md:text-3xl">
              {supplier.businessName}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Supplier ID: {supplier.id} · Manage verification, catalog, and account details.
            </p>
          </div>
        </div>
        {supplier.status === 'pending' ? (
          <div className="flex gap-2">
            <Button variant="gold" disabled={actionBusy} onClick={() => void decide(supplier.id, 'approve')}>
              Approve
            </Button>
            <Button variant="outline" disabled={actionBusy} onClick={() => void handleReject()}>
              Reject
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline">
            <Link href="/admin/products">Manage Products</Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: 'Listed Products', value: supplier.productsCount ?? supplierProducts.length, note: 'Live count from catalog' },
          {
            label: 'Verification',
            value: <StatusBadge tone={STATUS_TONE[supplier.status]}>{STATUS_LABEL[supplier.status]}</StatusBadge>,
            note: 'Current review state',
          },
          { label: 'Operating Area', value: supplier.location ?? '—', note: 'Primary service area' },
          { label: 'Member Since', value: new Date(supplier.createdAt).toLocaleDateString('en-NG'), note: 'Account created' },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.08em] text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-1 text-2xl font-black text-primary">{stat.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{stat.note}</p>
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

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Sales Overview</h2>
            <Link href="/admin/analytics" className="text-sm font-semibold text-secondary hover:underline">
              Full analytics →
            </Link>
          </div>
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
            <StatusBadge tone="gray">Not yet available</StatusBadge>
            <p className="max-w-[32ch] text-xs text-muted-foreground">
              Per-supplier sales analytics will appear here once order settlement is linked to suppliers.
            </p>
          </div>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-secondary hover:underline">
              View all →
            </Link>
          </div>
          <div className="flex h-40 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border text-center">
            <StatusBadge tone="gray">Not yet available</StatusBadge>
            <p className="max-w-[32ch] text-xs text-muted-foreground">
              Orders for this supplier's products will appear here once order-to-supplier linking ships.
            </p>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Product Performance</h2>
            <Link href="/admin/products" className="text-sm font-semibold text-secondary hover:underline">
              Manage products →
            </Link>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsLoading ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ) : supplierProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    No products listed yet.
                  </TableCell>
                </TableRow>
              ) : (
                supplierProducts.slice(0, 5).map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-bold">{product.name}</TableCell>
                    <TableCell>{formatNaira(product.price)}</TableCell>
                    <TableCell>{product.stockQuantity}</TableCell>
                    <TableCell>
                      <StatusBadge tone={product.isActive ? 'green' : 'gray'}>
                        {product.isActive ? 'Active' : 'Inactive'}
                      </StatusBadge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-bold text-primary">Supplier Activity</h2>
          </div>
          <div className="space-y-4">
            <div className="flex gap-3">
              <span className="mt-1 size-2 shrink-0 rounded-full bg-secondary" />
              <div>
                <p className="text-sm font-bold text-foreground">Application submitted</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(supplier.createdAt).toLocaleString('en-NG')}
                </p>
              </div>
            </div>
            {supplier.status === 'approved' ? (
              <div className="flex gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-[#08744f]" />
                <div>
                  <p className="text-sm font-bold text-foreground">Verified &amp; approved</p>
                  <p className="text-xs text-muted-foreground">
                    {supplier.verifiedAt ? new Date(supplier.verifiedAt).toLocaleString('en-NG') : '—'}
                  </p>
                </div>
              </div>
            ) : null}
            {supplier.status === 'rejected' ? (
              <div className="flex gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-[#9b3027]" />
                <div>
                  <p className="text-sm font-bold text-foreground">Application rejected</p>
                  <p className="text-xs text-muted-foreground">{supplier.rejectionReason ?? 'No reason provided.'}</p>
                </div>
              </div>
            ) : null}
            {supplier.status === 'pending' ? (
              <div className="flex gap-3">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-[#876b00]" />
                <div>
                  <p className="text-sm font-bold text-foreground">Awaiting review</p>
                  <p className="text-xs text-muted-foreground">No decision has been made yet.</p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>
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
