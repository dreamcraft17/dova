import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ChainChrome } from '../components/ChainChrome';
import { api } from '../lib/api';

function ContactForm() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const f = new FormData(event.currentTarget);
      await api('/contact', { method: 'POST', body: JSON.stringify(Object.fromEntries(f)) });
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
        <input name="name" required placeholder="Full name" />
      </div>
      <div className="field">
        <label>Email</label>
        <input name="email" type="email" required placeholder="Email address" />
      </div>
      <div className="field">
        <label>Topic</label>
        <select name="topic">
          <option>Customer Support</option>
          <option>Business Supply</option>
          <option>Farmer / Supplier</option>
          <option>Partnership</option>
          <option>Technology</option>
          <option>Other</option>
        </select>
      </div>
      <div className="field">
        <label>Message</label>
        <textarea name="message" required placeholder="How can DOVA help?" />
      </div>
      <button className="btn green" disabled={busy}>
        {busy ? 'Sending…' : 'Send Message'}
      </button>
      {done && (
        <p style={{ fontSize: '.62rem', color: 'var(--emerald)' }}>
          Thanks — your message has been received. We’ll get back to you soon.
        </p>
      )}
      {error && <p style={{ fontSize: '.62rem', color: '#b3423a' }}>{error}</p>}
    </form>
  );
}

export default function Contact() {
  return (
    <ChainChrome title="Contact Us — DOVA Chain">
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <div className="eyebrow">Contact DOVA Chain</div>
            <h1>Let&apos;s connect around food, technology and supply.</h1>
            <p>For customer support, farmer/supplier inquiries, business supply or partnership conversations, use the appropriate route below.</p>
          </div>
          <div className="hero-art">
            <div className="flow">
              <b>CUSTOMERS</b>
              <b>FARMERS</b>
              <b>BUSINESSES</b>
              <b>PARTNERS</b>
            </div>
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="contact-grid">
            <div>
              <div className="contact-card">
                <strong>Customer support</strong>
                <span>Questions about products, orders, delivery or feedback.</span>
                <a className="btn outline" href="mailto:officialdovachain@gmail.com" style={{ marginTop: '12px' }}>Email Support</a>
              </div>
              <div className="contact-card" style={{ marginTop: '10px' }}>
                <strong>Business &amp; partnerships</strong>
                <span>Restaurants, retailers, commercial buyers, technology partners and ecosystem conversations.</span>
                <a className="btn outline" href="mailto:officialdovachain@gmail.com" style={{ marginTop: '12px' }}>Start a Conversation</a>
              </div>
              <div className="contact-card" style={{ marginTop: '10px' }}>
                <strong>Farmers &amp; suppliers</strong>
                <span>Join the DOVA network and share your supply information through the farmer onboarding flow.</span>
                <Link className="btn outline" href="/auth/supplier-register" style={{ marginTop: '12px' }}>Join the Network</Link>
              </div>
            </div>
            <div className="panel">
              <div className="eyebrow">Send a message</div>
              <h2>Contact form</h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </ChainChrome>
  );
}