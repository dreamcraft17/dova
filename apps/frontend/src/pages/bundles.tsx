import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChainChrome } from '../components/ChainChrome';
import { Loading } from '../components/Loading';
import { ProductImage } from '../components/ProductImage';
import { api } from '../lib/api';
import type { BundleSummary } from 'dova-shared';

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
};

function BundleCard({ bundle }: { bundle: BundleSummary }) {
  const out = bundle.computed.isOutOfStock;
  return (
    <Link className="card" href={`/bundles/${bundle.id}`}>
      <div className="visual">
        <span className="badge">{bundle.status === 'active' && !out ? 'Bundle' : 'Coming Soon'}</span>
        <div className="pack">
          <ProductImage name={bundle.name} imageUrl={bundle.imageUrl} categoryName={bundle.categoryName} decorative={false} />
        </div>
      </div>
      <div className="body">
        <h3>{bundle.name}</h3>
        <div className="meta">{bundle.categoryName || 'Bundle contents from backend'}</div>
        <div className="price">
          {bundle.bundlePrice > 0 ? `₦ ${bundle.bundlePrice.toLocaleString('en-NG')}` : '₦ —'}
        </div>
        <span className="status">
          {out ? 'Out of Stock' : bundle.computed.savingsPercentage > 0 ? `Save ${bundle.computed.savingsPercentage}%` : 'Available'}
        </span>
      </div>
    </Link>
  );
}

export default function Bundles() {
  const [bundles, setBundles] = useState<BundleSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<{ data: BundleSummary[] }>('/bundles?page=1&limit=24')
      .then((r) => setBundles(r.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  return (
    <ChainChrome title="Bundles — DOVA Chain">
      <section style={styles.hero}>
        <div style={styles.container}>
          <div style={styles.heroGrid}>
            <div style={styles.heroCopy}>
              <div style={styles.eyebrow}>DOVA Bundles</div>
              <h1 style={styles.h1}>Curated food combinations, built for simpler buying.</h1>
              <p style={styles.heroP}>
                Bundles combine complementary products from the DOVA supply chain. Contents, prices
                and availability come straight from the bundle backend.
              </p>
              <div style={styles.heroActions}>
                <Link style={{ ...styles.btn, ...styles.gold }} href="#bundles">
                  Explore Bundles
                </Link>
                <Link style={{ ...styles.btn, ...styles.outline }} href="/marketplace">
                  Shop Marketplace
                </Link>
              </div>
            </div>
            <div style={styles.heroVisual}>
              <div style={styles.heroPhoto}>
                <img
                  src="/images/bundles-hero.jpeg"
                  alt="DOVA bundle products"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.9) contrast(1.02)' }}
                />
                <div style={{ content: '""', position: 'absolute' as const, inset: 0, background: 'linear-gradient(180deg, rgba(3, 31, 23, 0.02), rgba(3, 31, 23, 0.45))' }} />
              </div>
              <div style={styles.flowDiagram}>
                <b style={styles.flowItem}>SELECT</b>
                <span style={styles.flowArrow}>→</span>
                <b style={styles.flowItem}>COMBINE</b>
                <span style={styles.flowArrow}>→</span>
                <b style={styles.flowItem}>SAVE</b>
                <span style={styles.flowArrow}>→</span>
                <b style={styles.flowItem}>DELIVER</b>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="bundles">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Bundles</div>
              <h2>Shop DOVA bundles</h2>
            </div>
            <p style={{ fontSize: '13px' }}>Bundle cards use the same compact two-column mobile system as the marketplace.</p>
          </div>
          <div className="notice" style={{ fontSize: '13px' }}>
            Bundle contents, prices, savings and availability come from the bundle API. Unavailable
            bundles are clearly marked instead of showing invented offers.
          </div>
          <div className="grid2">
            {loading ? (
              <Loading label="Loading bundles…" block />
            ) : bundles.length === 0 ? (
              <div className="panel">
                <strong>No bundles available.</strong>
                <p>New bundles are being prepared. Check back soon.</p>
              </div>
            ) : (
              bundles.map((b) => <BundleCard key={b.id} bundle={b} />)
            )}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="steps">
            <div className="step"><b>01 · Choose</b><span>Select a bundle.</span></div>
            <div className="step"><b>02 · Confirm</b><span>Review contents and price.</span></div>
            <div className="step"><b>03 · Fulfill</b><span>DOVA prepares the order.</span></div>
            <div className="step"><b>04 · Receive</b><span>Get your food products.</span></div>
          </div>
        </div>
      </section>
    </ChainChrome>
  );
}