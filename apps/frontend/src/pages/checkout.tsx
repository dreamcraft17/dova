import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import type { Cart, Order } from 'dova-shared';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { refresh } = useCart();
  const [cart, setCart] = useState<Cart>();
  const [form, setForm] = useState({
    deliveryName: '',
    deliveryAddress: '',
    deliveryPhone: '',
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user)
      setForm((current) => ({
        ...current,
        deliveryName: current.deliveryName || user.fullName,
        deliveryPhone: current.deliveryPhone || user.phoneNumber || '',
      }));
    api<Cart>('/cart')
      .then(setCart)
      .catch(() => setError('Please log in before checkout.'));
  }, [user]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const order = await api<Order>('/orders', { method: 'POST', body: JSON.stringify(form) });
      await refresh();
      const payment = await api<{ authorization_url: string }>('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id, amount: order.totalAmount }),
      });
      window.location.href = payment.authorization_url;
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Layout>
      <section className="checkout-section">
        <div className="section-head">
          <h1>Checkout</h1>
          <p>Complete your order by filling in the information below.</p>
        </div>

        {cart?.items.length ? (
          <div className="checkout-wrapper">
            <div className="checkout-form">
              <h3>Customer Information</h3>
              <form onSubmit={submit}>
                <label>Full Name</label>
                <input
                  required
                  placeholder="Full Name"
                  value={form.deliveryName}
                  onChange={(e) => setForm({ ...form, deliveryName: e.target.value })}
                />
                <label>Phone Number</label>
                <input
                  required
                  placeholder="Phone Number"
                  value={form.deliveryPhone}
                  onChange={(e) => setForm({ ...form, deliveryPhone: e.target.value })}
                />
                <label>Shipping Address</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Shipping Address"
                  value={form.deliveryAddress}
                  onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                />
                <label>Payment Method</label>
                <select defaultValue="paystack" disabled>
                  <option value="paystack">Paystack (Card / Transfer)</option>
                </select>
                <button className="confirm-btn" disabled={busy}>
                  {busy ? 'Redirecting…' : 'Confirm Order'}
                </button>
                {error && <p className="error">{error}</p>}
              </form>
            </div>

            <div className="order-summary">
              <h3>Order Summary</h3>
              {cart.items.map((i) => (
                <div className="summary-item" key={i.id}>
                  <span>
                    {i.product.name} × {i.quantity}
                  </span>
                  <span>₦ {i.subtotal.toLocaleString('en-NG')}</span>
                </div>
              ))}
              <hr />
              <div className="summary-item">
                <strong>Total</strong>
                <strong>₦ {cart.total.toLocaleString('en-NG')}</strong>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <p>{error || 'Your cart is empty.'}</p>
            <Link className="button" href="/cart">
              Back to cart
            </Link>
          </div>
        )}
      </section>
    </Layout>
  );
}
