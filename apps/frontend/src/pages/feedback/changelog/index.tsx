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
      <div className="fb-container">
        <div className="fb-hero">
          <div className="fb-hero-text">
            <h1>Changelog</h1>
            <p>Product updates, new features, and shipped community ideas.</p>
          </div>
          <div className="fb-hero-links">
            <Link href="/feedback" className="fb-link-btn secondary">← Back to Feedback</Link>
          </div>
        </div>

        {loading ? (
          <Loading label="Loading changelog…" block />
        ) : entries.length ? (
          <div className="fb-list">
            {entries.map((entry) => (
              <div key={entry.id} className="fb-item fb-post-card">
                <div className="fb-item-content">
                  <div className="fb-item-top">
                    <Link href={`/feedback/changelog/${entry.slug}`} className="fb-title">{entry.title}</Link>
                    <span className="fb-tag fb-tag-date">{new Date(entry.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                  <p className="fb-desc">{entry.summary}</p>
                  <div className="fb-info">
                    <Link href={`/feedback/changelog/${entry.slug}`} className="fb-read-more">Read full update →</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="fb-empty">No changelog entries yet.</div>
        )}
      </div>
    </Layout>
  );
}
