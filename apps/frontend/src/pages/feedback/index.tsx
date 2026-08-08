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
    const handler = setTimeout(() => {
      void load();
    }, 400);
    return () => clearTimeout(handler);
  }, [sort, search]);

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
      <div className="fb-container">
        <div className="fb-hero">
          <div className="fb-hero-text">
            <h1>Customer Feedback</h1>
            <p>Help us prioritize what to build next for DOVA.</p>
          </div>
          <div className="fb-hero-links">
            <Link href="/feedback/roadmap" className="fb-link-btn">Roadmap</Link>
            <Link href="/feedback/changelog" className="fb-link-btn secondary">Changelog</Link>
          </div>
        </div>

        <div className="fb-grid">
          <div className="fb-main">
            <div className="fb-toolbar">
              <div className="fb-tabs">
                <button type="button" className={sort === 'votes' ? 'active' : ''} onClick={() => setSort('votes')}>Top</button>
                <button type="button" className={sort === 'new' ? 'active' : ''} onClick={() => setSort('new')}>New</button>
              </div>
              <form
                className="fb-search-bar"
                onSubmit={(e) => e.preventDefault()}
              >
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search ideas..."
                />
              </form>
            </div>

            {loading ? (
              <Loading label="Loading..." block />
            ) : posts.length ? (
              <div className="fb-list">
                {posts.map((post) => (
                  <div key={post.id} className="fb-item">
                    <button type="button" className="fb-vote" onClick={() => void vote(post.id)}>
                      <span>▲</span>
                      <strong>{post.votes}</strong>
                    </button>
                    <div className="fb-item-content">
                      <div className="fb-item-top">
                        <Link href={`/feedback/${post.id}`} className="fb-title">{post.title}</Link>
                        <span className={`fb-tag s-${post.status}`}>{feedbackStatusLabel(post.status)}</span>
                      </div>
                      <p className="fb-desc">{post.description}</p>
                      <div className="fb-info">
                        <span>{post.authorName}</span>
                        <span>·</span>
                        <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                        {post.commentCount ? (
                          <>
                            <span>·</span>
                            <Link href={`/feedback/${post.id}`}>{post.commentCount} comments</Link>
                          </>
                        ) : null}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="fb-empty">No ideas found.</div>
            )}
          </div>

          <div className="fb-sidebar">
            <form className="fb-form" onSubmit={submit}>
              <h3>Submit Idea</h3>
              {!user ? (
                <div className="fb-field">
                  <label>Name</label>
                  <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} required minLength={2} placeholder="Your name" />
                </div>
              ) : (
                <div className="fb-user-badge">Posting as {user.fullName}</div>
              )}
              <div className="fb-field">
                <label>Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} placeholder="Brief summary" />
              </div>
              <div className="fb-field">
                <label>Details</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} required minLength={10} rows={3} placeholder="What should we add and why?" />
              </div>
              <button type="submit" className="fb-submit" disabled={busy}>
                {busy ? 'Sending...' : 'Post Idea'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}
