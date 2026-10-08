import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { Role } from 'dova-shared';

export type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  isActive: boolean;
  phoneNumber?: string;
  emailVerifiedAt?: string;
  createdAt?: string;
};

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setUsers(await api<AdminUser[]>('/admin/users'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = useCallback(
    async (user: AdminUser) => {
      setActionBusy(true);
      try {
        await api(`/admin/users/${user.id}/active`, {
          method: 'PUT',
          body: JSON.stringify({ active: !user.isActive }),
        });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  return { users, loading, error, actionBusy, reload: load, toggleActive };
}
