import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { Layout } from '../components/Layout';
import { RequireAuth } from '../components/RequireAuth';
import { DashboardShell } from '../components/DashboardShell';
import { Loading, LoadingOverlay } from '../components/Loading';
import {
  IconBox,
  IconCart,
  IconChart,
  IconClock,
  IconMail,
  IconStore,
  IconUsers,
} from '../components/DashboardIcons';
import { api } from '../lib/api';
import type { FeedbackPost, FeedbackStatus, Order, Product } from 'dova-shared';
import { FEEDBACK_STATUSES, feedbackStatusLabel, getProductTab } from 'dova-shared';

type Stats = {
  users: number;
  suppliers: number;
  products: number;
  orders: number;
  pendingSuppliers: number;
};
type Supplier = {
  id: string;
  businessName: string;
  contactName?: string;
  email?: string;
  status: string;
  documentUrl?: string;
};
type AdminUser = { id: string; email: string; fullName: string; role: string; isActive: boolean };
type AdminOrder = Pick<Order, 'id' | 'orderNumber' | 'status' | 'totalAmount' | 'createdAt'> & {
  customerName: string;
};

type AdminContact = { id: string; name: string; email: string; message: string; status: string; createdAt: string };

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: <IconChart /> },
  { id: 'suppliers', label: 'Suppliers', icon: <IconStore /> },
  { id: 'products', label: 'Products', icon: <IconBox /> },
  { id: 'orders', label: 'Orders', icon: <IconCart /> },
  { id: 'users', label: 'Users', icon: <IconUsers /> },
  { id: 'contacts', label: 'Contacts', icon: <IconMail /> },
  { id: 'feedback', label: 'Feedback', icon: <IconMail /> },
];

function userStatusClass(u: AdminUser) {
  if (!u.isActive) return 'inactive';
  if (u.role === 'supplier') return 'pending';
  return 'active';
}

