import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { Loading, LoadingOverlay } from '../../components/Loading';
import { ProductImage } from '../../components/ProductImage';
import { RequireAuth } from '../../components/RequireAuth';
import { ApiError, api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import type { Cart, Order, OrderStatus } from 'dova-shared';
import { formatPricePerUnit, formatQuantityWithUnit, productUnit } from 'dova-shared';

type Tab = 'profile' | 'history' | 'cart';

const STATUS_BG: Record<OrderStatus, string> = {
  pending: '#fef3c7', paid: '#dbeafe', processing: '#ede9fe',
  shipped: '#e0f2fe', delivered: '#dcfce7', cancelled: '#fee2e2',
};
const STATUS_COLOR: Record<OrderStatus, string> = {
  pending: '#b45309', paid: '#1d4ed8', processing: '#6d28d9',
  shipped: '#0369a1', delivered: '#15803d', cancelled: '#b91c1c',
};

/* ── SVG icons ── */
const IconUser = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
const IconOrders = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
);
const IconCart = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
);
const IconEmail = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
);
const IconShield = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
);

/* ── Profile tab ── */
function ProfileTab({ user }: { user: NonNullable<ReturnType<typeof useAuth>['user']> }) {
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  const rows = [
    { icon: <IconUser />, label: 'Full Name', value: user.fullName },
    { icon: <IconEmail />, label: 'Email', value: user.email },
    ...(user.phoneNumber ? [{ icon: <IconShield />, label: 'Phone', value: user.phoneNumber }] : []),
    { icon: <IconShield />, label: 'Account Type', value: 'Customer' },
    { icon: <IconShield />, label: 'Member Since', value: memberSince },
  ];
  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--green)' }}>Profile Information</h2>
      <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 14, overflow: 'hidden' }}>
        {rows.map((row, idx) => (
          <div key={row.label} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 20px',
            borderBottom: idx < rows.length - 1 ? '1px solid var(--line)' : 'none',
          }}>
            <span style={{ color: 'var(--green)', flexShrink: 0 }}>{row.icon}</span>
            <div style={{ minWidth: 0 }}>
              <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{row.label}</p>
              <p style={{ margin: '3px 0 0', fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Purchase History tab ── */
function HistoryTab() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<Order[]>('/orders')
      .then(setOrders)
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loading label="Loading orders…" block />;

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--green)' }}>Purchase History</h2>
      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          <p>No orders yet.</p>
          <Link className="button" href="/products" style={{ display: 'inline-block', marginTop: 8 }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {orders.map((order) => (
            <div key={order.id} style={{
              background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
                <div>
                  <span style={{ fontWeight: 700, fontSize: 14 }}>{order.orderNumber}</span>
                  <span style={{ color: 'var(--muted)', fontSize: 12, marginLeft: 10 }}>
                    {new Date(order.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <span style={{
                  padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                  textTransform: 'capitalize',
                  background: STATUS_BG[order.status], color: STATUS_COLOR[order.status],
                }}>{order.status}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--line)', paddingTop: 10, marginBottom: 10 }}>
                {order.items.map((item) => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '3px 0' }}>
                    <span style={{ color: '#333' }}>
                      {item.product.name}
                      <span style={{ color: 'var(--muted)', marginLeft: 6 }}>
                        × {formatQuantityWithUnit(item.quantity, item.product.name, item.product.categoryName)}
                      </span>
                    </span>
                    <span style={{ fontWeight: 600 }}>₦ {item.subtotal.toLocaleString('en-NG')}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                <span style={{ fontWeight: 700, fontSize: 14 }}>Total: ₦ {order.totalAmount.toLocaleString('en-NG')}</span>
                <Link className="button small" href={`/customer/orders/${order.id}`}>View Details →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Cart tab ── */
function CartTab() {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh } = useCart();
  const [cart, setCart] = useState<Cart>();
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [qtyInputs, setQtyInputs] = useState<Record<string, string>>({});

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
        if (err instanceof ApiError) { setError(err.message); return; }
        setError('Unable to load cart.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { void load(); }, [user?.id]);

  const update = async (id: string, quantity: number) => {
    setBusy(true);
    try {
      const updated = await api<Cart>(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ quantity }) });
      setCart(updated);
      const inputs: Record<string, string> = {};
      updated.items.forEach((item) => { inputs[item.id] = item.quantity.toString(); });
      setQtyInputs(inputs);
      await refresh();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  const updateSlot = async (id: string, deliverySlot: 'morning' | 'evening') => {
    setBusy(true);
    try {
      const updated = await api<Cart>(`/cart/items/${id}`, { method: 'PUT', body: JSON.stringify({ deliverySlot }) });
      setCart(updated);
      await refresh();
    } catch (e) { setError((e as Error).message); }
    finally { setBusy(false); }
  };

  const remove = async (id: string) => {
    setBusy(true);
    try { setCart(await api<Cart>(`/cart/items/${id}`, { method: 'DELETE' })); await refresh(); }
    finally { setBusy(false); }
  };

  if (loading) return <Loading label="Loading cart…" block />;

  return (
    <div>
      <h2 style={{ margin: '0 0 20px', fontSize: 18, color: 'var(--green)' }}>My Cart</h2>
      {error && <p className="error">{error}</p>}
      {!cart?.items.length ? (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--muted)' }}>
          <p>Your cart is empty.</p>
          <Link className="button" href="/products" style={{ display: 'inline-block', marginTop: 8 }}>Browse Products</Link>
        </div>
      ) : (
        <>
          <div style={{ position: 'relative' }}>
            {busy && <LoadingOverlay label="Updating…" />}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cart.items.map((i) => {
                const unit = productUnit(i.product.name, i.product.categoryName);
                return (
                  <div key={i.id} style={{
                    background: '#fff', border: '1px solid var(--line)', borderRadius: 12,
                    padding: '14px 16px', display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap',
                  }}>
                    <div style={{ width: 52, height: 52, flexShrink: 0, borderRadius: 8, overflow: 'hidden' }}>
                      <ProductImage name={i.product.name} imageUrl={i.product.imageUrl} categoryName={i.product.categoryName} decorative={false} />
                    </div>
                    <div style={{ flex: 1, minWidth: 140 }}>
                      <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 14 }}>{i.product.name}</p>
                      <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)' }}>
                        ₦ {i.product.price.toLocaleString('en-NG')} {formatPricePerUnit(unit)}
                      </p>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        {(['morning', 'evening'] as const).map((slot) => (
                          <button key={slot} type="button" disabled={busy}
                            onClick={() => void updateSlot(i.id, slot)}
                            style={{
                              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                              border: `1.5px solid ${i.deliverySlot === slot ? 'var(--green)' : 'var(--line)'}`,
                              background: i.deliverySlot === slot ? 'var(--mint)' : '#fff',
                              color: i.deliverySlot === slot ? 'var(--green)' : 'var(--muted)',
                            }}>
                            {slot === 'morning' ? '🌅 Morning' : '🌇 Evening'}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8, flexShrink: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <input type="number" min={1} max={i.product.stockQuantity} step={0.01}
                          value={qtyInputs[i.id] ?? i.quantity}
                          disabled={busy}
                          onChange={(e) => setQtyInputs((p) => ({ ...p, [i.id]: e.target.value }))}
                          onBlur={(e) => {
                            const val = parseFloat(e.target.value);
                            const clamped = isNaN(val) ? 1 : Math.max(1, Math.min(i.product.stockQuantity, Math.round(val * 100) / 100));
                            setQtyInputs((p) => ({ ...p, [i.id]: clamped.toString() }));
                            if (clamped !== i.quantity) void update(i.id, clamped);
                          }}
                          style={{ width: 60, textAlign: 'center', padding: '4px 6px', border: '1px solid var(--line)', borderRadius: 8, fontSize: 13 }}
                        />
                        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{unit}</span>
                      </div>
                      <span style={{ fontWeight: 700, fontSize: 14 }}>₦ {i.subtotal.toLocaleString('en-NG')}</span>
                      <button type="button" disabled={busy} onClick={() => void remove(i.id)}
                        style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 12, cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '16px 20px', marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontWeight: 600 }}>Subtotal</span>
              <span style={{ fontWeight: 700 }}>₦ {cart.total.toLocaleString('en-NG')}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: '0 0 12px' }}>
              Min. checkout: pickup ₦3,000 · delivery ₦5,000
            </p>
            <Link className="button" href="/checkout" style={{ display: 'block', textAlign: 'center' }}>
              Proceed to Checkout
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Main page ── */
export default function CustomerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('profile');

  // allow ?tab=history deep-link
  useEffect(() => {
    const t = router.query.tab;
    if (t === 'history' || t === 'cart' || t === 'profile') setTab(t);
  }, [router.query.tab]);

  if (!user) return null;

  const initials = user.fullName.split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('');

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'profile', label: 'Profile', icon: <IconUser /> },
    { id: 'history', label: 'Purchase History', icon: <IconOrders /> },
    { id: 'cart', label: 'My Cart', icon: <IconCart /> },
  ];

  return (
    <Layout>
      <RequireAuth roles={['customer']}>
        <div className="profile-layout">
          {/* ── Sidebar ── */}
          <aside className="profile-sidebar">
            {/* Banner */}
            <div className="profile-banner">
              <div className="profile-avatar">{initials}</div>
              <p className="profile-name">{user.fullName}</p>
              <p className="profile-email">{user.email}</p>
            </div>

            {/* Nav */}
            <nav className="profile-nav">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={`profile-nav-item${tab === item.id ? ' active' : ''}`}
                  onClick={() => setTab(item.id)}
                >
                  <span className="profile-nav-icon">{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>
          </aside>

          {/* ── Content ── */}
          <main className="profile-content">
            {tab === 'profile' && <ProfileTab user={user} />}
            {tab === 'history' && <HistoryTab />}
            {tab === 'cart' && <CartTab />}
          </main>
        </div>
      </RequireAuth>
    </Layout>
  );
}
