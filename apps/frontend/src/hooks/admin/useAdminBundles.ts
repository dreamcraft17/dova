import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { BundleDetail, BundleListResponse, BundleSummary, Category, Product } from 'dova-shared';

export function useAdminBundles() {
  const [bundles, setBundles] = useState<BundleSummary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [bl, cats, prods] = await Promise.all([
        api<BundleListResponse>('/admin/bundles?limit=100'),
        api<Category[]>('/categories'),
        api<Product[]>('/admin/products'),
      ]);
      setBundles(bl.data);
      setCategories(cats);
      setProducts(prods);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load bundles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const deactivate = useCallback(
    async (bundle: BundleSummary) => {
      setActionBusy(true);
      try {
        await api(`/admin/bundles/${bundle.id}`, { method: 'DELETE' });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  const activate = useCallback(
    async (bundle: BundleSummary) => {
      setActionBusy(true);
      try {
        await api(`/admin/bundles/${bundle.id}/active`, { method: 'PUT', body: JSON.stringify({ active: true }) });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  return { bundles, categories, products, loading, error, actionBusy, reload: load, deactivate, activate };
}

export function useAdminBundleDetail(id: string | undefined) {
  const [bundle, setBundle] = useState<BundleDetail>();
  const [loading, setLoading] = useState(Boolean(id));
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api<BundleDetail>(`/admin/bundles/${id}`)
      .then(setBundle)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load bundle.'))
      .finally(() => setLoading(false));
  }, [id]);

  return { bundle, loading, error };
}
