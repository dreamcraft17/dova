import { useEffect, useMemo, useState, type ChangeEvent, type MouseEvent } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { ChainChrome } from '../components/ChainChrome';
import { Loading } from '../components/Loading';
import { ProductImage } from '../components/ProductImage';
import { api } from '../lib/api';
import type { Category, Product } from 'dova-shared';
import { formatPricePerUnit, formatStockAvailable, productUnit } from 'dova-shared';

const styles = {
  hero: {
    minHeight: '720px',
    padding: '150px 0 86px',
    background: 'radial-gradient(circle at 82% 28%, rgba(11, 166, 111, 0.28), transparent 30%), linear-gradient(135deg, #000, #052A1F 55%, #0B6546)',
    color: '#fff',
    position: 'relative' as const,
    overflow: 'hidden' as const,
  },
  container: {
    width: 'min(1280px, calc(100% - 32px))',
    marginInline: 'auto',
  },
  heroGrid: {
    display: 'grid',
    gridTemplateColumns: '1.02fr 0.98fr',
    gap: '64px',
    alignItems: 'center',
    position: 'relative' as const,
    zIndex: 1,
  },
  heroCopy: {
    maxWidth: '720px',
  },
  eyebrow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.8125rem',
    fontWeight: 900,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    color: '#B7D63A',
    marginBottom: '18px',
  },
  h1: {
    fontSize: 'clamp(2rem, 4vw, 3.2rem)',
    lineHeight: 1.2,
    letterSpacing: '-0.03em',
    fontWeight: 900,
    margin: '18px 0 25px',
    color: '#fff',
  },
  heroP: {
    fontSize: '1.08rem',
    lineHeight: 1.6,
    maxWidth: '660px',
    margin: '0 0 30px',
    color: 'rgba(255, 255, 255, 0.85)',
  },
  heroActions: {
    display: 'flex',
    gap: '11px',
    flexWrap: 'wrap' as const,
  },
  btn: {
    minHeight: '48px',
    padding: '0 20px',
    borderRadius: '999px',
    border: '1px solid transparent',
    background: 'transparent',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '9px',
    fontWeight: 850,
    fontSize: '0.92rem',
    transition: 'transform 0.2s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    textDecoration: 'none',
    color: 'inherit',
  },
  gold: {
    background: '#D4AF37',
    color: '#000',
    boxShadow: '0 10px 30px rgba(212, 175, 55, 0.18)',
  },
  outline: {
    borderColor: 'rgba(255, 255, 255, 0.25)',
    color: '#fff',
  },
  heroVisual: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '18px',
    position: 'relative' as const,
    zIndex: 1,
  },
  heroPhoto: {
    position: 'relative' as const,
    height: '420px',
    borderRadius: '34px',
    overflow: 'hidden' as const,
    border: '1px solid rgba(255, 255, 255, 0.15)',
    boxShadow: '0 30px 90px rgba(0, 0, 0, 0.34)',
    background: '#0b2d22',
  },
  flowDiagram: {
    display: 'flex',
    gap: '9px',
    alignItems: 'center',
    flexWrap: 'wrap' as const,
    justifyContent: 'center',
    padding: '16px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    borderRadius: '18px',
  },
  flowItem: {
    padding: '11px 13px',
    borderRadius: '12px',
    background: 'rgba(255, 255, 255, 0.06)',
    border: '1px solid rgba(255, 255, 255, 0.09)',
    fontSize: '0.62rem',
    fontWeight: 900,
    color: '#fff',
  },
  flowArrow: {
    color: '#F0D878',
    fontSize: '0.9rem',
  },

  // Responsive adjustments
  heroResponsive: `
    @media (max-width: 1100px) {
      .hero-grid {
        gap: 40px;
      }
      .hero-photo {
        height: 360px;
      }
    }
    @media (max-width: 800px) {
      .hero {
        padding: 120px 0 60px;
      }
      .hero-grid {
        grid-template-columns: 1fr;
      }
      .hero-photo {
        height: 300px;
      }
      .h1 {
        font-size: clamp(1.5rem, 3vw, 2.2rem);
      }
      .hero-p {
        font-size: 1rem;
      }
    }
    @media (max-width: 600px) {
      .hero {
        padding: 100px 0 40px;
      }
      .hero-photo {
        height: 240px;
        border-radius: 24px;
      }
      .flow-diagram {
        gap: 6px;
        padding: 12px;
      }
      .flow-item {
        padding: 8px 10px;
        font-size: 0.55rem;
      }
      .h1 {
        font-size: clamp(1.3rem, 2.5vw, 1.8rem);
        margin: 12px 0 18px;
      }
      .hero-p {
        font-size: 0.95rem;
      }
    }
  `,
};

type CardProduct = Product & { available: boolean };

let catalogCache: { at: number; products: CardProduct[]; categories: Category[] } | null = null;

function useCatalog() {
  const [products, setProducts] = useState<CardProduct[]>(() => catalogCache?.products ?? []);
  const [categories, setCategories] = useState<Category[]>(() => catalogCache?.categories ?? []);
  const [loading, setLoading] = useState(!catalogCache);

  useEffect(() => {
    if (catalogCache && Date.now() - catalogCache.at < 30_000) {
      setLoading(false);
      return;
    }
    Promise.all([
      api<Category[]>('/categories').catch(() => []),
      api<{ data: Product[] }>('/products?page=1&limit=24').catch(() => ({ data: [] })),
    ])
      .then(([cats, prods]) => {
        const mapped = prods.data.map((p) => ({ ...p, available: p.stockQuantity > 0 }));
        catalogCache = { at: Date.now(), products: mapped, categories: cats };
        setCategories(cats);
        setProducts(mapped);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, categories, loading };
}

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
  const { products, categories, loading } = useCatalog();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [sort, setSort] = useState('featured');

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
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroGrid}>
            <div style={styles.heroCopy}>
              <div style={styles.eyebrow}>DOVA Marketplace</div>
              <h1 style={styles.h1}>Food products, sourced and delivered with purpose.</h1>
              <p style={styles.heroP}>
                Start with Plantain Flour. Discover the products DOVA is currently building, with
                future categories clearly marked as they develop.
              </p>
              <div style={styles.heroActions}>
                <Link style={{ ...styles.btn, ...styles.gold }} href="#products">
                  Shop Plantain Flour
                </Link>
                <Link style={{ ...styles.btn, ...styles.outline }} href="/bundles">
                  Explore Bundles
                </Link>
              </div>
            </div>
            <div style={styles.heroVisual}>
              <div style={styles.heroPhoto}>
                <img
                  src="/images/mp-hero.jpeg"
                  alt="DOVA marketplace products"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.02)' }}
                />
                <div style={{ content: '""', position: 'absolute' as const, inset: 0, background: 'linear-gradient(180deg, rgba(3, 31, 23, 0.02), rgba(3, 31, 23, 0.45))' }} />
              </div>
              <div style={styles.flowDiagram}>
                <b style={styles.flowItem}>SOURCE</b>
                <span style={styles.flowArrow}>→</span>
                <b style={styles.flowItem}>PROCESS</b>
                <span style={styles.flowArrow}>→</span>
                <b style={styles.flowItem}>PACKAGE</b>
                <span style={styles.flowArrow}>→</span>
                <b style={styles.flowItem}>FULFILL</b>
              </div>
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