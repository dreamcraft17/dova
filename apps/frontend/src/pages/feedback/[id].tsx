import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import type { FeedbackComment, FeedbackPost } from 'dova-shared';
import { feedbackStatusLabel } from 'dova-shared';

export default function FeedbackDetailPage() {
  const router = useRouter();
  const id = typeof router.query.id === 'string' ? router.query.id : '';
  const { user } = useAuth();
  const { showToast } = useToast();
  const [post, setPost] = useState<FeedbackPost | null>(null);
  const [comments, setComments] = useState<FeedbackComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api<FeedbackPost>(`/feedback/posts/${id}`),
      api<FeedbackComment[]>(`/feedback/posts/${id}/comments`),
    ])
      .then(([p, c]) => {
        setPost(p);
        setComments(c);
      })
      .catch((err) => showToast((err as Error).message, 'error'))
      .finally(() => setLoading(false));
  }, [id, showToast]);

  async function submitComment(e: FormEvent) {
    e.preventDefault();
    if (!id) return;
    setBusy(true);
    try {
      await api(`/feedback/posts/${id}/comments`, {
        method: 'POST',
        body: JSON.stringify(user ? { body } : { body, authorName }),
      });
      setBody('');
      const updated = await api<FeedbackComment[]>(`/feedback/posts/${id}/comments`);
      setComments(updated);
      showToast('Comment posted.', 'success');
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function vote() {
    if (!user || !id) {
      showToast('Log in to vote on ideas.', 'info');
      return;
    }
    try {
      const updated = await api<FeedbackPost>(`/feedback/posts/${id}/vote`, { method: 'POST' });
      setPost(updated);
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  }

  return (
    <Layout>
      <section className="cart-section feedback-section">
        <div className="feedback-back-nav">
          <Link href="/feedback" className="feedback-back-link">
            ← Back to feedback board
          </Link>
        </div>
        {loading || !post ? (
          <Loading label="Loading idea…" block />
        ) : (
          <div className="feedback-detail-container">
            <article className="card feedback-detail">
              <div className="feedback-detail-layout">
                <button
                  type="button"
                  className="feedback-vote-btn detail-vote-btn"
                  onClick={() => void vote()}
                  title="Vote for this idea"
                  aria-label={`Vote for ${post.title}`}
                >
                  <span className="vote-arrow">▲</span>
                  <span className="vote-count">{post.votes}</span>
                </button>
                <div className="feedback-detail-content">
                  <div className="feedback-card-head">
                    <h1>{post.title}</h1>
                    <span className={`feedback-badge status-${post.status}`}>{feedbackStatusLabel(post.status)}</span>
                  </div>
                  <p className="feedback-detail-desc">{post.description}</p>
                  <div className="feedback-meta">
                    <span>By {post.authorName}</span>
                    <span>•</span>
                    <span>{new Date(post.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  </div>
                </div>
              </div>
            </article>

            <section className="feedback-comments">
              <h2>Comments ({comments.length})</h2>
              {comments.length ? (
                <ul className="feedback-comment-list">
                  {comments.map((comment) => (
                    <li key={comment.id} className={`card feedback-comment${comment.isOfficial ? ' official' : ''}`}>
                      <p>{comment.body}</p>
                      <div className="feedback-meta">
                        <span className="comment-author">
                          {comment.authorName}
                          {comment.isOfficial ? <span className="official-badge">DOVA Team</span> : null}
                        </span>
                        <span>•</span>
                        <span>{new Date(comment.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="feedback-no-comments">No comments yet. Start the conversation below!</p>
              )}
              <form className="card feedback-form" onSubmit={submitComment}>
                <h3>Add a comment</h3>
                {!user ? (
                  <label>
                    Your name
                    <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required minLength={2} placeholder="e.g. Alex" />
                  </label>
                ) : (
                  <p className="form-hint">Commenting as <strong>{user.fullName}</strong></p>
                )}
                <label>
                  Comment
                  <textarea value={body} onChange={(e) => setBody(e.target.value)} required minLength={2} rows={3} placeholder="Share your thoughts or feedback..." />
                </label>
                <button className="button" type="submit" disabled={busy}>
                  {busy ? <Loading label="Posting…" inline size="sm" /> : 'Post comment'}
                </button>
              </form>
            </section>
          </div>
        )}
      </section>
    </Layout>
  );
}
