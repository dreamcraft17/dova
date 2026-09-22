import { useRouter } from 'next/router';
import { useEffect, useState, type ChangeEvent } from 'react';
import Link from 'next/link';
import { ChainChrome } from '../../components/ChainChrome';
import { ProductImage } from '../../components/ProductImage';
import { Loading } from '../../components/Loading';
import { LoginModal } from '../../components/LoginModal';
import { BundleContents } from '../../components/bundles/BundleContents';
import { api } from '../../lib/api';
import type { BundleDetail } from 'dova-shared';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function BundleDetailPage() {
  const r = useRouter();
  const { id } = r.query;
  const { refresh: refreshCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [bundle, setBundle] = useState<BundleDetail>();
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [deliverySlot, setDeliverySlot] = useState<'morning' | 'evening'>('morning');
  const [busy, setBusy] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [message, setMessage] = useState('Connect purchase actions to the existing cart/API.');

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    api<BundleDetail>(`/bundles/${id}`)
      .then(setBundle)
      .catch(() => showToast('Bundle not found or unavailable.', 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ChainChrome title="Loading…"><Loading label="Loading bundle…" block /></ChainChrome>;
  if (!bundle) return <ChainChrome title="Not Found"><section className="section"><p style={{ padding: '0 20px' }}>Bundle not found.</p></section></ChainChrome>;

  const { computed } = bundle;

  const addToCart = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (user.role !== 'customer') { showToast('Only customer accounts can add items to the cart.', 'error'); return; }
    setBusy(true);
    try {
      await api('/cart/add-bundle', {
        method: 'POST',
        body: JSON.stringify({ bundleId: bundle.id, quantity, deliverySlot }),
      });
      await refreshCart();
      setMessage(`${bundle.name} (${deliverySlot}) selected, quantity ${quantity}. Connect this action to the live DOVA cart/API.`);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <ChainChrome title={`${bundle.name} — DOVA Chain`}>
      <section className="section">
        <div className="container">
          <div className="eyebrow">Bundles / {bundle.categoryName || 'Bundle'} / {bundle.name}</div>
          <div className="product-main" style={{ marginTop: '12px' }}>
            <div>
              <div className="gallery">
                <span className="badge">{computed.isOutOfStock ? 'Out of Stock' : 'Bundle'}</span>
                <div className="pack">
                  <ProductImage name={bundle.name} imageUrl={bundle.imageUrl} categoryName={bundle.categoryName} decorative={false} />
                </div>
              </div>
              <div className="thumbs">
                <div className="thumb">Front</div>
                <div className="thumb">Back</div>
                <div className="thumb">Pack</div>
                <div className="thumb">Detail</div>
              </div>
            </div>
            <div>
              <div className="eyebrow">DOVA · {bundle.categoryName || 'Bundle'}</div>
              <h1>{bundle.name}</h1>
              <p style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{bundle.description}</p>
              <div className="rating"><b>★★★★★</b><small>Bundle rating placeholder</small></div>
              <div className="pricebig">₦ {bundle.bundlePrice.toLocaleString('en-NG')}</div>
              {computed.savingsAmount > 0 && (
                <div className="price" style={{ marginTop: '-8px' }}>
                  Save ₦ {computed.savingsAmount.toLocaleString('en-NG')} ({Math.round(computed.savingsPercentage)}% off)
                </div>
              )}
              <h4 style={{ fontSize: '.7rem', margin: '22px 0 8px' }}>Delivery Slot</h4>
              <div className="variants">
                <button type="button" className={`variant ${deliverySlot === 'morning' ? 'active' : ''}`} disabled={computed.isOutOfStock || busy} onClick={() => setDeliverySlot('morning')}>Morning</button>
                <button type="button" className={`variant ${deliverySlot === 'evening' ? 'active' : ''}`} disabled={computed.isOutOfStock || busy} onClick={() => setDeliverySlot('evening')}>Evening</button>
              </div>
              <h4 style={{ fontSize: '.7rem', margin: '22px 0 8px' }}>Quantity</h4>
              <div className="purchase">
                <div className="qty">
                  <button type="button" onClick={() => setQuantity((v) => Math.max(1, v - 1))}>−</button>
                  <input aria-label="Quantity" value={quantity} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
                  <button type="button" onClick={() => setQuantity((v) => Math.min(computed.availableQuantity, v + 1))}>+</button>
                </div>
                <button className="btn green" type="button" onClick={addToCart} disabled={busy || computed.isOutOfStock}>
                  {busy ? 'Adding…' : 'Add to Cart'}
                </button>
                <Link className="btn gold" href="/cart">View Cart</Link>
              </div>
              <div id="msg" style={{ fontSize: '.62rem', color: 'var(--muted)', marginTop: '8px' }}>{message}</div>
              <div className="features">
                <div className="feature"><b>Bundle contents</b><span>Clear view of included items.</span></div>
                <div className="feature"><b>Price clarity</b><span>Savings compared to individual prices.</span></div>
                <div className="feature"><b>Secure checkout</b><span>Standardized DOVA payment flow.</span></div>
                <div className="feature"><b>Fulfillment</b><span>Delivery tracking included.</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail">
            <div className="panel">
              <h3>Bundle contents</h3>
              <BundleContents contents={bundle.contents} />
            </div>
            <div className="panel">
              <h3>Delivery &amp; returns</h3>
              <p>Next-day delivery available for orders placed before 6 PM. Returns handled via support.</p>
              <Link className="btn outline" href="/contact">Need help?</Link>
            </div>
          </div>
        </div>
      </section>

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={addToCart} />
    </ChainChrome>
  );
}