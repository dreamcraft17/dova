import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { Loading } from '../../../components/Loading';
import { RequireAuth } from '../../../components/RequireAuth';
import { api } from '../../../lib/api';
import type { Order, OrderStatus } from 'dova-shared';
import { formatQuantityWithUnit } from 'dova-shared';
import { useToast } from '../../../context/ToastContext';
import { useCart } from '../../../context/CartContext';

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: '#b45309',
  paid: '#1d4ed8',
  processing: '#6d28d9',
  shipped: '#0369a1',
  delivered: '#15803d',
  cancelled: '#b91c1c',
};

const STATUS_BG: Record<OrderStatus, string> = {
  pending: '#fef3c7',
  paid: '#dbeafe',
  processing: '#ede9fe',
  shipped: '#e0f2fe',
  delivered: '#dcfce7',
  cancelled: '#fee2e2',
};

export default function OrderDetail() {
  const router = useRouter();
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState('');
  const [reordering, setReordering] = useState(false);
  const { showToast } = useToast();
  const { refresh: refreshCart } = useCart();

  useEffect(() => {
    if (typeof router.query.id === 'string')
      api<Order>(`/orders/${router.query.id}`)
        .then(setOrder)
        .catch((e: Error) => setError(e.message));
  }, [router.query.id]);

  async function reorder() {
    if (!order) return;
    setReordering(true);
    try {
      // Add all items from this order back to cart one by one
      for (const item of order.items) {
        await api('/cart/add', {
          method: 'POST',
          body: JSON.stringify({
            productId: item.product.id,
            quantity: item.quantity,
            deliverySlot: 'morning',
          }),
        });
      }
      await refreshCart();
      showToast('Items added to cart! Redirecting…', 'success');
      void router.push('/cart');
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setReordering(false);
    }
  }

  return (
    <Layout>
      <RequireAuth roles={['customer']}>
        <section className="checkout-section">
          <div className="section-head">
            <p>
              <Link href="/customer/history" className="muted">
                ← Back to purchase history
              </Link>
            </p>

            {error ? (
              <p className="error">{error}</p>
            ) : !order ? (
              <Loading label="Loading order…" block />
            ) : (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <h1 style={{ marginBottom: 8 }}>{order.orderNumber}</h1>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    {/* Status badge */}
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '3px 12px',
                        borderRadius: 20,
                        fontSize: 12,
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        background: STATUS_BG[order.status],
                        color: STATUS_COLORS[order.status],
                      }}
                    >
                      {order.status}
                    </span>
                    {/* Fulfillment badge */}
                    {order.fulfillmentType && (
                      <span
                        style={{
                          fontSize: 12,
                          color: 'var(--muted)',
                          background: '#f5f5f5',
                          borderRadius: 20,
                          padding: '3px 10px',
                          textTransform: 'capitalize',
                        }}
                      >
                        {order.fulfillmentType === 'pickup' ? '🏪 Pickup' : '🚚 Delivery'}
                      </span>
                    )}
                    <span style={{ color: 'var(--muted)', fontSize: 13 }}>
                      {new Date(order.createdAt).toLocaleString('en-NG', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>

                {/* Re-order button — shown when order is paid/delivered */}
                {(order.status === 'delivered' || order.status === 'paid') && (
                  <button
                    type="button"
                    className="button small"
                    disabled={reordering}
                    onClick={() => void reorder()}
                  >
                    {reordering ? <Loading label="Adding to cart…" inline size="sm" /> : '🔁 Re-order'}
                  </button>
                )}
              </div>
            )}
          </div>

          {order && (
            <div className="checkout-wrapper">
              {/* Delivery info */}
              <div className="checkout-form">
                <h3>
                  {order.fulfillmentType === 'pickup' ? '🏪 Pickup Details' : '🚚 Delivery Details'}
                </h3>
                <p>
                  <strong>{order.deliveryName}</strong>
                  <br />
                  {order.deliveryAddress}
                  <br />
                  {order.deliveryPhone}
                </p>

                {order.paymentVerifiedAt && (
                  <p style={{ marginTop: 16, fontSize: 13, color: 'var(--muted)' }}>
                    ✅ Payment confirmed{' '}
                    {new Date(order.paymentVerifiedAt).toLocaleDateString('en-NG', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>

              {/* Order summary */}
              <div className="order-summary">
                <h3>Order Items</h3>
                {order.items.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <span>
                      {item.product.name}
                      <span
                        style={{
                          display: 'block',
                          fontSize: 12,
                          color: 'var(--muted)',
                          marginTop: 2,
                        }}
                      >
                        {formatQuantityWithUnit(
                          item.quantity,
                          item.product.name,
                          item.product.categoryName,
                        )}{' '}
                        × ₦ {item.unitPrice.toLocaleString('en-NG')}
                      </span>
                    </span>
                    <span style={{ fontWeight: 600 }}>
                      ₦ {item.subtotal.toLocaleString('en-NG')}
                    </span>
                  </div>
                ))}
                <hr />
                <div className="summary-item">
                  <strong>Total</strong>
                  <strong>₦ {order.totalAmount.toLocaleString('en-NG')}</strong>
                </div>
              </div>
            </div>
          )}
        </section>
      </RequireAuth>
    </Layout>
  );
}
