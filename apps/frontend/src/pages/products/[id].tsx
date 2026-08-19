import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { LoginModal } from '../../components/LoginModal';
import { api } from '../../lib/api';
import type { Product } from 'dova-shared';
import {
  formatPricePerUnit,
  formatQuantityWithUnit,
  formatStockInUnit,
  productUnit,
  quantityFieldLabel,
  stockLimitMessage,
} from 'dova-shared';
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
  const [slotError, setSlotError] = useState('');
  const [qtyError, setQtyError] = useState('');
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
      setSlotError('Please select a delivery slot (Morning or Evening).');
      showToast('Please select a delivery slot.', 'error');
      return;
    }
    setSlotError('');

    const requested = parseFloat(qtyInput);
    const finalQty = !isNaN(requested) && requested >= 1 ? Math.round(requested * 100) / 100 : qty;
    if (finalQty > p!.stockQuantity) {
      const message = `${stockLimitMessage(p!.stockQuantity, p!.name, p!.categoryName)}.`;
      setQtyError(message);
      showToast(message, 'error');
      return;
    }
    setQtyError('');
    setQty(finalQty);
    setQtyInput(finalQty.toString());

    setBusy(true);
    try {
      await api('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: p!.id, quantity: finalQty, deliverySlot }),
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

  const unit = productUnit(p.name, p.categoryName);

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
          <p className="price big">
            ₦ {p.price.toLocaleString('en-NG')} {formatPricePerUnit(unit)}
          </p>
          <p>{p.description}</p>
          <p className="muted">{formatStockInUnit(p.stockQuantity, unit)}</p>
          <p className="delivery-hint">🚚 Order before 6:00 PM for next-day delivery.</p>
          {p.stockQuantity > 0 ? (
            <div>
              <div className="delivery-slot">
                <label className="delivery-slot-label">Delivery Slot <span className="required">*</span></label>
                <div className="delivery-slot-options">
                  <button
                    type="button"
                    className={`slot-btn${deliverySlot === 'morning' ? ' active' : ''}`}
                    onClick={() => {
                      setDeliverySlot('morning');
                      setSlotError('');
                    }}
                  >
                    🌅 Morning <span className="slot-time">07:00 – 12:00</span>
                  </button>
                  <button
                    type="button"
                    className={`slot-btn${deliverySlot === 'evening' ? ' active' : ''}`}
                    onClick={() => {
                      setDeliverySlot('evening');
                      setSlotError('');
                    }}
                  >
                    🌇 Evening <span className="slot-time">15:00 – 20:00</span>
                  </button>
                </div>
                {slotError ? <p className="error">{slotError}</p> : null}
              </div>
              <div className="qty-select">
                <label className="delivery-slot-label">
                  {quantityFieldLabel(unit)} <span className="required">*</span>
                </label>
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
                        setQtyError('');
                      }}
                    >
                      {formatQuantityWithUnit(preset, p.name, p.categoryName)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="row qty-custom-row">
                <label>Or enter custom</label>
                <input
                  type="number"
                  min={1}
                  max={p.stockQuantity}
                  step={0.01}
                  value={qtyInput}
                  onChange={(e) => {
                    setQtyInput(e.target.value);
                    setQtyError('');
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val >= 1) {
                      setQty(Math.round(val * 100) / 100);
                    }
                  }}
                  onBlur={() => {
                    const val = parseFloat(qtyInput);
                    if (!isNaN(val) && val > p.stockQuantity) {
                      const message = `${stockLimitMessage(p.stockQuantity, p.name, p.categoryName)}.`;
                      setQtyError(message);
                      showToast(message, 'warning');
                    }
                    const clamped = isNaN(val) ? 1 : Math.max(1, Math.min(p.stockQuantity, Math.round(val * 100) / 100));
                    setQty(clamped);
                    setQtyInput(clamped.toString());
                  }}
                />
                <span className="muted" style={{ fontSize: 13 }}>{unit}</span>
              </div>
              <div style={{ marginTop: 12 }}>
                <button className="button" disabled={busy} onClick={addToCart}>
                  {busy ? <Loading label="Adding…" inline size="sm" /> : 'Add to cart'}
                </button>
              </div>
              {qtyError ? <p className="error">{qtyError}</p> : null}
              {qty > 0 && (
              <p style={{ marginTop: 10, fontSize: 15, color: 'var(--green)', fontWeight: 600 }}>
                Total: ₦ {(p.price * qty).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              )}
              {qty > p.stockQuantity && (
                <p className="error">
                  Maximum available: {formatQuantityWithUnit(p.stockQuantity, p.name, p.categoryName)}
                </p>
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
