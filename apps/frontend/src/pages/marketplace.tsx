import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChainChrome } from '../components/ChainChrome';
import { Loading } from '../components/Loading';
import { ProductImage } from '../components/ProductImage';
import { api } from '../lib/api';
import type { Category, Product } from 'dova-shared';
import { formatPricePerUnit, formatStockAvailable, productUnit } from 'dova-shared';

type CardProduct = Product & { available: boolean };

function ProductCard({ product }: { product: CardProduct }) {
  const router = useRouter();
  return (
    <Link
      className="card"
      data-cat={product.categoryId}
      data-name={product.name.toLowerCase()}
      href={`/products/${product.id}`}
    >
      <div className="visual">
        <span className="badge">{product.available ? 'Starting Product' : 'Coming Soon'}</span>
        <div className="pack">
          <ProductImage name={product.name} imageUrl={product.imageUrl} categoryName={product.categoryName} decorative={false} />
        </div>
      </div>
      <div className="body">
        <div className="row">
          <div>
            <h3>{product.name}</h3>
            <div className="meta">{product.categoryName}</div>
          </div>
          <button
            className="plus"
            type="button"
            onClick={(event: MouseEvent<HTMLButtonElement>) => {
              event.preventDefault();
              if (product.available) void router.push(`/products/${product.id}`);
            }}
          >
            +
          </button>
        </div>
        {product.price > 0 ? (
          <div className="price">
            ₦ {product.price.toLocaleString('en-NG')} {formatPricePerUnit(productUnit(product.name, product.categoryName))}
          </div>
        ) : null}
        <span className="status">
          {product.available
            ? formatStockAvailable(product.stockQuantity, product.name, product.categoryName)
            : 'Coming Soon'}
        </span>
      </div>
    </Link>
  );
}

export default function Marketplace() {
  const [products, setProducts] = useState<CardProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');

  useEffect(() => {
    Promise.all([
      api<Category[]>('/categories').catch(() => []),
      api<{ data: Product[] }>('/products?page=1&limit=24').catch(() => ({ data: [] })),
    ])
      .then(([cats, prods]) => {
        setCategories(cats);
        setProducts(prods.data.map((p) => ({ ...p, available: p.stockQuantity > 0 })));
      })
      .finally(() => setLoading(false));
  }, []);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesCategory = category === 'all' || product.categoryId === category;
      const matchesSearch = product.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
    if (sort === 'name') return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    return filtered;
  }, [search, category, sort, products]);

  return (
    <ChainChrome title="Marketplace — DOVA Chain">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">DOVA Marketplace</div>
            <h1>Food products, sourced and delivered with purpose.</h1>
            <p>
              Start with Plantain Flour. Discover the products DOVA is currently building, with
              future categories clearly marked as they develop.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <Link className="btn gold" href="#products">
                Shop Plantain Flour
              </Link>
              <Link
                className="btn outline"
                style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}
                href="/bundles"
              >
                Explore Bundles
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <div className="flow">
              <b>SOURCE</b>
              <span>→</span>
              <b>PROCESS</b>
              <span>→</span>
              <b>PACKAGE</b>
              <span>→</span>
              <b>FULFILL</b>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="products">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Marketplace</div>
              <h2>Explore DOVA products</h2>
            </div>
            <p>Compact product cards keep discovery fast. On mobile, products remain two per row rather than becoming oversized single cards.</p>
          </div>
          <div className="notice">
            Plantain Flour is the current commercial focus. Products without live inventory are
            clearly marked instead of showing invented prices or availability.
          </div>
          <div className="toolbar">
            <input
              className="search"
              value={search}
              onChange={(event: ChangeEvent<HTMLInputElement>) => setSearch(event.target.value)}
              placeholder="Search flour, food products, bundles…"
              aria-label="Search products"
            />
            <select
              className="select"
              value={category}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setCategory(event.target.value)}
            >
              <option value="all">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <select
              className="select"
              value={sort}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => setSort(event.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="pills">
            <button
              type="button"
              className={`pill ${category === 'all' ? 'active' : ''}`}
              onClick={() => setCategory('all')}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`pill ${category === c.id ? 'active' : ''}`}
                onClick={() => setCategory(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>
          <div className="grid2" id="productGrid" style={{ marginTop: '14px' }}>
            {loading ? (
              <Loading label="Loading products…" block />
            ) : (
              visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)
            )}
          </div>
        </div>
      </section>
    </ChainChrome>
  );
}