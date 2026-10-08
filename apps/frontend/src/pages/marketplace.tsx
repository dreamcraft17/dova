import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ChainChrome } from '../components/ChainChrome';
import { Loading } from '../components/Loading';
import { LoginModal } from '../components/LoginModal';
import { ProductImage } from '../components/ProductImage';
import { api } from '../lib/api';
import { fraunces, manrope } from '../lib/fonts';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Category, Product } from 'dova-shared';
import { productUnit } from 'dova-shared';
import styles from '../styles/marketplace.module.css';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;
const PAGE_SIZE = 24;
const LOW_STOCK = 10;

type Sort = 'featured' | 'low' | 'high' | 'az';
type Filters = { category: string; q: string; pmin: number | null; pmax: number | null; inStock: boolean };
const EMPTY: Filters = { category: 'all', q: '', pmin: null, pmax: null, inStock: false };

let catalogCache: { at: number; products: Product[]; categories: Category[] } | null = null;

function useCatalog() {
  const [products, setProducts] = useState<Product[]>(() => catalogCache?.products ?? []);
  const [categories, setCategories] = useState<Category[]>(() => catalogCache?.categories ?? []);
  const [loading, setLoading] = useState(!catalogCache);

  useEffect(() => {
    if (catalogCache && Date.now() - catalogCache.at < 30_000) {
      setLoading(false);
      return;
    }
    Promise.all([
      api<Category[]>('/categories').catch(() => []),
      api<{ data: Product[] }>('/products?page=1&limit=200').catch(() => ({ data: [] })),
    ])
      .then(([cats, prods]) => {
        catalogCache = { at: Date.now(), products: prods.data, categories: cats };
        setCategories(cats);
        setProducts(prods.data);
      })
      .finally(() => setLoading(false));
  }, []);

  return { products, categories, loading };
}