function userStatusLabel(u: AdminUser) {
  if (!u.isActive) return 'Inactive';
  return 'Active';
}

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [productTab, setProductTab] = useState<'available' | 'low_stock' | 'hidden'>('available');
  const [stats, setStats] = useState<Stats>();
  const [pending, setPending] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [feedbackPosts, setFeedbackPosts] = useState<FeedbackPost[]>([]);
  const [officialReplies, setOfficialReplies] = useState<Record<string, string>>({});
  const [changelogForm, setChangelogForm] = useState({ title: '', summary: '', body: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const load = async () => {
    const [s, p, u, pr, o, c, fb] = await Promise.all([
      api<Stats>('/admin/dashboard'),
      api<Supplier[]>('/admin/suppliers/pending'),
      api<AdminUser[]>('/admin/users'),
      api<Product[]>('/admin/products'),
      api<AdminOrder[]>('/admin/orders'),
      api<AdminContact[]>('/admin/contacts'),
      api<FeedbackPost[]>('/feedback/posts?sort=new'),
    ]);
    setStats(s);
    setPending(p);
    setUsers(u);
    setProducts(pr);
    setOrders(o);
    setContacts(c);
    setFeedbackPosts(fb);
  };

  useEffect(() => {
    void load()
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function decision(id: string, action: 'approve' | 'reject') {
    const reason = action === 'reject' ? window.prompt('Rejection reason') : undefined;
    if (action === 'reject' && !reason) return;
    setActionBusy(true);
    try {
      await api(`/admin/suppliers/${id}/${action}`, {
        method: 'POST',
        ...(reason ? { body: JSON.stringify({ reason }) } : {}),
      });
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  async function toggleUser(user: AdminUser) {
    setActionBusy(true);
    try {
      await api(`/admin/users/${user.id}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active: !user.isActive }),
      });
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  async function toggleProduct(product: Product) {
    setActionBusy(true);
    try {
      await api(`/admin/products/${product.id}/active`, {
        method: 'PUT',
        body: JSON.stringify({ active: !product.isActive }),
      });
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  async function setFeedbackStatus(postId: string, status: FeedbackStatus) {
    setActionBusy(true);
    try {
      await api(`/feedback/posts/${postId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      });
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  async function sendOfficialReply(postId: string) {
    const body = officialReplies[postId]?.trim();
    if (!body) return;
    setActionBusy(true);
    try {
      await api(`/feedback/posts/${postId}/official-reply`, {
        method: 'POST',
        body: JSON.stringify({ body }),
      });
      setOfficialReplies((prev) => ({ ...prev, [postId]: '' }));
      setMessage('Official reply posted.');
    } finally {
      setActionBusy(false);
    }
  }

  async function publishChangelog(e: FormEvent) {
    e.preventDefault();
    setActionBusy(true);
    try {
      await api('/feedback/changelog', {
        method: 'POST',
        body: JSON.stringify(changelogForm),
      });
      setChangelogForm({ title: '', summary: '', body: '' });
      setMessage('Changelog entry published.');
    } finally {
      setActionBusy(false);
    }
  }

  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <DashboardShell
          variant="admin"
          title="DOVA ADMIN"
          subtitle="Dashboard Management"
          items={NAV}
          active={tab}
          onSelect={setTab}
        >
          {loading ? (
            <Loading label="Loading dashboard…" block />
          ) : (
            <>
              {message && <p className="error">{message}</p>}

              {tab === 'overview' && (
                <>
                  <section className="admin-dash-heading">
                    <div className="admin-dash-title">
                      <h1>Admin Dashboard</h1>
                      <p>Monitor and manage the DOVA platform.</p>
                    </div>
                  </section>

                  {stats && (
                    <section className="admin-dash-cards">
                      <div className="admin-dash-card">
                        <div className="admin-dash-card-icon green">
                          <IconUsers />
                        </div>
                        <h2>{stats.users}</h2>
                        <p>Total Users</p>
                      </div>
                      <div className="admin-dash-card">
                        <div className="admin-dash-card-icon blue">
                          <IconStore />
                        </div>
                        <h2>{stats.suppliers}</h2>
                        <p>Suppliers</p>
                      </div>
                      <div className="admin-dash-card">
                        <div className="admin-dash-card-icon orange">
                          <IconBox />
                        </div>
                        <h2>{stats.products}</h2>
                        <p>Products</p>
                      </div>
                      <div className="admin-dash-card">
                        <div className="admin-dash-card-icon purple">
                          <IconCart />
                        </div>
                        <h2>{stats.orders}</h2>
                        <p>Orders</p>
                      </div>
                      <div className="admin-dash-card">
                        <div className="admin-dash-card-icon red">
                          <IconClock />
                        </div>
                        <h2>{stats.pendingSuppliers}</h2>
                        <p>Pending</p>
                      </div>
                    </section>
                  )}

                  <section className="admin-dash-table-section">
                    <div className="admin-dash-table-header">
                      <h2>Recent Users</h2>
                      <button type="button" onClick={() => setTab('users')}>
                        View All
                      </button>
                    </div>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.slice(0, 8).map((u) => (
                          <tr key={u.id}>
                            <td data-label="Name">{u.fullName}</td>
                            <td data-label="Email">{u.email}</td>
                            <td data-label="Role">{u.role}</td>
                            <td data-label="Status">
                              <span className={`admin-dash-status ${userStatusClass(u)}`}>
                                {userStatusLabel(u)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </>
              )}

              {tab === 'suppliers' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>Pending Suppliers</h1>
                    <p>Review and approve supplier applications.</p>
                  </div>
                  <section className={`admin-dash-table-section${actionBusy ? ' admin-dash-busy' : ''}`}>
                    {actionBusy ? <LoadingOverlay label="Saving changes…" /> : null}
                    {pending.length === 0 ? (
                      <p className="admin-dash-empty">No pending suppliers.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Business</th>
                            <th>Contact</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pending.map((s) => (
                            <tr key={s.id}>
                              <td data-label="Business">{s.businessName}</td>
                              <td data-label="Contact">
                                {s.contactName} · {s.email}
                                {s.documentUrl && (
                                  <>
                                    <br />
                                    <a href={s.documentUrl} target="_blank" rel="noreferrer">
                                      View document
                                    </a>
                                  </>
                                )}
                              </td>
                              <td data-label="Status">
                                <span className="admin-dash-status pending">{s.status}</span>
                              </td>
                              <td data-label="Actions">
                                <div className="admin-dash-actions">
                                  <button
                                    type="button"
                                    className="admin-dash-btn admin-dash-btn-primary"
                                    disabled={actionBusy}
                                    onClick={() => void decision(s.id, 'approve')}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="admin-dash-btn admin-dash-btn-secondary"
                                    disabled={actionBusy}
                                    onClick={() => void decision(s.id, 'reject')}
                                  >
                                    Reject
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                </>
              )}

              {tab === 'products' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>Products</h1>
                    <p>Activate or deactivate marketplace products.</p>
                  </div>

                  <div className="supplier-product-tabs">
                    {(
                      [
                        { key: 'available', label: 'Available', count: products.filter(p => getProductTab(p) === 'available').length },
                        { key: 'low_stock', label: 'Low Stock', count: products.filter(p => getProductTab(p) === 'low_stock').length },
                        { key: 'hidden',    label: 'Hidden',    count: products.filter(p => getProductTab(p) === 'hidden').length },
                      ] as const
                    ).map(({ key, label, count }) => (
                      <button
                        key={key}
                        type="button"
                        className={`supplier-product-tab${productTab === key ? ' active' : ''}`}
                        onClick={() => setProductTab(key)}
                      >
                        {label}
                        <span className="supplier-product-tab-count">{count}</span>
                      </button>
                    ))}
                  </div>

                  <section className={`admin-dash-table-section${actionBusy ? ' admin-dash-busy' : ''}`}>
                    {actionBusy ? <LoadingOverlay label="Saving changes…" /> : null}
                    <table>
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Supplier</th>
                          <th>Stock</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.filter((p) => getProductTab(p) === productTab).map((p) => (
                          <tr key={p.id}>
                            <td data-label="Product">{p.name}</td>
                            <td data-label="Supplier">{p.supplierName}</td>
                            <td data-label="Stock">{p.stockQuantity}</td>
                            <td data-label="Status">
                              <span className={`admin-dash-status ${p.isActive ? 'active' : 'inactive'}`}>
                                {p.isActive ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td data-label="">
                              <button
                                type="button"
                                className="admin-dash-btn admin-dash-btn-primary"
                                disabled={actionBusy}
                                onClick={() => void toggleProduct(p)}
                              >
                                {p.isActive ? 'Deactivate' : 'Set to Active'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </>
              )}

              {tab === 'orders' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>Orders</h1>
                    <p>All platform orders.</p>
                  </div>
                  <section className="admin-dash-table-section">
                    {orders.length === 0 ? (
                      <p className="admin-dash-empty">No orders.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Total</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orders.map((o) => (
                            <tr key={o.id}>
                              <td data-label="Order">{o.orderNumber}</td>
                              <td data-label="Customer">{o.customerName}</td>
                              <td data-label="Total">₦ {o.totalAmount.toLocaleString('en-NG')}</td>
                              <td data-label="Status">
                                <span className="admin-dash-status pending">{o.status}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                </>
              )}

              {tab === 'users' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>Users</h1>
                    <p>Manage account access.</p>
                  </div>
                  <section className={`admin-dash-table-section${actionBusy ? ' admin-dash-busy' : ''}`}>
                    {actionBusy ? <LoadingOverlay label="Saving changes…" /> : null}
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Role</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td data-label="Name">{u.fullName}</td>
                            <td data-label="Email">{u.email}</td>
                            <td data-label="Role">{u.role}</td>
                            <td data-label="Status">
                              <span className={`admin-dash-status ${userStatusClass(u)}`}>
                                {userStatusLabel(u)}
                              </span>
                            </td>
                            <td data-label="">
                              <button
                                type="button"
                                className="admin-dash-btn admin-dash-btn-primary"
                                disabled={actionBusy}
                                onClick={() => void toggleUser(u)}
                              >
                                {u.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </section>
                </>
              )}

              {tab === 'contacts' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>Contact messages</h1>
                    <p>Messages submitted from the Contact Us form.</p>
                  </div>
                  <section className="admin-dash-table-section">
                    {contacts.length === 0 ? (
                      <p className="admin-dash-empty">No contact messages yet.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Message</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contacts.map((c) => (
                            <tr key={c.id}>
                              <td data-label="Name">{c.name}</td>
                              <td data-label="Email">{c.email}</td>
                              <td data-label="Message">{c.message}</td>
                              <td data-label="Status">
                                <span className="admin-dash-status pending">{c.status}</span>
                              </td>
                              <td data-label="Date">{new Date(c.createdAt).toLocaleString('en-NG')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>
                </>
              )}

              {tab === 'feedback' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>Feedback board</h1>
                    <p>Move ideas across the roadmap, reply officially, and publish changelog entries.</p>
                  </div>

                  <section className={`admin-dash-table-section${actionBusy ? ' admin-dash-busy' : ''}`}>
                    {actionBusy ? <LoadingOverlay label="Saving changes…" /> : null}
                    {feedbackPosts.length === 0 ? (
                      <p className="admin-dash-empty">No feedback posts yet.</p>
                    ) : (
                      <table>
                        <thead>
                          <tr>
                            <th>Idea</th>
                            <th>Votes</th>
                            <th>Status</th>
                            <th>Official reply</th>
                          </tr>
                        </thead>
                        <tbody>
                          {feedbackPosts.map((post) => (
                            <tr key={post.id}>
                              <td data-label="Idea">
                                <Link href={`/feedback/${post.id}`}>{post.title}</Link>
                                <br />
                                <span className="muted">{post.authorName}</span>
                              </td>
                              <td data-label="Votes">{post.votes}</td>
                              <td data-label="Status">
                                <select
                                  value={post.status}
                                  disabled={actionBusy}
                                  onChange={(e) => void setFeedbackStatus(post.id, e.target.value as FeedbackStatus)}
                                >
                                  {FEEDBACK_STATUSES.map((status) => (
                                    <option key={status} value={status}>
                                      {feedbackStatusLabel(status)}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td data-label="Official reply">
                                <textarea
                                  rows={2}
                                  placeholder="Team response…"
                                  value={officialReplies[post.id] ?? ''}
                                  onChange={(e) =>
                                    setOfficialReplies((prev) => ({ ...prev, [post.id]: e.target.value }))
                                  }
                                />
                                <button
                                  type="button"
                                  className="admin-dash-btn admin-dash-btn-primary"
                                  disabled={actionBusy}
                                  onClick={() => void sendOfficialReply(post.id)}
                                >
                                  Post reply
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>

                  <section className="card feedback-form" style={{ marginTop: 24 }}>
                    <h2>Publish changelog</h2>
                    <form onSubmit={(e) => void publishChangelog(e)}>
                      <label>
                        Title
                        <input
                          value={changelogForm.title}
                          onChange={(e) => setChangelogForm((f) => ({ ...f, title: e.target.value }))}
                          required
                          minLength={3}
                        />
                      </label>
                      <label>
                        Summary
                        <input
                          value={changelogForm.summary}
                          onChange={(e) => setChangelogForm((f) => ({ ...f, summary: e.target.value }))}
                          required
                          minLength={10}
                        />
                      </label>
                      <label>
                        Body
                        <textarea
                          value={changelogForm.body}
                          onChange={(e) => setChangelogForm((f) => ({ ...f, body: e.target.value }))}
                          required
                          minLength={10}
                          rows={4}
                        />
                      </label>
                      <button type="submit" className="admin-dash-btn admin-dash-btn-primary" disabled={actionBusy}>
                        Publish
                      </button>
                    </form>
                  </section>
                </>
              )}
            </>
          )}
        </DashboardShell>
      </RequireAuth>
    </Layout>
  );
}
