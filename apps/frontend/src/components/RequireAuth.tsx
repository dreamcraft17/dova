import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import type { Role } from 'dova-shared';
export function RequireAuth({ children, roles }: { children: ReactNode; roles?: Role[] }) { const { user, loading } = useAuth(); const router = useRouter(); useEffect(() => { if (!loading && !user) void router.replace('/auth/login'); else if (!loading && user && roles && !roles.includes(user.role)) void router.replace('/'); }, [loading, user, roles, router]); if (loading || !user || (roles && !roles.includes(user.role))) return <section className="form-page"><p>Checking your session…</p></section>; return <>{children}</>; }
