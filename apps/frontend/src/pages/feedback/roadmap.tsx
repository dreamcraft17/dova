import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { api } from '../../lib/api';
import type { FeedbackPost, FeedbackStatus } from 'dova-shared';
import { FEEDBACK_STATUSES, feedbackStatusLabel } from 'dova-shared';

type RoadmapColumns = Record<FeedbackStatus, FeedbackPost[]>;

export default function FeedbackRoadmapPage() {
  const [columns, setColumns] = useState<RoadmapColumns | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api<RoadmapColumns>('/feedback/roadmap')
      .then(setColumns)
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <section className="cart-section feedback-section">
        <div className="section-head">
          <p className="eyebrow">Roadmap</p>
          <h1>What we&apos;re building</h1>
          <p>Community-voted ideas moving from open → planned → in progress → done.</p>
          <p style={{ marginTop: 12 }}>
            <Link href="/feedback">← Back to feedback board</Link>
          </p>
        </div>

        {loading || !columns ? (
          <Loading label="Loading roadmap…" block />
        ) : (
          <div className="roadmap-grid">
            {FEEDBACK_STATUSES.map((status) => (
              <div key={status} className="roadmap-column card">
                <h2>{feedbackStatusLabel(status)}</h2>
                {columns[status].length ? (
                  <ul className="roadmap-list">
                    {columns[status].map((post) => (
                      <li key={post.id}>
                        <Link href={`/feedback/${post.id}`}>
                          <strong>{post.title}</strong>
                        </Link>
                        <span className="roadmap-votes">▲ {post.votes}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="muted">Nothing here yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
}
