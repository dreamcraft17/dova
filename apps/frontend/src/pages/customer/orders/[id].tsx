import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { RequireAuth } from '../../../components/RequireAuth';
import { api } from '../../../lib/api';
import type { Order } from 'dova-shared';

export default function OrderDetail() {
  const router = useRouter();
  const [order, setOrder] = useState<Order>();
  const [error, setError] = useState('');

  useEffect(() => {
    if (typeof router.query.id === 'string')
      api<Order>(`/orders/${router.query.id}`)
        .then(setOrder)
        .catch((e) => setError(e.message));
  }, [router.query.id]);

  return (
    <Layout>
      <RequireAuth roles={['customer']}>
        <section className="checkout-section">
          <div className="section-head">
            <p>
              <Link href="/customer" className="muted">
                ← Back to orders
              </Link>
            </p>
            {error ? (
              <p className="error">{error}</p>
            ) : !order ? (
              <p>Loading order…</p>
            ) : (
              <>
                <h1>{order.orderNumber}</h1>
                <p>
                  <span className="badge">{order.status}</span> ·{' '}
                  {new Date(order.createdAt).toLocaleString('en-NG')}
                </p>
              </>
            )}
          </div>

          {order && (
            <div className="checkout-wrapper">
              <div className="checkout-form">
                <h3>Delivery</h3>
                <p>
                  <strong>{order.deliveryName}</strong>
                  <br />
                  {order.deliveryAddress}
                  <br />
                  {order.deliveryPhone}
                </p>
              </div>
              <div className="order-summary">
                <h3>Order Summary</h3>
                {order.items.map((item) => (
                  <div className="summary-item" key={item.id}>
                    <span>
                      {item.product.name} × {item.quantity}
                    </span>
                    <span>₦ {item.subtotal.toLocaleString('en-NG')}</span>
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
