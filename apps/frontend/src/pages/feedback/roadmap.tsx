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
      <div className="fb-container">
        <div className="fb-hero">
          <div className="fb-hero-text">
            <h1>Product Roadmap</h1>
            <p>Community-voted ideas moving from open → planned → in progress → done.</p>
          </div>
          <div className="fb-hero-links">
            <Link href="/feedback" className="fb-link-btn secondary">← Back to Feedback</Link>
          </div>
        </div>

        {loading || !columns ? (
          <Loading label="Loading roadmap…" block />
        ) : (
          <div className="fb-roadmap">
            {FEEDBACK_STATUSES.map((status) => (
              <div key={status} className={`fb-rm-col s-${status}`}>
                <div className="fb-rm-head">
                  <h2>{feedbackStatusLabel(status)}</h2>
                  <span className="fb-rm-count">{columns[status].length}</span>
                </div>
                {columns[status].length ? (
                  <div className="fb-rm-list">
                    {columns[status].map((post) => (
                      <div key={post.id} className="fb-rm-card">
                        <div className="fb-rm-top">
                          <Link href={`/feedback/${post.id}`} className="fb-rm-title">{post.title}</Link>
                          <span className="fb-rm-votes">▲ {post.votes}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="fb-rm-empty">Nothing here yet.</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
