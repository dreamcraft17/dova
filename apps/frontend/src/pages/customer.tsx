import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { RequireAuth } from '../components/RequireAuth';
import { api } from '../lib/api';
import type { Order } from 'dova-shared';

export default function Customer() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Order[]>('/orders')
      .then(setOrders)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <RequireAuth roles={['customer']}>
        <section className="cart-section">
          <div className="section-head">
            <h1>Your Orders</h1>
            <p>Track and review everything you have ordered on DOVA.</p>
          </div>
          <div className="orders-table" style={{ maxWidth: 1000, margin: '0 auto' }}>
            {loading ? (
              <Loading label="Loading your orders…" block />
            ) : orders.length ? (
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td data-label="Order">{o.orderNumber}</td>
                      <td data-label="Date">{new Date(o.createdAt).toLocaleDateString('en-NG')}</td>
                      <td data-label="Items">{o.items.length}</td>
                      <td data-label="Total">₦ {o.totalAmount.toLocaleString('en-NG')}</td>
                      <td data-label="Status">
                        <span className="badge">{o.status}</span>
                      </td>
                      <td data-label="">
                        <Link className="button small" href={`/customer/orders/${o.id}`}>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>
                No orders yet. <Link href="/products">Shop marketplace</Link>
              </p>
            )}
          </div>
        </section>
      </RequireAuth>
    </Layout>
  );
}
