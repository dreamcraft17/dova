import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { ProductImage } from '../../components/ProductImage';
import { LoginModal } from '../../components/LoginModal';
import { BundleContents } from '../../components/bundles/BundleContents';
import { BundleQuantitySelector } from '../../components/bundles/BundleQuantitySelector';
import { api } from '../../lib/api';
import type { BundleDetail } from 'dova-shared';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BundleDetailPage() {
  const r = useRouter();
  const [bundle, setBundle] = useState<BundleDetail>();
  const [qty, setQty] = useState(1);
  const [deliverySlot, setDeliverySlot] = useState<'morning' | 'evening' | ''>('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [slotError, setSlotError] = useState('');
  const [qtyError, setQtyError] = useState('');
  const { refresh: refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const loadBundle = () => {
    if (!r.query.id) return;
    setLoading(true);
    api<BundleDetail>(`/bundles/${r.query.id}`)
      .then(setBundle)
      .catch(() => setBundle(undefined))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadBundle();
  }, [r.query.id]);

  async function addToCart() {
    if (!bundle) return;

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

    const available = bundle.computed.availableQuantity;
    if (qty > available) {
      const message = `Only ${available} of "${bundle.name}" are available.`;
      setQtyError(message);
      showToast(message, 'error');
      return;
    }
    setQtyError('');

    setBusy(true);
    try {
      await api('/cart/add-bundle', {
        method: 'POST',
        body: JSON.stringify({ bundleId: bundle.id, quantity: qty, deliverySlot }),
      });
      await refreshCart();
      showToast(`${bundle.name} added to cart!`, 'success');
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <Layout>
        <Loading label="Loading bundle…" block />
      </Layout>
    );
  }

  if (!bundle) {
    return (
      <Layout>
        <section className="page-head">
          <p className="error">Bundle not found or unavailable.</p>
          <div style={{ marginTop: 12 }}>
            <Link href="/bundles" className="button small">
              ← Back to bundles
            </Link>
          </div>
        </section>
      </Layout>
    );
  }

  const { computed } = bundle;

  return (
    <Layout>
      <Head>
        <title>{bundle.name} — DOVA</title>
        <meta name="description" content={bundle.description || `Buy ${bundle.name} on DOVA.`} />
      </Head>

      <section className="detail">
        <div className="product-image large">
          <ProductImage
            name={bundle.name}
            imageUrl={bundle.imageUrl}
            categoryName={bundle.categoryName}
            decorative={false}
          />
        </div>
        <div>
          <nav aria-label="Breadcrumb" style={{ marginBottom: 12 }}>
            <Link href="/bundles" className="muted">
              ← Back to bundles
            </Link>
          </nav>
          <p className="eyebrow">{bundle.categoryName || 'Bundle'}</p>
          <h1>{bundle.name}</h1>
          <p className="origin-meta">
            <span>📍 Curated by DOVA</span>
            <span className="stars">★★★★★</span>
          </p>
          <div className="price-box" style={{ margin: '12px 0' }}>
            <p className="price big">₦ {bundle.bundlePrice.toLocaleString('en-NG')}</p>
            {computed.savingsAmount > 0 && (
              <p className="muted" style={{ margin: '4px 0 0' }}>
                Save ₦ {computed.savingsAmount.toLocaleString('en-NG')} ({Math.round(computed.savingsPercentage)}%)
                off the ₦ {computed.individualTotal.toLocaleString('en-NG')} regular price.
              </p>
            )}
          </div>
          <p style={{ margin: '12px 0 16px', lineHeight: 1.6 }}>{bundle.description}</p>

          <BundleContents contents={bundle.contents} />

          {!computed.isOutOfStock ? (
            <div style={{ marginTop: 20 }}>
              <p className="stock-info" style={{ color: 'var(--green)', fontWeight: 600, fontSize: 14, margin: '8px 0 16px' }}>
                ✓ {computed.availableQuantity} bundle(s) available in stock
              </p>

              <div className="delivery-slot">
                <label className="delivery-slot-label">
                  Delivery Slot <span className="required">*</span>
                </label>
                <div className="delivery-slot-options">
                  <button
                    type="button"
                    className={`slot-btn${deliverySlot === 'morning' ? ' active' : ''}`}
                    disabled={busy}
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
                    disabled={busy}
                    onClick={() => {
                      setDeliverySlot('evening');
                      setSlotError('');
                    }}
                  >
                    🌇 Evening <span className="slot-time">15:00 – 20:00</span>
                  </button>
                </div>
                {slotError ? <p className="error" role="alert">{slotError}</p> : null}
              </div>

              <BundleQuantitySelector
                value={qty}
                max={computed.availableQuantity}
                disabled={busy}
                error={qtyError}
                onChange={(val) => {
                  setQty(val);
                  setQtyError('');
                }}
              />

              <div style={{ marginTop: 16 }}>
                <button
                  type="button"
                  className="button"
                  disabled={busy || computed.availableQuantity < 1}
                  onClick={addToCart}
                >
                  {busy ? <Loading label="Adding…" inline size="sm" /> : 'Add to cart'}
                </button>
              </div>

              {qty > 0 && (
                <p style={{ marginTop: 12, fontSize: 16, color: 'var(--green)', fontWeight: 600 }}>
                  Total: ₦ {(bundle.bundlePrice * qty).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              )}
            </div>
          ) : (
            <p className="error" style={{ margin: '16px 0', fontWeight: 600 }}>
              This bundle is currently out of stock.
            </p>
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
