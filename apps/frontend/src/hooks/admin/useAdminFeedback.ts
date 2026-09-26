import { FormEvent, useCallback, useEffect, useState } from 'react';
import { api } from '../../lib/api';
import type { FeedbackPost, FeedbackStatus } from 'dova-shared';

export function useAdminFeedback() {
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [actionBusy, setActionBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      setPosts(await api<FeedbackPost[]>('/feedback/posts?sort=new'));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load feedback.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const setStatus = useCallback(
    async (postId: string, status: FeedbackStatus) => {
      setActionBusy(true);
      try {
        await api(`/feedback/posts/${postId}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
        await load();
      } finally {
        setActionBusy(false);
      }
    },
    [load],
  );

  const sendOfficialReply = useCallback(async (postId: string, body: string) => {
    setActionBusy(true);
    try {
      await api(`/feedback/posts/${postId}/official-reply`, { method: 'POST', body: JSON.stringify({ body }) });
    } finally {
      setActionBusy(false);
    }
  }, []);

  const publishChangelog = useCallback(
    async (form: { title: string; summary: string; body: string }, e?: FormEvent) => {
      e?.preventDefault();
      setActionBusy(true);
      try {
        await api('/feedback/changelog', { method: 'POST', body: JSON.stringify(form) });
      } finally {
        setActionBusy(false);
      }
    },
    [],
  );

  return { posts, loading, error, actionBusy, reload: load, setStatus, sendOfficialReply, publishChangelog };
}
