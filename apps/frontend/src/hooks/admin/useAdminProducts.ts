import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Product } from 'dova-shared';

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setProducts(await api<Product[]>('/admin/products'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = useCallback(
    async (product: Product) => {
      setActionBusy(true);
      try {
        await api(`/admin/products/${product.id}/active`, {
          method: 'PUT',
          body: JSON.stringify({ active: !product.isActive }),
        });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  const bulkSetActive = useCallback(
    async (ids: string[], active: boolean) => {
      if (!ids.length) return;
      setActionBusy(true);
      try {
        await api('/admin/products/active', { method: 'PUT', body: JSON.stringify({ ids, active }) });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  return { products, loading, error, actionBusy, reload: load, toggleActive, bulkSetActive };
}
