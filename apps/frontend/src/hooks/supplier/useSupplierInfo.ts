import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export type SupplierInfo = {
  id: string;
  status: string;
  businessName: string;
  rejectionReason?: string;
  documentUrl?: string;
};

export function useSupplierInfo() {
  const [info, setInfo] = useState<SupplierInfo>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setInfo(await api<SupplierInfo>('/suppliers/status'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load supplier status.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { info, loading, error, reload: load };
}
