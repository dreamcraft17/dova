import Link from 'next/link';
import { ChainChrome } from '../components/ChainChrome';

const VALUES = [
  { title: 'Verified network', text: 'Suppliers are reviewed so customers can source with confidence.' },
  { title: 'Quality first', text: 'Fresh agricultural products sourced directly from trusted producers.' },
  { title: 'Fair access', text: 'A marketplace built for honest trade between farmers and businesses.' },
  { title: 'Reliable delivery', text: 'Coordinated fulfillment from source to customer.' },
];

export default function About() {
  return (
    <ChainChrome title="About DOVA Chain">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">About DOVA Chain</div>
            <h1>Building a trusted agricultural marketplace.</h1>
            <p>
              DOVA connects verified farmers and suppliers with customers through a secure,
              transparent marketplace — so fresh produce moves with clarity, fair pricing, and
              reliable delivery.
            </p>
            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <Link className="btn gold" href="/marketplace">Explore marketplace</Link>
              <Link
                className="btn outline"
                style={{ borderColor: 'rgba(255,255,255,.25)', color: '#fff' }}
                href="/auth/supplier-register"
              >
                Join the DOVA network
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <div className="flow">
              <b>SOURCE</b>
              <span>→</span>
              <b>VERIFY</b>
              <span>→</span>
              <b>PROCESS</b>
              <span>→</span>
              <b>DELIVER</b>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="about">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">Products first. Network next.</div>
              <h2>Mission &amp; Vision</h2>
            </div>
            <p>
              DOVA is an African food-supply-chain technology company building infrastructure that
              connects agricultural supply with real demand.
            </p>
          </div>
          <div className="grid2">
            <div className="card">
              <div className="visual">
                <div className="pack">MISSION</div>
              </div>
              <div className="body">
                <h3>Connect agricultural supply with dependable food access.</h3>
                <div className="meta">
                  Sourcing, processing, marketplace, distribution and fulfillment organized for
                  farmers, customers and businesses.
                </div>
              </div>
            </div>
            <div className="card">
              <div className="visual">
                <div className="pack">VISION</div>
              </div>
              <div className="body">
                <h3>Build a connected food network across Africa.</h3>
                <div className="meta">
                  Start with products, build the network around them, and grow toward broader food
                  infrastructure.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow">How DOVA works</div>
              <h2>Why choose DOVA?</h2>
            </div>
            <p>Trust is built through verified suppliers, transparent sourcing and reliable delivery.</p>
          </div>
          <div className="grid2">
            {VALUES.map((v) => (
              <div key={v.title} className="card">
                <div className="visual">
                  <div className="pack">{v.title.toUpperCase()}</div>
                </div>
                <div className="body">
                  <h3>{v.title}</h3>
                  <div className="meta">{v.text}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="panel" style={{ textAlign: 'center' }}>
            <div className="eyebrow">Build with DOVA</div>
            <h2>Start with Plantain Flour. Scale the catalog with purpose.</h2>
            <p style={{ maxWidth: 560, margin: '0 auto 18px' }}>
              From Farm to Table. On Time, Every Time. Whether you grow food, buy it for your
              household or source it for a business.
            </p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link className="btn gold" href="/marketplace">Shop Products</Link>
              <Link className="btn outline" href="/contact">Contact DOVA</Link>
            </div>
          </div>
        </div>
      </section>
    </ChainChrome>
  );
}