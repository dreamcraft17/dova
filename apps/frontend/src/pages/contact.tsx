import { Layout } from '../components/Layout';
import { Loading } from '../components/Loading';
import { FormEvent, useState } from 'react';
import { api } from '../lib/api';

export default function Contact() {
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const f = new FormData(e.currentTarget);
      await api('/contact', { method: 'POST', body: JSON.stringify(Object.fromEntries(f)) });
      setDone(true);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  return (
    <Layout>
      <section className="form-page">
        <p className="eyebrow">Contact Us</p>
        <h1>Let’s talk.</h1>
        <p className="lead">Questions about orders, suppliers, or partnership? Send us a message.</p>
        <p className="form-hint">
          Email: <a href="mailto:support@dova.com">support@dova.com</a>
          <br />
          Phone: +234 800 000 0000
        </p>
        {done ? (
          <p>Thanks — your message has been received. We’ll get back to you soon.</p>
        ) : (
          <form onSubmit={submit}>
            <label>
              Name
              <input name="name" required minLength={2} />
            </label>
            <label>
              Email
              <input name="email" type="email" required />
            </label>
            <label>
              Message
              <textarea name="message" required rows={5} minLength={5} />
            </label>
            <button className="button" disabled={busy}>
              {busy ? <Loading label="Sending…" inline size="sm" /> : 'Send message'}
            </button>
            {error && <p className="error">{error}</p>}
          </form>
        )}
      </section>
    </Layout>
  );
}
