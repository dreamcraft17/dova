import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { AdminLayout } from '../../../components/admin/AdminLayout';
import { BundleForm, type BundleFormValues, type BundleContentRow } from '../../../components/admin/BundleForm';
import { Card } from '@/components/ui/card';
import { useAdminBundles, useAdminBundleDetail } from '../../../hooks/admin/useAdminBundles';
import { api } from '../../../lib/api';

function EditBundleContent({ id }: { id: string }) {
  const router = useRouter();
  const { categories, products, loading: loadingLists } = useAdminBundles();
  const { bundle, loading: loadingBundle, error } = useAdminBundleDetail(id);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(values: BundleFormValues, contents: BundleContentRow[]) {
    setBusy(true);
    try {
      await api(`/admin/bundles/${id}`, {
        method: 'PUT',
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

  const loading = loadingLists || loadingBundle;

  return (
    <div className="space-y-6">
      <Link href="/admin/bundles" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
        <ArrowLeft className="size-4" /> Back to bundles
      </Link>
      <div>
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-secondary">Bundle Builder</p>
        <h1 className="mt-1 text-3xl font-black tracking-tight text-primary md:text-[38px]">
          {bundle?.name ?? 'Edit Bundle'}
        </h1>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : error || !bundle ? (
        <Card className="p-6 text-sm text-muted-foreground">{error ?? 'Bundle not found.'}</Card>
      ) : (
        <BundleForm
          categories={categories}
          products={products}
          submitLabel="Save changes"
          busy={busy}
          onSubmit={handleSubmit}
          initial={{
            name: bundle.name,
            description: bundle.description,
            categoryId: bundle.categoryId ?? '',
            imageUrl: bundle.imageUrl ?? '',
            bundlePrice: bundle.bundlePrice,
            isFeatured: bundle.isFeatured,
          }}
          initialContents={bundle.contents.map((c) => ({ productId: c.productId, quantity: c.quantity, product: c.product }))}
        />
      )}
    </div>
  );
}

export default function AdminEditBundlePage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : undefined;
  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <AdminLayout title="Edit Bundle" subtitle="Bundle builder">
          {id ? <EditBundleContent id={id} /> : <p className="text-sm text-muted-foreground">Loading…</p>}
        </AdminLayout>
      </RequireAuth>
    </Layout>
  );
}
