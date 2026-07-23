import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { RequireAuth } from '../components/RequireAuth';
import { api } from '../lib/api';
import type { Order } from 'dova-shared';

export default function Customer() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api<Order[]>('/orders').then(setOrders).catch(() => undefined);
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
            {orders.length ? (
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
                      <td>{o.orderNumber}</td>
                      <td>{new Date(o.createdAt).toLocaleDateString('en-NG')}</td>
                      <td>{o.items.length}</td>
                      <td>₦ {o.totalAmount.toLocaleString('en-NG')}</td>
                      <td>
                        <span className="badge">{o.status}</span>
                      </td>
                      <td>
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
