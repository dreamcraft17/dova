import { useCallback, useEffect, useState } from 'react';
import Head from 'next/head';
import { Layout } from '../components/Layout';
import { Loading, ProductGridSkeleton } from '../components/Loading';
import { BundleCard } from '../components/bundles/BundleCard';
import { api } from '../lib/api';
import type { BundleListResponse, Category } from 'dova-shared';

export default function Bundles() {
  const [bundles, setBundles] = useState<BundleListResponse['data']>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 24;

  useEffect(() => {
    api<Category[]>('/categories').then(setCategories).catch(() => undefined);
  }, []);

  const fetchBundles = useCallback(() => {
    setLoading(true);
    api<BundleListResponse>(
      `/bundles?search=${encodeURIComponent(search)}&categoryId=${categoryId}&page=${page}&limit=${limit}`,
    )
      .then((r) => {
        setBundles(r.data);
        setTotal(r.pagination.total);
        setError('');
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [search, categoryId, page, limit]);

  useEffect(() => {
    const t = setTimeout(() => {
      fetchBundles();
    }, 300);
    return () => clearTimeout(t);
  }, [fetchBundles]);

  return (
    <Layout>
      <Head>
        <title>Bundles — DOVA</title>
        <meta
          name="description"
          content="Curated bundles, better value. Save more with hand-picked product packages from DOVA."
        />
      </Head>

      <section className="page-head">
        <p className="eyebrow">Bundles</p>
        <h1>Curated bundles, better value</h1>
        <p className="lead">Save more with hand-picked product packages from DOVA.</p>
        <div className="filter-stack">
          <input
            className="search"
            placeholder="Search bundles..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
          />
          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option value={c.id} key={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      </section>

      {loading ? (
        <ProductGridSkeleton />
      ) : (
        <div className="page-content">
          <section className="grid">
            {error && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0' }}>
                <p className="error">{error}</p>
                <button
                  type="button"
                  className="button small"
                  onClick={fetchBundles}
                  style={{ marginTop: 8 }}
                >
                  Retry
                </button>
              </div>
            )}
            {bundles.length === 0 && !error && (
              <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--muted)' }}>
                No bundles found.
              </p>
            )}
            {bundles.map((b) => (
              <BundleCard key={b.id} variant="grid" bundle={b} />
            ))}
          </section>
        </div>
      )}

      <div className="pagination">
        {loading ? <Loading label="Loading bundles…" inline size="sm" /> : null}
        <button className="button small" disabled={page === 1} onClick={() => setPage(page - 1)}>
          ← Previous
        </button>
        <span>
          Page {page} · {total} bundles
        </span>
        <button
          className="button small"
          disabled={page * limit >= total}
          onClick={() => setPage(page + 1)}
        >
          Next →
        </button>
      </div>
    </Layout>
  );
}
