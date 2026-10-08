import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export type SupplierOrder = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  itemId: string;
  productName: string;
  quantity: number;
  subtotal: number;
  status: string;
  deliveryAddress: string;
  createdAt: string;
};

export function useSupplierOrders() {
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setOrders(await api<SupplierOrder[]>('/suppliers/orders'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = useCallback(
    async (itemId: string, value: string) => {
      setActionBusy(true);
      try {
        await api(`/suppliers/orders/${itemId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status: value }),
        });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  return { orders, loading, error, actionBusy, reload: load, setStatus };
}
