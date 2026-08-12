import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { api } from '../lib/api';
import { resolvePaymentRedirectUrl } from '../lib/payment';
import type { Cart, FulfillmentType, Order } from 'dova-shared';
import { minOrderFor, minOrderMessage } from 'dova-shared';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Checkout() {
  const { user } = useAuth();
  const { refresh } = useCart();
  const [cart, setCart] = useState<Cart>();
  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>('delivery');
  const [form, setForm] = useState({
    deliveryName: '',
    deliveryAddress: '',
    deliveryPhone: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
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
      .catch(() => setError('Please log in before checkout.'))
      .finally(() => setLoading(false));
  }, [user]);

  const minRequired = minOrderFor(fulfillmentType);
  const shortfallMessage = useMemo(
    () => (cart ? minOrderMessage(cart.total, fulfillmentType) : undefined),
    [cart, fulfillmentType],
  );

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (shortfallMessage) {
      setError(shortfallMessage);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const payload = {
        ...form,
        fulfillmentType,
        deliveryAddress:
          fulfillmentType === 'pickup' ? form.deliveryAddress || 'Pickup at DOVA hub' : form.deliveryAddress,
      };
      const order = await api<Order>('/orders', { method: 'POST', body: JSON.stringify(payload) });
      await refresh();
      const payment = await api<{ authorization_url: string }>('/payments/initialize', {
        method: 'POST',
        body: JSON.stringify({ orderId: order.id, amount: order.totalAmount }),
      });
      window.location.href = resolvePaymentRedirectUrl(payment.authorization_url);
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

        {loading ? (
          <Loading label="Loading checkout…" block />
        ) : cart?.items.length ? (
          <div className="checkout-wrapper">
            <div className="checkout-form">
              <h3>Customer Information</h3>
              <form onSubmit={submit}>
                <label>Fulfillment</label>
                <div className="fulfillment-options">
                  <label className="fulfillment-option">
                    <input
                      type="radio"
                      name="fulfillment"
                      checked={fulfillmentType === 'pickup'}
                      onChange={() => setFulfillmentType('pickup')}
                    />
                    Pickup (min ₦{MIN_PICKUP})
                  </label>
                  <label className="fulfillment-option">
                    <input
                      type="radio"
                      name="fulfillment"
                      checked={fulfillmentType === 'delivery'}
                      onChange={() => setFulfillmentType('delivery')}
                    />
                    Home delivery (min ₦{MIN_DELIVERY})
                  </label>
                </div>

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
                {fulfillmentType === 'delivery' ? (
                  <>
                    <label>Shipping Address</label>
                    <textarea
                      required
                      rows={4}
                      placeholder="Shipping Address"
                      value={form.deliveryAddress}
                      onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                    />
                  </>
                ) : (
                  <p className="form-hint">Collect your order at the DOVA pickup point after payment.</p>
                )}
                <label>Payment Method</label>
                <select defaultValue="paystack" disabled>
                  <option value="paystack">Paystack (Card / Transfer)</option>
                </select>
                {shortfallMessage && <p className="error">{shortfallMessage}</p>}
                <button className="confirm-btn" disabled={busy || Boolean(shortfallMessage)}>
                  {busy ? <Loading label="Redirecting…" inline size="sm" /> : 'Confirm Order'}
                </button>
                {error && <p className="error">{error}</p>}
              </form>
            </div>

            <div className="order-summary">
              <h3>Order Summary</h3>
              {cart.items.map((i) => (
                <div className="summary-item" key={i.id}>
                  <span>
                    {i.product.name} × {Number.isInteger(i.quantity) ? i.quantity : i.quantity.toFixed(2)} kg
                  </span>
                  <span>₦ {i.subtotal.toLocaleString('en-NG')}</span>
                </div>
              ))}
              <hr />
              <div className="summary-item">
                <span>Minimum ({fulfillmentType})</span>
                <span>₦ {minRequired.toLocaleString('en-NG')}</span>
              </div>
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

const MIN_PICKUP = '3,000';
const MIN_DELIVERY = '5,000';
