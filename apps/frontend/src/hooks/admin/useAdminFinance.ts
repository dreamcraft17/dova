import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export type FinanceEntry = {
  id: string; orderNumber: string; customerName: string; amount: number; orderTotal: number;
  status: string; orderStatus: string; paymentReference?: string;
  fulfillmentType: 'pickup' | 'delivery'; createdAt: string; verifiedAt?: string;
};
export type FinanceException = {
  id: string; orderId: string; orderNumber: string; customerName: string; amount?: number;
  status: string; paymentReference?: string; detail: string; createdAt: string;
};
export type AdminFinance = {
  currency: string; period: string;
  summary: { grossSales: number; collectedSales: number; pendingPayments: number; cancelledOrders: number; pendingSettlements: number; supplierPayouts: number | null; logisticsPayouts: number | null; refunds: number | null };
  ledger: FinanceEntry[]; exceptions: FinanceException[];
  reimbursement?: { available: number; pending: number; paidOut: number };
  capabilities: { supplierPayouts: boolean; logisticsPayouts: boolean; refunds: boolean; note: string };
};

export function useAdminFinance() {
  const [finance, setFinance] = useState<AdminFinance>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const reload = useCallback(async () => {
    setLoading(true); setError(undefined);
    try { setFinance(await api<AdminFinance>('/admin/finance')); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to load finance data.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void reload(); }, [reload]);
  return { finance, loading, error, reload };
}
