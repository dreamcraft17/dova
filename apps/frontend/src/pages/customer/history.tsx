import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { RequireAuth } from '../../components/RequireAuth';
import { api } from '../../lib/api';
import { startOrderPayment } from '../../lib/payment';
import type { Order, OrderStatus } from 'dova-shared';
import { formatQuantityWithUnit } from 'dova-shared';

const STATUS_LABELS: Record<OrderStatus | 'all', string> = {
  all: 'All',
  pending: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

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

function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      style={{
        display: 'inline-block',
        padding: '3px 10px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        textTransform: 'capitalize',
        background: STATUS_BG[status],
        color: STATUS_COLORS[status],
      }}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export default function PurchaseHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [search, setSearch] = useState('');
  const [payingOrderId, setPayingOrderId] = useState<string | null>(null);

  useEffect(() => {
    api<Order[]>('/orders')
      .then(setOrders)
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchSearch =
        !q ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.items.some((i) => i.product.name.toLowerCase().includes(q));
      return matchStatus && matchSearch;
    });
  }, [orders, statusFilter, search]);

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<OrderStatus | 'all', number>> = { all: orders.length };
    orders.forEach((o) => {
      counts[o.status] = (counts[o.status] ?? 0) + 1;
    });
    return counts;
  }, [orders]);

  async function payNow(order: Order) {
    setPayingOrderId(order.id);
    try {
      await startOrderPayment(order.id, order.totalAmount, api);
    } catch (e) {
      setError((e as Error).message);
      setPayingOrderId(null);
    }
  }

  return (
    <Layout>
      <RequireAuth roles={['customer']}>
        <section className="cart-section">
          {/* Header */}
          <div className="section-head">
            <h1>Purchase History</h1>
            <p>All your orders in one place. Click an order to see the full details.</p>
          </div>

          {/* Status filter pills */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {(Object.keys(STATUS_LABELS) as Array<OrderStatus | 'all'>).map((s) => {
              const count = statusCounts[s] ?? 0;
              if (s !== 'all' && count === 0) return null;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStatusFilter(s)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: statusFilter === s ? '2px solid var(--green)' : '1px solid var(--line)',
                    background: statusFilter === s ? 'var(--mint)' : '#fff',
                    color: statusFilter === s ? 'var(--green)' : 'var(--muted)',
                    fontWeight: statusFilter === s ? 700 : 400,
                    fontSize: 13,
                    cursor: 'pointer',
                  }}
                >
                  {STATUS_LABELS[s]}
                  {count > 0 && (
                    <span
                      style={{
                        marginLeft: 6,
                        background: statusFilter === s ? 'var(--green)' : 'var(--line)',
                        color: statusFilter === s ? '#fff' : 'var(--muted)',
                        borderRadius: 10,
                        padding: '0 6px',
                        fontSize: 11,
                      }}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ marginBottom: 24 }}>
            <input
              type="search"
              placeholder="Search by order number or product name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                maxWidth: 440,
                padding: '9px 14px',
                borderRadius: 8,
                border: '1px solid var(--line)',
                fontSize: 14,
              }}
            />
          </div>

          {/* Content */}
          {loading ? (
            <Loading label="Loading your purchase history…" block />
          ) : error ? (
            <p className="error">{error}</p>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
              {orders.length === 0 ? (
                <>
                  <p style={{ fontSize: 16 }}>You haven&apos;t placed any orders yet.</p>
                  <Link className="button" href="/products" style={{ marginTop: 12, display: 'inline-block' }}>
                    Browse Products
                  </Link>
                </>
              ) : (
                <p>No orders match your filter.</p>
              )}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filtered.map((order) => (
                <div
                  key={order.id}
                  style={{
                    background: '#fff',
                    border: '1px solid var(--line)',
                    borderRadius: 12,
                    padding: '20px 24px',
                    boxShadow: 'var(--shadow)',
                  }}
                >
                  {/* Order header row */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      flexWrap: 'wrap',
                      gap: 8,
                      marginBottom: 14,
                    }}
                  >
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{order.orderNumber}</span>
                      <span style={{ color: 'var(--muted)', fontSize: 13, marginLeft: 12 }}>
                        {new Date(order.createdAt).toLocaleDateString('en-NG', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <StatusBadge status={order.status} />
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
                    </div>
                  </div>

                  {/* Items list */}
                  <div
                    style={{
                      borderTop: '1px solid var(--line)',
                      paddingTop: 12,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 4,
                        }}
                      >
                        <span style={{ fontSize: 14, color: '#333' }}>
                          {item.product.name}
                          <span style={{ color: 'var(--muted)', marginLeft: 8, fontSize: 13 }}>
                            ×{' '}
                            {formatQuantityWithUnit(
                              item.quantity,
                              item.product.name,
                              item.product.categoryName,
                            )}
                          </span>
                        </span>
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          ₦ {item.subtotal.toLocaleString('en-NG')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order footer */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: 14,
                      paddingTop: 12,
                      borderTop: '1px solid var(--line)',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontWeight: 700, fontSize: 15 }}>
                      Total: ₦ {order.totalAmount.toLocaleString('en-NG')}
                    </span>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {order.status === 'pending' && (
                        <button
                          type="button"
                          className="button small confirm-btn"
                          disabled={payingOrderId === order.id}
                          onClick={() => void payNow(order)}
                        >
                          {payingOrderId === order.id ? 'Redirecting…' : 'Complete payment'}
                        </button>
                      )}
                      <Link
                        className="button small"
                        href={`/customer/orders/${order.id}`}
                        style={{ textDecoration: 'none' }}
                      >
                        View Details →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Back link */}
          <div style={{ marginTop: 32 }}>
            <Link href="/customer/profile" className="muted" style={{ fontSize: 14 }}>
              ← Back to profile
            </Link>
          </div>
        </section>
      </RequireAuth>
    </Layout>
  );
}
