import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChainChrome } from '../components/ChainChrome';
import { Loading } from '../components/Loading';
import { ProductImage } from '../components/ProductImage';
import { api } from '../lib/api';
import type { BundleSummary } from 'dova-shared';

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
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">DOVA Bundles</div>
            <h1>Curated food combinations, built for simpler buying.</h1>
            <p>
              Bundles combine complementary products from the DOVA supply chain. Contents, prices
              and availability come straight from the bundle backend.
            </p>
            <Link className="btn gold" href="#bundles" style={{ marginTop: '18px' }}>Explore Bundles</Link>
          </div>
          <div className="hero-art">
            <div className="flow">
              <b>SELECT</b>
              <span>→</span>
              <b>COMBINE</b>
              <span>→</span>
              <b>SAVE</b>
              <span>→</span>
              <b>DELIVER</b>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="bundles">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Bundle marketplace</div>
              <h2>Shop DOVA bundles</h2>
            </div>
            <p>Bundle cards use the same compact two-column mobile system as the marketplace.</p>
          </div>
          <div className="notice">
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