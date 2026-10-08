import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Order, OrderStatus } from 'dova-shared';

export type AdminOrderSummary = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customerName: string;
};

export type AdminOrderDetail = Order & { customerName?: string };

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setOrders(await api<AdminOrderSummary[]>('/admin/orders'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { orders, loading, error, reload: load };
}

export function useAdminOrderDetail(id: string | undefined) {
  const [order, setOrder] = useState<AdminOrderDetail>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError(undefined);
    api<AdminOrderDetail>(`/admin/orders/${id}`)
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load order.'))
      .finally(() => setLoading(false));
  }, [id]);

  return { order, loading, error };
}
