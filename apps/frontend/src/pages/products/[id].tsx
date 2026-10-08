import { useEffect, useState, type ChangeEvent, type FormEvent, type MouseEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChainChrome } from '../../components/ChainChrome';
import { ProductImage } from '../../components/ProductImage';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { LoginModal } from '../../components/LoginModal';
import type { Product } from 'dova-shared';
import { formatPricePerUnit, productUnit, formatStockInUnit } from 'dova-shared';

export default function ProductPage() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const { refresh: refreshCart } = useCart();
  const { showToast } = useToast();
  const [p, setP] = useState<Product>();
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pack, setPack] = useState('500g');
  const [quantity, setQuantity] = useState(1);
  const [deliverySlot, setDeliverySlot] = useState<'morning' | 'evening'>('morning');
  const [busy, setBusy] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [message, setMessage] = useState('Connect purchase actions to the existing cart/API.');
  const [rating, setRating] = useState(0);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    api<Product>(`/products/${id}`)
      .then((data) => {
        setP(data);
        return api<{ data: Product[] }>(`/products?page=1&limit=5&categoryId=${data.categoryId}`);
      })
      .then((r) => setRelated(r.data.filter((item) => item.id !== id).slice(0, 2)))
      .catch((e) => showToast((e as Error).message, 'error'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ChainChrome title="Loading…"><Loading label="Loading product…" block /></ChainChrome>;
  if (!p) return <ChainChrome title="Not Found"><section className="section"><p style={{ padding: '0 20px' }}>Product not found.</p></section></ChainChrome>;

  const unit = productUnit(p.name, p.categoryName);

  const addToCart = async () => {
    if (!user) { setShowLoginModal(true); return; }
    if (user.role !== 'customer') { showToast('Only customer accounts can add items to the cart.', 'error'); return; }
    setBusy(true);
    try {
      await api('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: p.id, quantity, deliverySlot }),
      });
      await refreshCart();
      setMessage(`${p.name} (${pack}, ${deliverySlot}) selected, quantity ${quantity}. Connect this action to the live DOVA cart/API.`);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const finalRating = rating || 5;
    setRating(finalRating);
    setReviewSubmitted(true);
    setReviewOpen(false);
  };

  return (
    <ChainChrome title={`${p.name} — DOVA Chain`}>
      <section className="section">
        <div className="container">
          <div className="eyebrow">Products / {p.categoryName} / {p.name}</div>
          <div className="product-main" style={{ marginTop: '12px' }}>
            <div>
              <div className="gallery">
                <span className="badge">{p.stockQuantity > 0 ? 'Starting Product' : 'Out of Stock'}</span>
                <div className="pack">
                  <ProductImage name={p.name} imageUrl={p.imageUrl} categoryName={p.categoryName} decorative={false} />
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
              <div className="eyebrow">DOVA · {p.categoryName}</div>
              <h1>{p.name}</h1>
              <p style={{ color: 'var(--muted)', fontSize: '.78rem' }}>{p.description}</p>
              <div className="rating"><b>★★★★★</b><small>No ratings yet · <a href="#reviews">Be the first to rate</a></small></div>
              <div className="pricebig">{p.price > 0 ? `₦ ${p.price.toLocaleString('en-NG')} ${formatPricePerUnit(unit)}` : '₦ —'}</div>
              <small style={{ color: 'var(--muted)', fontSize: '.61rem' }}>Live price should be returned by the product backend.</small>
              <h4 style={{ fontSize: '.7rem', margin: '22px 0 8px' }}>Pack size</h4>
              <div className="variants">
                {['500g', '1kg', '2kg'].map((size) => (
                  <button key={size} type="button" className={`variant ${pack === size ? 'active' : ''}`} onClick={() => setPack(size)}>{size}</button>
                ))}
              </div>
              <h4 style={{ fontSize: '.7rem', margin: '22px 0 8px' }}>Delivery Slot</h4>
              <div className="variants">
                <button type="button" className={`variant ${deliverySlot === 'morning' ? 'active' : ''}`} onClick={() => setDeliverySlot('morning')}>Morning</button>
                <button type="button" className={`variant ${deliverySlot === 'evening' ? 'active' : ''}`} onClick={() => setDeliverySlot('evening')}>Evening</button>
              </div>
              <h4 style={{ fontSize: '.7rem', margin: '22px 0 8px' }}>Quantity</h4>
              <div className="purchase">
                <div className="qty">
                  <button type="button" onClick={() => setQuantity((v) => Math.max(1, v - 1))}>−</button>
                  <input aria-label="Quantity" value={quantity} onChange={(e: ChangeEvent<HTMLInputElement>) => setQuantity(Math.max(1, Number(e.target.value) || 1))} />
                  <button type="button" onClick={() => setQuantity((v) => Math.min(p.stockQuantity, v + 1))}>+</button>
                </div>
                <button className="btn green" type="button" onClick={addToCart} disabled={busy}>
                  {busy ? 'Adding…' : 'Add to Cart'}
                </button>
                <Link className="btn gold" href="/cart">View Cart</Link>
              </div>
              <div id="msg" style={{ fontSize: '.62rem', color: 'var(--muted)', marginTop: '8px' }}>{message}</div>
              <div className="features">
                <div className="feature"><b>Product clarity</b><span>Pack, price and stock information.</span></div>
                <div className="feature"><b>Quality focus</b><span>Product details before purchase.</span></div>
                <div className="feature"><b>Secure checkout</b><span>Use the existing payment flow.</span></div>
                <div className="feature"><b>Fulfillment</b><span>Delivery information before checkout.</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail">
            <div className="panel">
              <h3>Product information</h3>
              <p>{p.description}</p>
            </div>
            <div className="panel">
              <h3>Delivery &amp; returns</h3>
              <p>Next-day delivery available for orders placed before 6 PM. Returns handled via support.</p>
              <Link className="btn outline" href="/contact">Need help?</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="reviews">
        <div className="container">
          <div className="section-head">
            <h2>Customer ratings &amp; reviews</h2>
            <p>No fake ratings. In production, reviews should be tied to customer orders/accounts so verified-purchase status can be shown.</p>
          </div>
          <div className="reviews">
            <aside className="review-summary">
              <div className="eyebrow">Rating overview</div>
              <div className="big">{reviewSubmitted ? '5.0' : '—'}</div>
              <div style={{ color: 'var(--gold)' }}>★★★★★</div>
              <p style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.6)' }}>{reviewSubmitted ? '1 rating' : 'No ratings yet'}</p>
              <button className="btn gold" type="button" onClick={() => setReviewOpen(true)}>Write a review</button>
            </aside>
            <div>
              <div id="reviewList">
                {reviewSubmitted ? (
                  <div className="review">
                    <strong>{reviewName}</strong>
                    <div style={{ color: 'var(--gold)', marginTop: '4px' }}>{'★'.repeat(rating || 5)}</div>
                    <p>{reviewText}</p>
                  </div>
                ) : (
                  <div className="panel">
                    <strong>No reviews yet.</strong>
                    <p>Be the first customer to share your experience.</p>
                  </div>
                )}
              </div>
              {reviewOpen ? (
                <form className="form" onSubmit={submitReview}>
                  <div className="field">
                    <label>Your name</label>
                    <input value={reviewName} onChange={(e: ChangeEvent<HTMLInputElement>) => setReviewName(e.target.value)} required />
                  </div>
                  <div className="field">
                    <label>Your rating</label>
                    <button className="stars" type="button" onClick={() => setRating(5)} aria-label="Set five star rating">★★★★★</button>
                  </div>
                  <div className="field">
                    <label>Your review</label>
                    <textarea value={reviewText} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setReviewText(e.target.value)} required />
                  </div>
                  <button className="btn green" type="submit">Submit Review</button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <div className="container">
            <div className="section-head">
              <h2>Related products</h2>
              <p>Future categories stay visible without being presented as currently available.</p>
            </div>
            <div className="grid2">
              {related.map((item) => (
                <Link key={item.id} className="card" href={`/products/${item.id}`}>
                  <div className="visual">
                    <span className="badge">{item.stockQuantity > 0 ? 'In Stock' : 'Coming Soon'}</span>
                    <div className="pack">
                      <ProductImage name={item.name} imageUrl={item.imageUrl} categoryName={item.categoryName} decorative={false} />
                    </div>
                  </div>
                  <div className="body"><h3>{item.name}</h3><span className="status">{item.stockQuantity > 0 ? 'In Stock' : 'Coming Soon'}</span></div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={addToCart} />
    </ChainChrome>
  );
}