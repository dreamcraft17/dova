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

    setBusy(true);
    try {
      await api('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: p!.id, quantity: qty }),
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
          <p className="price big">₦ {p.price.toLocaleString('en-NG')}</p>
          <p>{p.description}</p>
          <p className="muted">{p.stockQuantity} in stock</p>
          {p.stockQuantity > 0 ? (
            <div className="row">
              <input
                type="number"
                min={1}
                max={p.stockQuantity}
                value={qty}
                onChange={(e) =>
                  setQty(Math.max(1, Math.min(p.stockQuantity, Number(e.target.value))))
                }
              />
              <button className="button" disabled={busy} onClick={addToCart}>
                {busy ? <Loading label="Adding…" inline size="sm" /> : 'Add to cart'}
              </button>
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
