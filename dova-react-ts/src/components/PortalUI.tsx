import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

type PortalUIContextValue = {
  menuOpen: boolean;
  toggleMenu: () => void;
  closeMenu: () => void;
  toast: string;
  showToast: (message: string) => void;
};

const PortalUIContext = createContext<PortalUIContextValue | null>(null);

export function PortalUIProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState('');

  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const closeMenu = useCallback(() => setMenuOpen(false), []);
  const showToast = useCallback((message: string) => setToast(message), []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 2600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const value = useMemo(
    () => ({ menuOpen, toggleMenu, closeMenu, toast, showToast }),
    [menuOpen, toggleMenu, closeMenu, toast, showToast],
  );

  return <PortalUIContext.Provider value={value}>{children}</PortalUIContext.Provider>;
}

export function usePortalUI(): PortalUIContextValue {
  const value = useContext(PortalUIContext);
  if (!value) throw new Error('usePortalUI must be used inside PortalUIProvider');
  return value;
}

export function Toast() {
  const { toast } = usePortalUI();
  return <div className={`toast${toast ? ' show' : ''}`}>{toast}</div>;
}
