import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { SupplierStatus } from 'dova-shared';

export type AdminSupplier = {
  id: string;
  userId: string;
  businessName: string;
  contactName?: string;
  email?: string;
  phone?: string;
  location?: string;
  status: SupplierStatus;
  documentUrl?: string;
  productsCount?: number;
  verifiedAt?: string;
  createdAt: string;
  rejectionReason?: string;
};

export function useAdminSuppliers() {
  const [suppliers, setSuppliers] = useState<AdminSupplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setSuppliers(await api<AdminSupplier[]>('/admin/suppliers'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load suppliers.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const decide = useCallback(
    async (id: string, action: 'approve' | 'reject', reason?: string) => {
      setActionBusy(true);
      try {
        await api(`/admin/suppliers/${id}/${action}`, {
          method: 'POST',
          ...(reason ? { body: JSON.stringify({ reason }) } : {}),
        });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  return { suppliers, loading, error, actionBusy, reload: load, decide };
}
