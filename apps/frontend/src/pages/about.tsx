import { Layout } from '../components/Layout';
import Link from 'next/link';

export default function About() {
  return (
    <Layout>
      <section className="form-page" style={{ maxWidth: 720 }}>
        <p className="eyebrow">About DOVA</p>
        <h1>Building a trusted agricultural marketplace.</h1>
        <p className="lead">
          DOVA connects verified farmers and suppliers with customers through a secure, transparent
          marketplace — so fresh produce moves with clarity, fair pricing, and reliable delivery.
        </p>
        <div className="how-grid" style={{ marginTop: 40, textAlign: 'left' }}>
          <div className="how-card">
            <div className="how-icon">✓</div>
            <h3>Verified network</h3>
            <p>Suppliers are reviewed so customers can source with confidence.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">🌿</div>
            <h3>Quality first</h3>
            <p>Fresh agricultural products sourced directly from trusted producers.</p>
          </div>
          <div className="how-card">
            <div className="how-icon">🤝</div>
            <h3>Fair access</h3>
            <p>A marketplace built for honest trade between farmers and businesses.</p>
          </div>
        </div>
        <p style={{ marginTop: 40 }}>
          <Link href="/products" className="button">
            Explore marketplace
          </Link>
        </p>
      </section>
    </Layout>
  );
}
