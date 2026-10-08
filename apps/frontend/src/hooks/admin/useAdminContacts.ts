import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export type AdminContact = { id: string; name: string; email: string; message: string; status: string; createdAt: string };

export function useAdminContacts() {
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setContacts(await api<AdminContact[]>('/admin/contacts'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load contact messages.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return { contacts, loading, error, reload: load };
}
