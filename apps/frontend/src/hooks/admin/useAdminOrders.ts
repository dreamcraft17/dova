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

  const updateStatus = useCallback(async (status: 'processing' | 'shipped' | 'delivered') => {
    if (!id) throw new Error('Order id is missing.');
    await api(`/admin/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    const latest = await api<AdminOrderDetail>(`/admin/orders/${id}`);
    setOrder(latest);
    return latest;
  }, [id]);

  return { order, loading, error, updateStatus };
}
