import { useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';

export type AdminAiQuestion = {
  id: string;
  userId?: string;
  userName?: string;
  userEmail?: string;
  text: string;
  createdAt: string;
};

export function useAdminAiQuestions(search: string) {
  const [questions, setQuestions] = useState<AdminAiQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      const query = search.trim() ? `?search=${encodeURIComponent(search.trim())}` : '';
      setQuestions(await api<AdminAiQuestion[]>(`/admin/ai-questions${query}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load AI questions.');
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    void load();
  }, [load]);

  return { questions, loading, error, reload: load };
}
