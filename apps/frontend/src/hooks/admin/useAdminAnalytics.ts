import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { OrderStatus } from 'dova-shared';

export type AdminAnalyticsSummary = {
  orders: number;
  sales: number;
  averageOrderValue: number;
  completionRate: number;
};

export type AdminAnalyticsTrendPoint = { date: string; orders: number; sales: number };
export type AdminAnalyticsStatusCount = { status: OrderStatus; count: number };
export type AdminAnalyticsBreakdown = { orders: number; sales: number };
export type AdminAnalyticsCategory = AdminAnalyticsBreakdown & { category: string };
export type AdminAnalyticsSupplier = AdminAnalyticsBreakdown & { supplier: string };

export type AdminAnalytics = {
  summary: AdminAnalyticsSummary;
  trend: AdminAnalyticsTrendPoint[];
  byStatus: AdminAnalyticsStatusCount[];
  byCategory: AdminAnalyticsCategory[];
  bySupplier: AdminAnalyticsSupplier[];
};

export function useAdminAnalytics(days: number) {
  const [data, setData] = useState<AdminAnalytics>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setData(await api<AdminAnalytics>(`/admin/analytics?days=${days}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics.');
    } finally {
      setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, loading, error, reload: load };
}
