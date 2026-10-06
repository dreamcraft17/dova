import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ChainChrome } from '../components/ChainChrome';
import { Loading } from '../components/Loading';
import { LoginModal } from '../components/LoginModal';
import { ProductImage } from '../components/ProductImage';
import { api } from '../lib/api';
import { fraunces, manrope } from '../lib/fonts';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { BundleDetail, BundleSummary } from 'dova-shared';
import styles from '../styles/bundles.module.css';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');
const naira = (n: number) => `₦${n.toLocaleString('en-NG')}`;

type BundleView = BundleSummary & { contents?: BundleDetail['contents'] };

function BundleCard({ bundle, busy, onOrder }: { bundle: BundleView; busy: boolean; onOrder: (b: BundleView) => void }) {
  const out = bundle.status !== 'active' || bundle.computed.isOutOfStock;
  const hasSavings = bundle.computed.savingsAmount > 0;
  const contents = [...(bundle.contents ?? [])].sort((a, b) => a.position - b.position);

  return (
    <article className={styles.card}>
      <Link className={styles.image} href={`/bundles/${bundle.id}`} aria-label={bundle.name}>
        <ProductImage name={bundle.name} imageUrl={bundle.imageUrl} categoryName={bundle.categoryName} decorative={false} />
      </Link>
      <div className={styles.top}>
        <span className={cx(styles.pill, styles.soon)}>{bundle.categoryName || 'Bundle'}</span>
        <span className={cx(styles.pill, out ? styles.out : styles.live)}>{out ? 'Unavailable' : 'Available'}</span>
      </div>
      <h3>
        <Link className={styles.titleLink} href={`/bundles/${bundle.id}`}>{bundle.name}</Link>
      </h3>
      <ul className={styles.items}>
        {contents.map((c) => (
          <li key={c.productId}>
            {c.product?.name ?? 'Item'}
            <span>× {c.quantity}</span>
          </li>
        ))}
      </ul>
      <div className={styles.foot}>
        <div className={styles.price}>
          <small>Bundle price</small>
          {bundle.bundlePrice > 0 ? naira(bundle.bundlePrice) : 'Price on request'}
          {hasSavings && <span className={styles.oldPrice}>{naira(bundle.computed.individualTotal)}</span>}
        </div>
        <button className={styles.addBtn} type="button" disabled={out || busy} onClick={() => onOrder(bundle)}>
          {busy ? 'Adding…' : 'Order'}
        </button>
      </div>
    </article>
  );
}

export default function Bundles() {
  const { user } = useAuth();
  const { refresh: refreshCart } = useCart();
  const { showToast } = useToast();
  const [bundles, setBundles] = useState<BundleView[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [busyId, setBusyId] = useState<string>();
  const [pending, setPending] = useState<BundleView>();

  useEffect(() => {
    api<{ data: BundleSummary[] }>('/bundles?page=1&limit=24')
      .then(async (r) => {
        setBundles(r.data);
        // The list endpoint has no contents; load each bundle's detail to show its items.
        const details = await Promise.all(
          r.data.map((b) => api<BundleDetail>(`/bundles/${b.id}`).catch(() => undefined)),
        );
        setBundles(r.data.map((b, i) => ({ ...b, contents: details[i]?.contents })));
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(
    () => Array.from(new Set(bundles.map((b) => b.categoryName).filter((c): c is string => Boolean(c)))),
    [bundles],
  );
  const visible = bundles.filter((b) => category === 'all' || b.categoryName === category);

  const addToCart = async (bundle: BundleView) => {
    setBusyId(bundle.id);
    try {
      await api('/cart/add-bundle', {
        method: 'POST',
        body: JSON.stringify({ bundleId: bundle.id, quantity: 1, deliverySlot: 'morning' }),
      });
      await refreshCart();
      showToast(`${bundle.name} added to cart`, 'success');
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setBusyId(undefined);
    }
  };

  const order = (bundle: BundleView) => {
    if (!user) { setPending(bundle); return; }
    if (user.role !== 'customer') { showToast('Only customer accounts can add items to the cart.', 'error'); return; }
    void addToCart(bundle);
  };

  return (
    <ChainChrome title="Bundles | DOVA Chain">
      <div className={cx(styles.page, fraunces.variable, manrope.variable)}>
        <section className={styles.intro}>
          <div className={styles.container}>
            <div className={styles.eyebrow}>DOVA Bundles</div>
            <h1>Product <em>bundles</em></h1>
            <p>Grouped food and produce selections for households, families and businesses.</p>
          </div>
        </section>

        <div className={styles.stickyBar}>
          <div className={styles.container}>
            <div className={styles.chips}>
              {['all', ...categories].map((c) => (
                <button
                  key={c}
                  type="button"
                  className={cx(styles.chip, category === c && styles.chipActive)}
                  onClick={() => setCategory(c)}
                >
                  {c === 'all' ? 'All' : c}
                </button>
              ))}
            </div>
          </div>
        </div>

        <section className={styles.section}>
          <div className={styles.container}>
            <div className={styles.resultLine}>
              <span>
                {bundles.length ? `${visible.length} bundle${visible.length === 1 ? '' : 's'}` : 'Bundles'}
              </span>
            </div>
            {loading ? (
              <Loading label="Loading bundles…" block />
            ) : bundles.length === 0 ? (
              <div className={styles.empty}>
                <h3>No bundles available.</h3>
                <p>New bundles are being prepared. Check back soon.</p>
              </div>
            ) : (
              <div className={styles.grid}>
                {visible.map((b) => (
                  <BundleCard key={b.id} bundle={b} busy={busyId === b.id} onOrder={order} />
                ))}
              </div>
            )}
          </div>
        </section>

        <section className={cx(styles.section, styles.deep)}>
          <div className={styles.container}>
            <div className={styles.steps}>
              <div className={styles.step}><b>01</b><h3>Choose</h3><p>Pick a bundle that fits your need.</p></div>
              <div className={styles.step}><b>02</b><h3>Confirm</h3><p>Review contents and price.</p></div>
              <div className={styles.step}><b>03</b><h3>Fulfil</h3><p>DOVA prepares the order.</p></div>
              <div className={styles.step}><b>04</b><h3>Receive</h3><p>Get your food products.</p></div>
            </div>
          </div>
        </section>
      </div>

      <LoginModal
        open={Boolean(pending)}
        onClose={() => setPending(undefined)}
        onSuccess={() => {
          const b = pending;
          setPending(undefined);
          // `user` in this closure is stale right after login, so add directly.
          if (b) void addToCart(b);
        }}
      />
    </ChainChrome>
  );
}
