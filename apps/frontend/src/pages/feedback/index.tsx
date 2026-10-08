import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ChainChrome } from '../../components/ChainChrome';
import { api } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

function FeedbackForm() {
  const { user } = useAuth();
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const f = new FormData(event.currentTarget);
      const type = String(f.get('type'));
      const feedback = String(f.get('feedback')).trim();
      await api('/feedback/posts', {
        method: 'POST',
        body: JSON.stringify({
          title: `${type}: ${feedback.split('\n')[0].slice(0, 60)}`,
          description: feedback,
          ...(user ? {} : { authorName: String(f.get('name')), authorEmail: String(f.get('email')) }),
        }),
      });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <label>Name</label>
        <input name="name" required placeholder="Your name" />
      </div>
      <div className="field">
        <label>Email</label>
        <input name="email" type="email" required placeholder="you@example.com" />
      </div>
      <div className="field">
        <label>Feedback type</label>
        <select name="type">
          <option>Product</option>
          <option>Website</option>
          <option>Ordering</option>
          <option>Delivery</option>
          <option>Support</option>
          <option>Farmer experience</option>
          <option>Business supply</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label>Feedback</label>
        <textarea name="feedback" required placeholder="Share your experience or suggestion…" />
      </div>
      <button className="btn green" disabled={busy}>
        {busy ? 'Sending…' : 'Send Feedback'}
      </button>
      {done && (
        <p style={{ fontSize: '.62rem', color: 'var(--emerald)' }}>
          Thank you — your feedback has been recorded.
        </p>
      )}
      {error && <p style={{ fontSize: '.62rem', color: '#b3423a' }}>{error}</p>}
    </form>
  );
}

export default function FeedbackPage() {
  return (
    <ChainChrome title="Feedback — DOVA Chain">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">DOVA Feedback</div>
            <h1>Help us build a better food experience.</h1>
            <p>Customers, farmers, businesses and partners can share what works, what does not, and what DOVA should improve.</p>
          </div>
          <div className="hero-art">
            <div className="flow">
              <b>LISTEN</b>
              <span>→</span>
              <b>LEARN</b>
              <span>→</span>
              <b>IMPROVE</b>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div className="panel">
              <div className="eyebrow">Feedback form</div>
              <h2>Tell DOVA what you think</h2>
              <FeedbackForm />
            </div>
            <div>
              <div className="contact-card">
                <strong>What can you tell us?</strong>
                <span>Product quality, website experience, ordering, delivery, customer support, farmer onboarding or business supply.</span>
              </div>
              <div className="contact-card" style={{ marginTop: '10px' }}>
                <strong>Need direct support?</strong>
                <span>For an account or order issue, use the Contact Us page so the support request can be routed appropriately.</span>
                <Link className="btn outline" href="/contact" style={{ marginTop: '12px' }}>Contact DOVA</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </ChainChrome>
  );
}