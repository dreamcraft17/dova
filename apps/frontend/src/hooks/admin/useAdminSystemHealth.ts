import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export type HealthStatus = 'healthy' | 'degraded' | 'down' | 'not_configured';

export type SystemHealthCheck = {
  key: string;
  label: string;
  status: HealthStatus;
  latencyMs?: number;
  detail?: string;
};

export type SystemHealth = {
  status: HealthStatus;
  checkedAt: string;
  uptimeSeconds: number;
  environment: string;
  version: string;
  checks: SystemHealthCheck[];
};

export function useAdminSystemHealth() {
  const [health, setHealth] = useState<SystemHealth>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const reload = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setHealth(await api<SystemHealth>('/admin/system-health'));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load system health.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { health, loading, error, reload };
}
