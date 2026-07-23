import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { api } from '../lib/api';
import type { Category, Product } from 'dova-shared';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const limit = 12;

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    const t = setTimeout(
      () =>
        api<{ data: Product[]; pagination: { total: number } }>(
          `/products?search=${encodeURIComponent(search)}&categoryId=${categoryId}&page=${page}&limit=${limit}`,
        )
          .then((r) => {
            setProducts(r.data);
            setTotal(r.pagination.total);
            setError('');
          })
          .catch((e) => setError(e.message)),
      300,
    );
    return () => clearTimeout(t);
  }, [search, categoryId, page]);

  return (
    <Layout>
      <section className="page-head">
        <p className="eyebrow">Marketplace</p>
        <h1>Fresh products from verified suppliers</h1>
        <p className="lead">Source quality produce directly from farmers and suppliers you can trust.</p>
        <div className="row">
          <input
            className="search"
            placeholder="Search products..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section className="grid">
        {error && <p className="error">{error}</p>}
        {products.length === 0 && !error && <p>No products found.</p>}
        {products.map((p) => (
          <Link href={`/products/${p.id}`} className="card product-card" key={p.id}>
            <div className="product-image">
              {p.imageUrl ? <img src={p.imageUrl} alt={p.name} /> : <>🌿</>}
            </div>
            <div className="card-body">
              <p className="muted">{p.categoryName}</p>
              <h3>{p.name}</h3>
              <p className="origin-meta">
                <span>📍 {p.supplierName}</span>
                <span className="stars">★★★★★</span>
              </p>
              <p className="price">₦ {p.price.toLocaleString('en-NG')}</p>
              <p className="muted">{p.stockQuantity} available</p>
            </div>
          </Link>
        ))}
      </section>

      <div className="pagination">
        <button className="button small" disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Previous
        </button>
        <span>
          Page {page} · {total} products
        </span>
        <button
          className="button small"
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </Layout>
  );
}