function ProductCard({ product, busy, onAdd }: { product: Product; busy: boolean; onAdd: (p: Product) => void }) {
  const unit = productUnit(product.name, product.categoryName);
  const out = product.stockQuantity <= 0;
  const low = !out && product.stockQuantity <= LOW_STOCK;
  const href = `/products/${product.id}`;

  return (
    <article className={styles.pcard}>
      <Link className={styles.pimg} href={href}>
        <ProductImage name={product.name} imageUrl={product.imageUrl} categoryName={product.categoryName} decorative={false} />
      </Link>
      <div className={styles.pbody}>
        <Link className={styles.pname} href={href}>{product.name}</Link>
        <div className={styles.pprice}>{product.price > 0 ? naira(product.price) : 'Price on request'}</div>
        <div className={styles.punit}>
          Per {unit}
          {product.categoryName ? ` · ${product.categoryName}` : ''}
        </div>
        {low && <div className={styles.pstock}>Only {product.stockQuantity} {unit} left</div>}
        {out && <div className={styles.pstock}>Out of stock</div>}
        <div className={styles.pcta}>
          <button type="button" disabled={out || busy} onClick={() => onAdd(product)}>
            {busy ? 'Adding…' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

export default function Marketplace() {
  const router = useRouter();
  const { user } = useAuth();
  const { refresh: refreshCart } = useCart();
  const { showToast } = useToast();
  const { products, categories, loading } = useCatalog();

  const [f, setF] = useState<Filters>(EMPTY);
  const [priceInput, setPriceInput] = useState({ min: '', max: '' });
  const [sort, setSort] = useState<Sort>('featured');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState(false);
  const [busyId, setBusyId] = useState<string>();
  const [pending, setPending] = useState<Product>();

  // Deep links like /marketplace?category=<id> preselect a category.
  useEffect(() => {
    const c = router.query.category;
    if (typeof c === 'string' && c) setF((prev) => ({ ...prev, category: c }));
  }, [router.query.category]);

  const update = (patch: Partial<Filters>) => {
    setF((prev) => ({ ...prev, ...patch }));
    setPage(1);
  };
  const setCategory = (category: string) => {
    update({ category });
    setDrawer(false);
  };
  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Products';

  const filtered = useMemo(() => {
    const q = f.q.toLowerCase();
    const list = products.filter(
      (p) =>
        (f.category === 'all' || p.categoryId === f.category) &&
        (!q || `${p.name} ${p.categoryName ?? ''}`.toLowerCase().includes(q)) &&
        (f.pmin == null || p.price >= f.pmin) &&
        (f.pmax == null || p.price <= f.pmax) &&
        (!f.inStock || p.stockQuantity > 0),
    );
    if (sort === 'az') return [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'low') return [...list].sort((a, b) => a.price - b.price);
    if (sort === 'high') return [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [products, f, sort]);
  const shown = filtered.slice(0, page * PAGE_SIZE);

  const chips: [keyof Filters | 'price', string][] = [];
  if (f.category !== 'all') chips.push(['category', categoryName(f.category)]);
  if (f.q) chips.push(['q', `“${f.q}”`]);
  if (f.pmin != null || f.pmax != null) chips.push(['price', `₦${f.pmin ?? 0} – ${f.pmax != null ? `₦${f.pmax}` : 'any'}`]);
  if (f.inStock) chips.push(['inStock', 'In stock']);

  const removeChip = (key: keyof Filters | 'price') => {
    if (key === 'category') update({ category: 'all' });
    if (key === 'q') update({ q: '' });
    if (key === 'price') {
      update({ pmin: null, pmax: null });
      setPriceInput({ min: '', max: '' });
    }
    if (key === 'inStock') update({ inStock: false });
  };

  const applyPrice = () => {
    update({
      pmin: priceInput.min === '' ? null : Number(priceInput.min),
      pmax: priceInput.max === '' ? null : Number(priceInput.max),
    });
    setDrawer(false);
  };

  const clearAll = () => {
    update(EMPTY);
    setPriceInput({ min: '', max: '' });
  };

  const addToCart = async (product: Product) => {
    setBusyId(product.id);
    try {
      await api('/cart/add', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity: 1, deliverySlot: 'morning' }),
      });
      await refreshCart();
      showToast(`${product.name} added to cart`, 'success');
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setBusyId(undefined);
    }
  };

  const onAdd = (product: Product) => {
    if (!user) { setPending(product); return; }
    if (user.role !== 'customer') { showToast('Only customer accounts can add items to the cart.', 'error'); return; }
    void addToCart(product);
  };

  return (
    <ChainChrome title="Products | DOVA Chain">
      <div className={cx(styles.page, fraunces.variable, manrope.variable)}>
        <section className={styles.intro}>
          <div className={styles.container}>
            <div className={styles.crumbs}><Link href="/">Home</Link> / Products</div>
            <h1>DOVA <em>Marketplace</em></h1>
            <p>Fresh and agricultural produce, ordered in a few taps.</p>
            <div className={styles.shopBar}>
              <div className={styles.search}>
                <input
                  type="search"
                  value={f.q}
                  onChange={(e) => update({ q: e.target.value.trimStart() })}
                  placeholder="Search fish, vegetables, grains, fruits and more"
                  aria-label="Search products"
                />
              </div>
              <button
                className={cx(styles.btn, styles.gold)}
                type="button"
                onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Search
              </button>
            </div>
            <div className={styles.catStrip} aria-label="Categories">
              {[{ id: 'all', name: 'All' }, ...categories].map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={cx(styles.chip, f.category === c.id && styles.chipActive)}
                  onClick={() => setCategory(c.id)}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className={cx(styles.container, styles.shop)}>
          <aside className={cx(styles.sidebar, drawer && styles.sidebarOpen)} aria-label="Filters">
            <div className={styles.sbHead}>
              <b>Filters</b>
              <button className={styles.sbClear} type="button" onClick={clearAll}>Clear all</button>
            </div>
            <div className={styles.sbSec}>
              <div className={styles.sbTitle}>Category</div>
              <div className={styles.sbList}>
                {[{ id: 'all', name: 'All products' }, ...categories].map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={cx(styles.sbItem, f.category === c.id && styles.sbItemActive)}
                    onClick={() => setCategory(c.id)}
                  >
                    <i />
                    {c.name}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.sbSec}>
              <div className={styles.sbTitle}>Price (₦)</div>
              <div className={styles.priceRow}>
                <input
                  type="number"
                  min={0}
                  placeholder="Min"
                  inputMode="numeric"
                  value={priceInput.min}
                  onChange={(e) => setPriceInput((p) => ({ ...p, min: e.target.value }))}
                />
                <input
                  type="number"
                  min={0}
                  placeholder="Max"
                  inputMode="numeric"
                  value={priceInput.max}
                  onChange={(e) => setPriceInput((p) => ({ ...p, max: e.target.value }))}
                />
              </div>
              <button className={cx(styles.btn, styles.green, styles.sm, styles.block, styles.applyBtn)} type="button" onClick={applyPrice}>
                Apply
              </button>
            </div>
            <div className={styles.sbSec}>
              <div className={styles.sbTitle}>Availability</div>
              <label className={styles.sbCheck}>
                <input type="checkbox" checked={f.inStock} onChange={(e) => update({ inStock: e.target.checked })} /> In stock only
              </label>
            </div>
          </aside>
          <div className={cx(styles.drawerBg, drawer && styles.drawerBgOpen)} onClick={() => setDrawer(false)} />

          <section className={styles.results} id="products">
            <div className={styles.resHead}>
              <div>
                <h2>{f.category === 'all' ? 'All Products' : categoryName(f.category)}</h2>
                <small>
                  {loading
                    ? 'Loading products…'
                    : `${filtered.length} product${filtered.length === 1 ? '' : 's'} found`}
                </small>
              </div>
              <div className={styles.resTools}>
                <button className={styles.fBtn} type="button" onClick={() => setDrawer(true)}>☰ Filters</button>
                <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sort by">
                  <option value="featured">Sort: Featured</option>
                  <option value="low">Price: Low to High</option>
                  <option value="high">Price: High to Low</option>
                  <option value="az">Name: A to Z</option>
                </select>
                <div className={styles.vt}>
                  <button type="button" className={cx(view === 'grid' && styles.vtOn)} onClick={() => setView('grid')} aria-label="Grid view">▦</button>
                  <button type="button" className={cx(view === 'list' && styles.vtOn)} onClick={() => setView('list')} aria-label="List view">☰</button>
                </div>
              </div>
            </div>

            {chips.length > 0 && (
              <div className={styles.activeF}>
                {chips.map(([key, label]) => (
                  <span key={key} className={styles.af}>
                    {label}
                    <button type="button" onClick={() => removeChip(key)} aria-label="Remove filter">×</button>
                  </span>
                ))}
              </div>
            )}

            <div className={cx(styles.grid, view === 'list' && styles.gridList)}>
              {loading ? (
                <div className={styles.loadingCell}><Loading label="Loading products…" block /></div>
              ) : shown.length ? (
                shown.map((p) => <ProductCard key={p.id} product={p} busy={busyId === p.id} onAdd={onAdd} />)
              ) : (
                <p className={styles.notice}>No products match these filters.</p>
              )}
            </div>

            {filtered.length > shown.length && (
              <div className={styles.more}>
                <button className={cx(styles.btn, styles.outline)} type="button" onClick={() => setPage((n) => n + 1)}>
                  Show more products
                </button>
              </div>
            )}
          </section>
        </div>
      </div>

      <LoginModal
        open={Boolean(pending)}
        onClose={() => setPending(undefined)}
        onSuccess={() => {
          const p = pending;
          setPending(undefined);
          // `user` in this closure is stale right after login, so add directly.
          if (p) void addToCart(p);
        }}
      />
    </ChainChrome>
  );
}
