import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import type { Cart } from 'dova-shared';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

type CartContextValue = { cart: Cart | null; count: number; refresh: () => Promise<void> };

const CartContext = createContext<CartContextValue | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);

  const refresh = async () => {
    if (user?.role !== 'customer') {
      setCart(null);
      return;
    }
    try {
      setCart(await api<Cart>('/cart'));
    } catch {
      setCart(null);
    }
  };

  useEffect(() => {
    void refresh();
  }, [user?.id, user?.role]);

  const value = useMemo(
    () => ({
      cart,
      // Badge = distinct line items, not total kg/L quantity (BUG-011).
      count: cart?.items.length ?? 0,
      refresh,
    }),
    [cart, user?.id],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
