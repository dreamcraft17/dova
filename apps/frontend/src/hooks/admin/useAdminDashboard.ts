import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { FeedbackPost, OrderStatus } from 'dova-shared';

export type AdminDashboardStats = {
  users: number;
  suppliers: number;
  products: number;
  orders: number;
  pendingSuppliers: number;
};

export type AdminDashboardUser = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  isActive: boolean;
};

export type AdminDashboardOrder = {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  customerName: string;
};

export function useAdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats>();
  const [users, setUsers] = useState<AdminDashboardUser[]>([]);
  const [orders, setOrders] = useState<AdminDashboardOrder[]>([]);
  const [feedbackPosts, setFeedbackPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const [s, u, o, fb] = await Promise.all([
        api<AdminDashboardStats>('/admin/dashboard'),
        api<AdminDashboardUser[]>('/admin/users'),
        api<AdminDashboardOrder[]>('/admin/orders'),
        api<FeedbackPost[]>('/feedback/posts?sort=new'),
      ]);
      setStats(s);
      setUsers(u);
      setOrders(o);
      setFeedbackPosts(fb);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { stats, users, orders, feedbackPosts, loading, error, reload: load };
}
