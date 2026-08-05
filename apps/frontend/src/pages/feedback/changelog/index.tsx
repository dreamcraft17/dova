import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../../components/Layout';
import { Loading } from '../../../components/Loading';
import { api } from '../../../lib/api';
import type { ChangelogEntry } from 'dova-shared';

export default function ChangelogListPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<ChangelogEntry[]>('/feedback/changelog')
      .then(setEntries)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <section className="cart-section feedback-section">
        <div className="section-head">
          <p className="eyebrow">Changelog</p>
          <h1>What&apos;s new in DOVA</h1>
          <p>Product updates and shipped community ideas.</p>
          <p style={{ marginTop: 12 }}>
            <Link href="/feedback">← Back to feedback board</Link>
          </p>
        </div>

        {loading ? (
          <Loading label="Loading changelog…" block />
        ) : entries.length ? (
          <ul className="feedback-list">
            {entries.map((entry) => (
              <li key={entry.id} className="card feedback-card">
                <h2>
                  <Link href={`/feedback/changelog/${entry.slug}`}>{entry.title}</Link>
                </h2>
                <p>{entry.summary}</p>
                <div className="feedback-meta">
                  <span>{new Date(entry.publishedAt).toLocaleDateString('en-NG')}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No changelog entries yet.</p>
        )}
      </section>
    </Layout>
  );
}
