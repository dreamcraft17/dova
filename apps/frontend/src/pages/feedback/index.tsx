import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../../components/Layout';
import { Loading } from '../../components/Loading';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../lib/api';
import type { FeedbackPost } from 'dova-shared';
import { feedbackStatusLabel } from 'dova-shared';

export default function FeedbackPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [posts, setPosts] = useState<FeedbackPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [sort, setSort] = useState<'votes' | 'new'>('votes');
  const [search, setSearch] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [authorName, setAuthorName] = useState('');

  const load = () => {
    setLoading(true);
    const q = search.trim() ? `&search=${encodeURIComponent(search.trim())}` : '';
    return api<FeedbackPost[]>(`/feedback/posts?sort=${sort}${q}`)
      .then(setPosts)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void load();
  }, [sort]);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await api('/feedback/posts', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          ...(user ? {} : { authorName, authorEmail: undefined }),
        }),
      });
      setTitle('');
      setDescription('');
      setAuthorName('');
      showToast('Thanks — your idea was submitted!', 'success');
      await load();
    } catch (err) {
      showToast((err as Error).message, 'error');
    } finally {
      setBusy(false);
    }
  }

  async function vote(postId: string) {
    if (!user) {
      showToast('Log in to vote on ideas.', 'info');
      return;
    }
    try {
      await api(`/feedback/posts/${postId}/vote`, { method: 'POST' });
      await load();
    } catch (err) {
      showToast((err as Error).message, 'error');
    }
  }

  return (
    <Layout>
      <section className="cart-section feedback-section">
        <div className="section-head">
          <p className="eyebrow">Feedback</p>
          <h1>Help shape DOVA</h1>
          <p>Share ideas, vote on what matters, and follow progress on the roadmap and changelog.</p>
          <p style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/feedback/roadmap" className="button small">
              View roadmap →
            </Link>
            <Link href="/feedback/changelog" className="button small secondary">
              Changelog →
            </Link>
          </p>
        </div>

        <div className="feedback-layout">
          <form className="card feedback-form" onSubmit={submit}>
            <h2>Submit an idea</h2>
            {!user ? (
              <label>
                Your name
                <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required minLength={2} />
              </label>
            ) : (
              <p className="form-hint">Posting as {user.fullName}</p>
            )}
            <label>
              Title
              <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} placeholder="Short summary" />
            </label>
            <label>
              Description
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} rows={4} placeholder="What problem does this solve?" />
            </label>
            <button className="button" type="submit" disabled={busy}>
              {busy ? <Loading label="Submitting…" inline size="sm" /> : 'Submit idea'}
            </button>
          </form>

          <div className="feedback-list-wrap">
            <div className="feedback-sort">
              <span>Sort by</span>
              <button type="button" className={sort === 'votes' ? 'active' : ''} onClick={() => setSort('votes')}>Top votes</button>
              <button type="button" className={sort === 'new' ? 'active' : ''} onClick={() => setSort('new')}>Newest</button>
            </div>
            <form
              className="feedback-search"
              onSubmit={(e) => {
                e.preventDefault();
                void load();
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search ideas…"
                aria-label="Search feedback ideas"
              />
              <button type="submit" className="button small">Search</button>
            </form>
            {loading ? (
              <Loading label="Loading ideas…" block />
            ) : posts.length ? (
              <ul className="feedback-list">
                {posts.map((post) => (
                  <li key={post.id} className="card feedback-card">
                    <div className="feedback-card-head">
                      <h3>
                        <Link href={`/feedback/${post.id}`}>{post.title}</Link>
                      </h3>
                      <span className="feedback-badge">{feedbackStatusLabel(post.status)}</span>
                    </div>
                    <p>{post.description}</p>
                    <div className="feedback-meta">
                      <span>{post.authorName}</span>
                      <span>{new Date(post.createdAt).toLocaleDateString('en-NG')}</span>
                      {post.commentCount ? <span>{post.commentCount} comments</span> : null}
                    </div>
                    <button type="button" className="feedback-vote" onClick={() => void vote(post.id)}>
                      ▲ {post.votes}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No ideas match your search — try another term or submit one.</p>
            )}
          </div>
        </div>
      </section>
    </Layout>
  );
}
