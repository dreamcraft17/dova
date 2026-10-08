import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export type AdminAuditLog = {
  id: string;
  actorUserId?: string;
  actorName?: string;
  actorEmail?: string;
  actorRole?: string;
  action: string;
  category: string;
  method: string;
  path: string;
  resourceId?: string;
  statusCode: number;
  details: Record<string, unknown>;
  createdAt: string;
};

export function useAdminAuditLogs(search: string, category: string) {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (category) params.set('category', category);
      const query = params.toString();
      setLogs(await api<AdminAuditLog[]>(`/admin/audit-logs${query ? `?${query}` : ''}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { logs, loading, error, reload: load };
}
