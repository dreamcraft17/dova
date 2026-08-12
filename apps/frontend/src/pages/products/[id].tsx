import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { LoginModal } from '../../components/LoginModal';
import { api } from '../../lib/api';
import type { Product } from 'dova-shared';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function Detail() {
  const r = useRouter();
  const [p, setP] = useState<Product>();
  const [qty, setQty] = useState(1);
  const [qtyInput, setQtyInput] = useState('1');
  const [deliverySlot, setDeliverySlot] = useState<'morning' | 'evening' | ''>('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { refresh: refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    if (r.query.id) {
      setLoading(true);
      api<Product>(`/products/${r.query.id}`)
        .then(setP)
        .catch((e) => showToast(e.message, 'error'))
        .finally(() => setLoading(false));
    }
  }, [r.query.id]);

  async function addToCart() {
    if (!user) {
      showToast('Please login to add items to your cart.', 'info');
      setShowLoginModal(true);
      return;
    }

    if (user.role !== 'customer') {
      showToast('Only customer accounts can add items to the cart.', 'error');
      return;
    }

    if (!deliverySlot) {
      showToast('Please select a delivery slot.', 'error');
      return;
    }

    if (qty > p!.stockQuantity) {
      showToast(`Quantity exceeds available stock (${p!.stockQuantity} kg).`, 'error');
      return;
    }

    setBusy(true);
    try {
      await api('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: p!.id, quantity: qty, deliverySlot }),
      });
      await refreshCart();
      showToast(`${p!.name} added to cart!`, 'success');
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <Loading label="Loading product…" block />
      </Layout>
    );
  }

  if (!p) {
    return (
      <Layout>
        <section className="page-head">
          <p className="error">Product not found.</p>
        </section>
      </Layout>
    );
  }

  return (
    <Layout>
      <section className="detail">
        <div className="product-image large">
          {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <>🌿</>}
        </div>
        <div>
          <Link href="/products" className="muted">
            ← Back to marketplace
          </Link>
          <p className="eyebrow">{p.categoryName}</p>
          <h1>{p.name}</h1>
          <p className="origin-meta">
            <span>📍 {p.supplierName}</span>
            <span className="stars">★★★★★</span>
            <span className="badge">Verified</span>
          </p>
          <p className="price big">₦ {p.price.toLocaleString('en-NG')} / kg</p>
          <p>{p.description}</p>
          <p className="muted">{p.stockQuantity} kg in stock</p>
          <p className="delivery-hint">🚚 Order before 6:00 PM for next-day delivery.</p>
          {p.stockQuantity > 0 ? (
            <div>
              <div className="delivery-slot">
                <label className="delivery-slot-label">Delivery Slot <span className="required">*</span></label>
                <div className="delivery-slot-options">
                  <button
                    type="button"
                    className={`slot-btn${deliverySlot === 'morning' ? ' active' : ''}`}
                    onClick={() => setDeliverySlot('morning')}
                  >
                    🌅 Morning <span className="slot-time">07:00 – 12:00</span>
                  </button>
                  <button
                    type="button"
                    className={`slot-btn${deliverySlot === 'evening' ? ' active' : ''}`}
                    onClick={() => setDeliverySlot('evening')}
                  >
                    🌇 Evening <span className="slot-time">15:00 – 20:00</span>
                  </button>
                </div>
              </div>
              <div className="qty-select">
                <label className="delivery-slot-label">Quantity (kg) <span className="required">*</span></label>
                <div className="qty-options">
                  {[5, 10, 20].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`slot-btn qty-preset${qty === preset ? ' active' : ''}`}
                      disabled={preset > p.stockQuantity}
                      onClick={() => {
                        setQty(preset);
                        setQtyInput(preset.toString());
                      }}
                    >
                      {preset} kg
                    </button>
                  ))}
                </div>
              </div>
              <div className="row" style={{ alignItems: 'center', gap: 12 }}>
                <label style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>Or enter custom</label>
                <input
                  type="number"
                  min={1}
                  max={p.stockQuantity}
                  step={0.01}
                  value={qtyInput}
                  onChange={(e) => {
                    setQtyInput(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 1) {
                      setQty(Math.round(val * 100) / 100);
                    }
                  }}
                  onBlur={() => {
                    const val = parseFloat(qtyInput);
                    const clamped = isNaN(val) ? 1 : Math.max(1, Math.round(val * 100) / 100);
                    setQty(clamped);
                    setQtyInput(clamped.toString());
                  }}
                  style={{ width: 100 }}
                />
                <span className="muted" style={{ fontSize: 13 }}>kg</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="button" disabled={busy} onClick={addToCart}>
                  {busy ? <Loading label="Adding…" inline size="sm" /> : 'Add to cart'}
                </button>
              </div>
              {qty > 0 && (
              <p style={{ marginTop: 10, fontSize: 15, color: 'var(--green)', fontWeight: 600 }}>
                Total: ₦ {(p.price * qty).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              )}
              {qty > p.stockQuantity && (
                <p className="error">Maximum available: {p.stockQuantity} kg</p>
              )}
            </div>
          ) : (
            <p className="error">Out of stock</p>
          )}
        </div>
      </section>

      <LoginModal
        open={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={addToCart}
      />
    </Layout>
  );
}
