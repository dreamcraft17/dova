import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../components/Layout';
import { Loading, LoadingOverlay } from '../components/Loading';
import { ProductImage } from '../components/ProductImage';
import { RequireAuth } from '../components/RequireAuth';
import { ApiError, api } from '../lib/api';
import type { Cart } from 'dova-shared';
import { formatPricePerUnit, formatQuantityWithUnit, productUnit } from 'dova-shared';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});
  const { refresh } = useCart();

  const load = () => {
    setLoading(true);
    setError('');
    return api<Cart>('/cart')
      .then((data) => {
        setCart(data);
        const inputs: Record<string, string> = {};
        data.items.forEach((item) => { inputs[item.id] = item.quantity.toString(); });
        setQtyInputs(inputs);
      })
      .catch((err: unknown) => {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setError('Your session expired. Please log in again.');
            return;
          }
          if (err.status === 403) {
            setError('The cart is available for customer accounts only.');
            return;
          }
          setError(err.message);
          return;
        }
        setError('Unable to load your cart. Please try again.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      void router.replace('/auth/login?next=/cart');
      return;
    }
    if (user.role !== 'customer') {
      setError('The cart is available for customer accounts only.');
      setLoading(false);
      return;
    }
    void load();
  }, [authLoading, user?.id, user?.role, router]);

  async function update(id: string, quantity: number) {
    setBusy(true);
    try {
      const updated = await api<Cart>(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
      setCart(updated);
      const inputs: Record<string, string> = {};
      updated.items.forEach((item) => { inputs[item.id] = item.quantity.toString(); });
      setQtyInputs(inputs);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function updateSlot(id: string, deliverySlot: 'morning' | 'evening') {
    setBusy(true);
    try {
      const updated = await api<Cart>(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ deliverySlot }) });
      setCart(updated);
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      setCart(await api<Cart>(`/cart/items/${id}`, { method: 'DELETE' }));
      await refresh();
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || (loading && !error && !cart)) {
    return (
      <Layout>
        <section className="cart-section">
          <Loading label="Loading your cart…" block />
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <RequireAuth roles={['customer']}>
        <section className="cart-section">
          <div className="section-head">
            <h1>Shopping Cart</h1>
            <p>Review your selected products before checkout.</p>
          </div>

          {error ? (
            <div style={{ textAlign: 'center' }}>
              <p>{error}</p>
              {error.includes('log in') ? (
                <Link className="button" href="/auth/login?next=/cart">
                  Log in
                </Link>
              ) : (
                <button type="button" className="button" onClick={() => void load()}>
                  Retry
                </button>
              )}
            </div>
          ) : cart?.items.length ? (
            <>
              <div className={`cart-wrapper${busy ? ' is-busy' : ''}`}>
                {busy ? <LoadingOverlay label="Updating cart…" /> : null}
                {cart.items.map((i) => {
                  const unit = productUnit(i.product.name, i.product.categoryName);
                  return (
                  <div className="cart-item" key={i.id}>
                    <ProductImage
                      name={i.product.name}
                      imageUrl={i.product.imageUrl}
                      categoryName={i.product.categoryName}
                      decorative={false}
                    />
                    <div className="cart-info">
                      <h3>{i.product.name}</h3>
                      <p>Supplier: {i.product.supplierName || 'DOVA Supplier'}</p>
                      <h4>
                        ₦ {i.product.price.toLocaleString('en-NG')} {formatPricePerUnit(unit)}
                      </h4>
                      <div className="cart-slot">
                        <span className="cart-slot-label">🚚 Delivery slot:</span>
                        <button
                          type="button"
                          className={`slot-pill${i.deliverySlot === 'morning' ? ' active' : ''}`}
                          disabled={busy}
                          onClick={() => void updateSlot(i.id, 'morning')}
                        >
                          🌅 Morning
                        </button>
                        <button
                          type="button"
                          className={`slot-pill${i.deliverySlot === 'evening' ? ' active' : ''}`}
                          disabled={busy}
                          onClick={() => void updateSlot(i.id, 'evening')}
                        >
                          🌇 Evening
                        </button>
                      </div>
                    </div>
                    <div className="cart-quantity">
                      <input
                        type="number"
                        min={1}
                        max={i.product.stockQuantity}
                        step={0.01}
                        value={qtyInputs[i.id] ?? i.quantity.toString()}
                        disabled={busy}
                        onChange={(e) => {
                          setQtyInputs((prev) => ({ ...prev, [i.id]: e.target.value }));
                        }}
                        onBlur={(e) => {
                          const val = parseFloat(e.target.value);
                          const clamped = isNaN(val) ? 1 : Math.max(1, Math.min(i.product.stockQuantity, Math.round(val * 100) / 100));
                          setQtyInputs((prev) => ({ ...prev, [i.id]: clamped.toString() }));
                          if (clamped !== i.quantity) {
                            void update(i.id, clamped);
                          }
                        }}
                        style={{ textAlign: 'center' }}
                      />
                      <span style={{ fontSize: 13, color: 'var(--muted)' }}>{unit}</span>
                    </div>
                    <div className="cart-total">₦ {i.subtotal.toLocaleString('en-NG')}</div>
                    <button className="remove-btn" disabled={busy} onClick={() => void remove(i.id)}>
                      Remove
                    </button>
                  </div>
                  );
                })}
              </div>
              <div className="cart-summary">
                <h2>Order Summary</h2>
                <p>
                  Subtotal <span>₦ {cart.total.toLocaleString('en-NG')}</span>
                </p>
                <p className="form-hint" style={{ display: 'block', marginBottom: 16 }}>
                  Minimum checkout: pickup ₦3,000 · delivery ₦5,000. Choose at checkout.
                </p>
                <Link className="checkout-btn" href="/checkout" style={{ display: 'block', textAlign: 'center' }}>
                  Proceed to Checkout
                </Link>
              </div>
            </>
          ) : (
            <p style={{ textAlign: 'center' }}>
              Your cart is empty. <Link href="/products">Explore products</Link>
            </p>
          )}
        </section>
      </RequireAuth>
    </Layout>
  );
}
