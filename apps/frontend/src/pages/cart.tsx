import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import type { Cart } from 'dova-shared';
import { useCart } from '../context/CartContext';

export default function CartPage() {
  const [cart, setCart] = useState<Cart>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { refresh } = useCart();

  const load = () =>
    api<Cart>('/cart')
      .then(setCart)
      .catch(() => setError('Please log in to view your cart.'));

  useEffect(() => {
    void load();
  }, []);

  async function update(id: string, quantity: number) {
    setBusy(true);
    try {
      setCart(await api<Cart>(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) }));
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

  return (
    <Layout>
      <section className="cart-section">
        <div className="section-head">
          <h1>Shopping Cart</h1>
          <p>Review your selected products before checkout.</p>
        </div>

        {error ? (
          <div style={{ textAlign: 'center' }}>
            <p>{error}</p>
            <Link className="button" href="/auth/login">
              Log in
            </Link>
          </div>
        ) : cart?.items.length ? (
          <>
            <div className="cart-wrapper">
              {cart.items.map((i) => (
                <div className="cart-item" key={i.id}>
                  {i.product.imageUrl ? (
                    <img src={i.product.imageUrl} alt={i.product.name} />
                  ) : (
                    <div className="cart-thumb">🌿</div>
                  )}
                  <div className="cart-info">
                    <h3>{i.product.name}</h3>
                    <p>Supplier: {i.product.supplierName || 'DOVA Supplier'}</p>
                    <h4>₦ {i.product.price.toLocaleString('en-NG')}</h4>
                  </div>
                  <div className="cart-quantity">
                    <button
                      disabled={busy || i.quantity <= 1}
                      onClick={() => void update(i.id, i.quantity - 1)}
                    >
                      −
                    </button>
                    <strong>{i.quantity}</strong>
                    <button
                      disabled={busy || i.quantity >= i.product.stockQuantity}
                      onClick={() => void update(i.id, i.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="cart-total">₦ {i.subtotal.toLocaleString('en-NG')}</div>
                  <button className="remove-btn" disabled={busy} onClick={() => void remove(i.id)}>
                    Remove
                  </button>
                </div>
              ))}
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
    </Layout>
  );
}
