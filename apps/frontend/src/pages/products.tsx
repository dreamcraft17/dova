import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { Loading, ProductGridSkeleton } from '../components/Loading';
import { ProductCard } from '../components/ProductCard';
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
  const [loading, setLoading] = useState(true);
  const limit = 12;

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => undefined);
  }, []);

  useEffect(() => {
    setLoading(true);
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
          .catch((e) => setError(e.message))
          .finally(() => setLoading(false)),
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
        <div className="filter-stack">
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

      {loading ? (
        <ProductGridSkeleton />
      ) : (
      <div className="page-content">
        <section className="grid">
          {error && <p className="error">{error}</p>}
          {products.length === 0 && !error && <p>No products found.</p>}
          {products.map((p) => (
            <ProductCard
              key={p.id}
              variant="grid"
              product={{
                id: p.id,
                name: p.name,
                description: p.description,
                imageUrl: p.imageUrl,
                price: p.price,
                href: `/products/${p.id}`,
                categoryName: p.categoryName,
                supplierName: p.supplierName,
                stockQuantity: p.stockQuantity,
              }}
            />
          ))}
        </section>
      </div>
      )}

      <div className="pagination">
        {loading ? <Loading label="Loading products…" inline size="sm" /> : null}
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
