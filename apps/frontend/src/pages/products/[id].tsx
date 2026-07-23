import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { api } from '../../lib/api';
import type { Product } from 'dova-shared';
import { useCart } from '../../context/CartContext';

export default function Detail() {
  const r = useRouter();
  const [p, setP] = useState<Product>();
  const [qty, setQty] = useState(1);
  const [message, setMessage] = useState('');
  const { refresh } = useCart();

  useEffect(() => {
    if (r.query.id)
      api<Product>(`/products/${r.query.id}`)
        .then(setP)
        .catch((e) => setMessage(e.message));
  }, [r.query.id]);

  if (!p)
    return (
      <Layout>
        <section className="page-head">
          <p>{message || 'Loading...'}</p>
        </section>
      </Layout>
    );

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
              <button
                className="button"
                onClick={() =>
                  api('/cart/add', {
                    method: 'POST',
                    body: JSON.stringify({ productId: p.id, quantity: qty }),
                  })
                    .then(async () => {
                      await refresh();
                      setMessage('Added to cart');
                    })
                    .catch((e) => setMessage(e.message))
                }
              >
                Add to cart
              </button>
            </div>
          ) : (
            <p className="error">Out of stock</p>
          )}
          <p>{message}</p>
        </div>
      </section>
    </Layout>
  );
}
