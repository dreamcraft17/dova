import { useRouter } from 'next/router';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { BundleForm, type BundleFormValues, type BundleContentRow } from '../../../components/admin/BundleForm';
import { useAdminBundles } from '../../../hooks/admin/useAdminBundles';
import { api } from '../../../lib/api';
import { useState } from 'react';

function NewBundleContent() {
  const router = useRouter();
  const { categories, products, loading } = useAdminBundles();
  const [busy, setBusy] = useState(false);

  async function handleSubmit(values: BundleFormValues, contents: BundleContentRow[]) {
    setBusy(true);
    try {
      await api('/admin/bundles', {
        method: 'POST',
        body: JSON.stringify({
          name: values.name.trim(),
          description: values.description.trim(),
          categoryId: values.categoryId || undefined,
          imageUrl: values.imageUrl.trim() || undefined,
          bundlePrice: Number(values.bundlePrice),
          isFeatured: Boolean(values.isFeatured),
          contents: contents.map((c, i) => ({ productId: c.productId, quantity: c.quantity, position: i })),
        }),
      });
      await router.push('/admin/bundles');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Link href="/admin/bundles" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="size-4" /> Back to bundles
      </Link>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Bundle Builder</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">New Bundle</h1>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : (
        <BundleForm categories={categories} products={products} submitLabel="Create bundle" busy={busy} onSubmit={handleSubmit} />
      )}
    </div>
  );
}

export default function AdminNewBundlePage() {
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="New Bundle" subtitle="Bundle builder">
          <NewBundleContent />
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
