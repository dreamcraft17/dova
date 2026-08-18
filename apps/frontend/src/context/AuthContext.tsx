import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import type { User } from 'dova-shared';
import { api } from '../lib/api';
import { clearTokens } from '../lib/auth-session';
type AuthContextValue = { user: User | null; loading: boolean; refresh: () => Promise<void>; logout: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refresh = async () => {
    try { setUser(await api<User>('/auth/me')); } catch { setUser(null); } finally { setLoading(false); }
  };
  useEffect(() => { void refresh(); }, []);
  const logout = async () => {
    try { await api('/auth/logout', { method: 'POST' }); } catch { clearTokens(); } finally { setUser(null); }
  };
  const value = useMemo(() => ({ user, loading, refresh, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error('useAuth must be used inside AuthProvider'); return context; }
