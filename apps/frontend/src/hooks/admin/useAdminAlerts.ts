import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../lib/api';
import { countPendingProducts, type AdminAlertCounts } from '../../lib/admin-alerts';

const POLL_MS = 120_000;

type DashboardStats = { pendingSuppliers: number };

/** Counts of things waiting on an admin, from existing endpoints. A source that fails to load is left undefined, not zero. */
export function useAdminAlerts() {
  const [counts, setCounts] = useState<AdminAlertCounts>({});
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const inFlight = useRef(false);

  const refresh = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    try {
      const [stats, products, payouts] = await Promise.allSettled([
        api<DashboardStats>('/admin/dashboard'),
        api<Array<{ approvalStatus?: string }>>('/admin/products'),
        api<unknown[]>('/admin/reimbursements/pending'),
      ]);
      setCounts({
        suppliers: stats.status === 'fulfilled' ? stats.value.pendingSuppliers : undefined,
        products: products.status === 'fulfilled' ? countPendingProducts(products.value) : undefined,
        payouts: payouts.status === 'fulfilled' && Array.isArray(payouts.value) ? payouts.value.length : undefined,
      });
      setFailed([stats, products, payouts].every((result) => result.status === 'rejected'));
    } finally {
      inFlight.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, POLL_MS);
    return () => window.clearInterval(timer);
  }, [refresh]);

  return { counts, loading, failed, refresh };
}
