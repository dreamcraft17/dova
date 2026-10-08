import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../../components/Layout';
import { Loading } from '../../../components/Loading';
import { api } from '../../../lib/api';
import type { ChangelogEntry } from 'dova-shared';

export default function ChangelogDetailPage() {
  const router = useRouter();
  const slug = typeof router.query.slug === 'string' ? router.query.slug : '';
  const [entry, setEntry] = useState<ChangelogEntry | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    api<ChangelogEntry>(`/feedback/changelog/${slug}`)
      .then(setEntry)
      .finally(() => setLoading(false));
  }, [slug]);

  return (
    <Layout>
      <section className="cart-section feedback-section">
        <div className="feedback-back-nav">
          <Link href="/feedback/changelog" className="feedback-back-link">
            ← Back to changelog
          </Link>
        </div>
        {loading || !entry ? (
          <Loading label="Loading update…" block />
        ) : (
          <article className="card feedback-detail changelog-detail">
            <span className="eyebrow">{new Date(entry.publishedAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            <h1>{entry.title}</h1>
            <p className="changelog-summary">{entry.summary}</p>
            <hr className="changelog-divider" />
            <div className="changelog-body">{entry.body.split('\n').map((line, i) => (line ? <p key={i}>{line}</p> : <br key={i} />))}</div>
          </article>
        )}
      </section>
    </Layout>
  );
}
