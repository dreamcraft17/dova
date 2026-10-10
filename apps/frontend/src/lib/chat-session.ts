import { api } from './api';

/** Clears the signed-in chat once per browser reload, while preserving normal in-app navigation. */
export async function resetChatHistoryOnReload() {
  if (typeof window === 'undefined') return false;
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined;
  if (navigation?.type !== 'reload') return false;

  const loadId = String(performance.timeOrigin);
  const resetKey = 'dova-ai-history-reset-load';
  if (window.sessionStorage.getItem(resetKey) === loadId) return false;

  try {
    await api('/chat/history', { method: 'DELETE' });
    window.sessionStorage.setItem(resetKey, loadId);
    return true;
  } catch {
    return false;
  }
}
