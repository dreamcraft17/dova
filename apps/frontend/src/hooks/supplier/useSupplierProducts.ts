import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Product } from 'dova-shared';

export function useSupplierProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setProducts(await api<Product[]>('/suppliers/products'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = useCallback(
    async (id: string) => {
      setActionBusy(true);
      try {
        await api(`/suppliers/products/${id}`, { method: 'DELETE' });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  const activate = useCallback(
    async (id: string) => {
      setActionBusy(true);
      try {
        await api(`/suppliers/products/${id}/activate`, { method: 'PUT' });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  const adjustStock = useCallback(
    async (id: string, quantity: number, reason: 'restock' | 'damage') => {
      setActionBusy(true);
      try {
        await api(`/suppliers/products/${id}/stock`, {
          method: 'PUT',
          body: JSON.stringify({ quantity, reason }),
        });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  return { products, loading, error, actionBusy, reload: load, remove, activate, adjustStock };
}
