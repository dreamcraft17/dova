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
  IconClipboard,
  IconClock,
  IconMail,
  IconStore,
  IconUsers,
} from '../components/DashboardIcons';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { AdminUserModal } from '../components/AdminUserModal';
import type { BundleDetail, BundleListResponse, BundleSummary, Category, FeedbackPost, FeedbackStatus, Order, Product } from 'dova-shared';
import { FEEDBACK_STATUSES, computeBundlePricing, feedbackStatusLabel, getProductTab } from 'dova-shared';

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
type AdminUser = {
  id: string;
  email: string;
  fullName: string;
  role: string;
  isActive: boolean;
  phoneNumber?: string;
  emailVerifiedAt?: string;
  createdAt?: string;
};
type AdminOrder = Pick<Order, 'id' | 'orderNumber' | 'status' | 'totalAmount' | 'createdAt'> & {
  customerName: string;
};

type AdminContact = { id: string; name: string; email: string; message: string; status: string; createdAt: string };

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: <IconChart /> },
  { id: 'suppliers', label: 'Suppliers', icon: <IconStore /> },
  { id: 'products', label: 'Products', icon: <IconBox /> },
  { id: 'bundles', label: 'Bundles', icon: <IconClipboard /> },
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

type BundleContentRow = { productId: string; quantity: number; product: Product };
const emptyBundleForm = {
  name: '',
  description: '',
  categoryId: '',
  imageUrl: '',
  bundlePrice: 1000,
  isFeatured: false,
};

export default function Admin() {
  const { user: currentUser } = useAuth();
  const [tab, setTab] = useState('overview');
  const [productTab, setProductTab] = useState<'available' | 'low_stock' | 'hidden'>('available');
  const [stats, setStats] = useState<Stats>();
  const [pending, setPending] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [feedbackPosts, setFeedbackPosts] = useState<FeedbackPost[]>([]);
  const [officialReplies, setOfficialReplies] = useState<Record<string, string>>({});
  const [changelogForm, setChangelogForm] = useState({ title: '', summary: '', body: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [bundles, setBundles] = useState<BundleSummary[]>([]);
  const [bundleView, setBundleView] = useState<'list' | 'form'>('list');
  const [bundleSearch, setBundleSearch] = useState('');
  const [bundleCategoryFilter, setBundleCategoryFilter] = useState('');
  const [bundleStatusFilter, setBundleStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [bundleForm, setBundleForm] = useState(emptyBundleForm);
  const [bundleEditingId, setBundleEditingId] = useState<string>();
  const [bundleContents, setBundleContents] = useState<BundleContentRow[]>([]);
  const [bundleProductSearch, setBundleProductSearch] = useState('');
  const [bundleSubmitBusy, setBundleSubmitBusy] = useState(false);

  const load = async () => {
    const [s, p, u, pr, o, c, fb, cats, bl] = await Promise.all([
      api<Stats>('/admin/dashboard'),
      api<Supplier[]>('/admin/suppliers/pending'),
      api<AdminUser[]>('/admin/users'),
      api<Product[]>('/admin/products'),
      api<AdminOrder[]>('/admin/orders'),
      api<AdminContact[]>('/admin/contacts'),
      api<FeedbackPost[]>('/feedback/posts?sort=new'),
      api<Category[]>('/categories'),
      api<BundleListResponse>('/admin/bundles?limit=100'),
    ]);
    setStats(s);
    setPending(p);
    setUsers(u);
    setProducts(pr);
    setOrders(o);
    setContacts(c);
    setFeedbackPosts(fb);
    setCategories(cats);
    setBundles(bl.data);
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
    if (currentUser?.id === user.id && user.isActive) {
      setMessage('You cannot deactivate your own account.');
      return;
    }
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

  function toggleProductSelected(id: string) {
    setSelectedProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function bulkSetProductsActive(active: boolean) {
    const ids = Array.from(selectedProductIds);
    if (!ids.length) return;
    setActionBusy(true);
    try {
      await api('/admin/products/active', {
        method: 'PUT',
        body: JSON.stringify({ ids, active }),
      });
      setSelectedProductIds(new Set());
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  function startNewBundle() {
    setBundleEditingId(undefined);
    setBundleForm(emptyBundleForm);
    setBundleContents([]);
    setBundleProductSearch('');
    setMessage('');
    setBundleView('form');
  }

  async function startEditBundle(id: string) {
    setMessage('');
    try {
      const detail = await api<BundleDetail>(`/admin/bundles/${id}`);
      setBundleEditingId(detail.id);
      setBundleForm({
        name: detail.name,
        description: detail.description,
        categoryId: detail.categoryId ?? '',
        imageUrl: detail.imageUrl ?? '',
        bundlePrice: detail.bundlePrice,
        isFeatured: detail.isFeatured,
      });
      setBundleContents(
        detail.contents.map((c) => ({ productId: c.productId, quantity: c.quantity, product: c.product })),
      );
      setBundleProductSearch('');
      setBundleView('form');
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  function addBundleContent(product: Product) {
    setBundleContents((prev) => [...prev, { productId: product.id, quantity: 1, product }]);
    setBundleProductSearch('');
  }

  function removeBundleContent(productId: string) {
    setBundleContents((prev) => prev.filter((c) => c.productId !== productId));
  }

  function updateBundleContentQuantity(productId: string, quantity: number) {
    setBundleContents((prev) => prev.map((c) => (c.productId === productId ? { ...c, quantity } : c)));
  }

  async function submitBundle(e: FormEvent) {
    e.preventDefault();
    if (!bundleForm.name.trim()) {
      setMessage('Bundle name is required.');
      return;
    }
    if (bundleContents.length < 2) {
      setMessage('Add at least 2 products to this bundle.');
      return;
    }
    const price = Number(bundleForm.bundlePrice);
    if (!price || price <= 0 || isNaN(price)) {
      setMessage('Bundle price must be greater than zero.');
      return;
    }
    for (const c of bundleContents) {
      if (!c.quantity || c.quantity <= 0 || isNaN(c.quantity)) {
        setMessage('All product quantities must be greater than zero.');
        return;
      }
    }
    const preview = computeBundlePricing(
      price,
      bundleContents.map((c) => ({ quantity: c.quantity, product: { price: c.product.price } })),
    );
    if (preview.savingsAmount <= 0) {
      setMessage('Bundle price must be less than the individual total of its contents.');
      return;
    }

    setMessage('');
    setBundleSubmitBusy(true);
    try {
      const path = bundleEditingId ? `/admin/bundles/${bundleEditingId}` : '/admin/bundles';
      const body = {
        name: bundleForm.name.trim(),
        description: bundleForm.description.trim(),
        categoryId: bundleForm.categoryId || undefined,
        imageUrl: bundleForm.imageUrl.trim() || undefined,
        bundlePrice: price,
        isFeatured: Boolean(bundleForm.isFeatured),
        contents: bundleContents.map((c, i) => ({ productId: c.productId, quantity: c.quantity, position: i })),
      };
      await api(path, { method: bundleEditingId ? 'PUT' : 'POST', body: JSON.stringify(body) });
      await load();
      setMessage('Bundle saved.');
      setBundleView('list');
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setBundleSubmitBusy(false);
    }
  }

  async function deactivateBundle(bundle: BundleSummary) {
    if (!window.confirm('Deactivate this bundle? It will be hidden from customers, but stays in this list where you can reactivate it anytime.')) return;
    setActionBusy(true);
    try {
      await api(`/admin/bundles/${bundle.id}`, { method: 'DELETE' });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setActionBusy(false);
    }
  }

  async function activateBundle(bundle: BundleSummary) {
    setActionBusy(true);
    try {
      await api(`/admin/bundles/${bundle.id}/active`, { method: 'PUT', body: JSON.stringify({ active: true }) });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
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
                        onClick={() => { setProductTab(key); setSelectedProductIds(new Set()); }}
                      >
                        {label}
                        <span className="supplier-product-tab-count">{count}</span>
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const visibleProducts = products.filter((p) => getProductTab(p) === productTab);
                    const visibleIds = visibleProducts.map((p) => p.id);
                    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedProductIds.has(id));
                    const someVisibleSelected = visibleIds.some((id) => selectedProductIds.has(id));
                    return (
                      <>
                        {someVisibleSelected && (
                          <div className="admin-dash-bulk-bar">
                            <span>{visibleIds.filter((id) => selectedProductIds.has(id)).length} selected</span>
                            <button
                              type="button"
                              className="admin-dash-btn admin-dash-btn-primary"
                              disabled={actionBusy}
                              onClick={() => void bulkSetProductsActive(true)}
                            >
                              Activate selected
                            </button>
                            <button
                              type="button"
                              className="admin-dash-btn"
                              disabled={actionBusy}
                              onClick={() => void bulkSetProductsActive(false)}
                            >
                              Deactivate selected
                            </button>
                          </div>
                        )}
                        <section className={`admin-dash-table-section${actionBusy ? ' admin-dash-busy' : ''}`}>
                          {actionBusy ? <LoadingOverlay label="Saving changes…" /> : null}
                          <table>
                            <thead>
                              <tr>
                                <th>
                                  <input
                                    type="checkbox"
                                    checked={allVisibleSelected}
                                    ref={(el) => { if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected; }}
                                    onChange={() => {
                                      setSelectedProductIds((prev) => {
                                        const next = new Set(prev);
                                        if (allVisibleSelected) visibleIds.forEach((id) => next.delete(id));
                                        else visibleIds.forEach((id) => next.add(id));
                                        return next;
                                      });
                                    }}
                                  />
                                </th>
                                <th>Product</th>
                                <th>Supplier</th>
                                <th>Stock</th>
                                <th>Status</th>
                                <th></th>
                              </tr>
                            </thead>
                            <tbody>
                              {visibleProducts.map((p) => (
                                <tr key={p.id}>
                                  <td data-label="">
                                    <input
                                      type="checkbox"
                                      checked={selectedProductIds.has(p.id)}
                                      onChange={() => toggleProductSelected(p.id)}
                                    />
                                  </td>
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
                    );
                  })()}
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
                          <th>Joined</th>
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
                            <td data-label="Joined">
                              {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-NG') : '—'}
                            </td>
                            <td data-label="">
                              <div className="admin-dash-actions">
                                <button
                                  type="button"
                                  className="admin-dash-btn admin-dash-btn-secondary"
                                  disabled={actionBusy}
                                  onClick={() => setSelectedUserId(u.id)}
                                >
                                  Manage
                                </button>
                                <button
                                  type="button"
                                  className="admin-dash-btn admin-dash-btn-primary"
                                  disabled={actionBusy || (currentUser?.id === u.id && u.isActive)}
                                  onClick={() => void toggleUser(u)}
                                >
                                  {u.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                              </div>
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
                                <div className="admin-dash-reply-cell">
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
                                </div>
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

              {tab === 'bundles' && bundleView === 'list' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>Bundles</h1>
                    <p>Curate multi-product packages sold at a bundle price.</p>
                  </div>

                  {message && <p className="error">{message}</p>}

                  <div className="filter-stack">
                    <input
                      className="search"
                      placeholder="Search bundles..."
                      value={bundleSearch}
                      onChange={(e) => setBundleSearch(e.target.value)}
                    />
                    <select value={bundleCategoryFilter} onChange={(e) => setBundleCategoryFilter(e.target.value)}>
                      <option value="">All categories</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    <select
                      value={bundleStatusFilter}
                      onChange={(e) => setBundleStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                    >
                      <option value="all">All statuses</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                    <button type="button" className="admin-dash-btn admin-dash-btn-primary" onClick={startNewBundle}>
                      + New Bundle
                    </button>
                  </div>

                  <section className={`admin-dash-table-section${actionBusy ? ' admin-dash-busy' : ''}`}>
                    {actionBusy ? <LoadingOverlay label="Saving changes…" /> : null}
                    <table>
                      <thead>
                        <tr>
                          <th>Bundle</th>
                          <th>Category</th>
                          <th>Price</th>
                          <th>Savings</th>
                          <th>Availability</th>
                          <th>Status</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const filtered = bundles
                            .filter((b) => !bundleCategoryFilter || b.categoryId === bundleCategoryFilter)
                            .filter((b) => bundleStatusFilter === 'all' || b.status === bundleStatusFilter)
                            .filter((b) => b.name.toLowerCase().includes(bundleSearch.toLowerCase()));
                          if (filtered.length === 0) {
                            return (
                              <tr>
                                <td colSpan={7} style={{ textAlign: 'center', padding: '24px', color: 'var(--muted)' }}>
                                  No bundles found.
                                </td>
                              </tr>
                            );
                          }
                          return filtered.map((b) => (
                            <tr key={b.id}>
                              <td data-label="Bundle">{b.name}</td>
                              <td data-label="Category">{b.categoryName || '—'}</td>
                              <td data-label="Price">₦ {b.bundlePrice.toLocaleString('en-NG')}</td>
                              <td data-label="Savings">{Math.round(b.computed.savingsPercentage)}%</td>
                              <td data-label="Availability">
                                {b.computed.isOutOfStock ? 'Out of stock' : b.computed.availableQuantity}
                              </td>
                              <td data-label="Status">
                                <span className={`admin-dash-status ${b.status}`}>{b.status}</span>
                              </td>
                              <td data-label="">
                                <button
                                  type="button"
                                  className="admin-dash-btn admin-dash-btn-secondary"
                                  disabled={actionBusy}
                                  onClick={() => void startEditBundle(b.id)}
                                >
                                  Edit
                                </button>
                                {b.status === 'active' ? (
                                  <button
                                    type="button"
                                    className="admin-dash-btn admin-dash-btn-danger"
                                    disabled={actionBusy}
                                    onClick={() => void deactivateBundle(b)}
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="admin-dash-btn admin-dash-btn-primary"
                                    disabled={actionBusy}
                                    onClick={() => void activateBundle(b)}
                                  >
                                    Activate
                                  </button>
                                )}
                              </td>
                            </tr>
                          ));
                        })()}
                      </tbody>
                    </table>
                  </section>
                </>
              )}

              {tab === 'bundles' && bundleView === 'form' && (
                <>
                  <div className="admin-dash-page-title">
                    <h1>{bundleEditingId ? 'Edit Bundle' : 'New Bundle'}</h1>
                    <p>
                      <button type="button" className="admin-dash-btn admin-dash-btn-secondary" onClick={() => setBundleView('list')}>
                        ← Back to bundles
                      </button>
                    </p>
                  </div>

                  {message && <p className="error">{message}</p>}

                  <div className="admin-dash-form-panel">
                    <form onSubmit={(e) => void submitBundle(e)}>
                      <label>Name</label>
                      <input
                        required
                        minLength={2}
                        value={bundleForm.name}
                        onChange={(e) => setBundleForm({ ...bundleForm, name: e.target.value })}
                      />
                      <label>Description</label>
                      <textarea
                        required
                        minLength={2}
                        value={bundleForm.description}
                        onChange={(e) => setBundleForm({ ...bundleForm, description: e.target.value })}
                      />
                      <label>Category</label>
                      <select
                        value={bundleForm.categoryId}
                        onChange={(e) => setBundleForm({ ...bundleForm, categoryId: e.target.value })}
                      >
                        <option value="">No category</option>
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                      <label>Bundle price (₦)</label>
                      <input
                        type="number"
                        min={1}
                        required
                        value={bundleForm.bundlePrice}
                        onChange={(e) => setBundleForm({ ...bundleForm, bundlePrice: Number(e.target.value) })}
                      />
                      <label>Image URL (optional)</label>
                      <input
                        value={bundleForm.imageUrl}
                        onChange={(e) => setBundleForm({ ...bundleForm, imageUrl: e.target.value })}
                        placeholder="https://..."
                      />
                      <label>
                        <input
                          type="checkbox"
                          checked={bundleForm.isFeatured}
                          onChange={(e) => setBundleForm({ ...bundleForm, isFeatured: e.target.checked })}
                        />{' '}
                        Featured
                      </label>

                      <div className="bundle-contents-picker">
                        <label>Products in this bundle</label>
                        <input
                          placeholder="Search products to add…"
                          value={bundleProductSearch}
                          onChange={(e) => setBundleProductSearch(e.target.value)}
                        />
                        {bundleProductSearch.trim() && (
                          <div className="bundle-contents-search-results">
                            {products
                              .filter(
                                (p) =>
                                  p.isActive &&
                                  p.name.toLowerCase().includes(bundleProductSearch.toLowerCase()) &&
                                  !bundleContents.some((c) => c.productId === p.id),
                              )
                              .slice(0, 8)
                              .map((p) => (
                                <button type="button" key={p.id} onClick={() => addBundleContent(p)}>
                                  + {p.name} — ₦ {p.price.toLocaleString('en-NG')}
                                </button>
                              ))}
                          </div>
                        )}

                        {bundleContents.map((c) => (
                          <div className="bundle-contents-row" key={c.productId}>
                            <span>{c.product.name}</span>
                            <input
                              type="number"
                              min={0.01}
                              step={0.01}
                              value={c.quantity}
                              onChange={(e) => updateBundleContentQuantity(c.productId, Number(e.target.value))}
                            />
                            <span className="muted">₦ {c.product.price.toLocaleString('en-NG')} each</span>
                            <span>₦ {(c.product.price * c.quantity).toLocaleString('en-NG')}</span>
                            <button type="button" onClick={() => removeBundleContent(c.productId)}>
                              Remove
                            </button>
                          </div>
                        ))}

                        {bundleContents.length < 2 && (
                          <p className="bundle-contents-empty">Add at least 2 products to this bundle.</p>
                        )}
                      </div>

                      {bundleContents.length >= 2 &&
                        (() => {
                          const preview = computeBundlePricing(
                            Number(bundleForm.bundlePrice) || 0,
                            bundleContents.map((c) => ({ quantity: c.quantity, product: { price: c.product.price } })),
                          );
                          const invalid = preview.savingsAmount <= 0;
                          return (
                            <div className={`bundle-preview${invalid ? ' invalid' : ''}`}>
                              {invalid ? (
                                <p>Bundle price must be less than the individual total of its contents.</p>
                              ) : (
                                <p>
                                  Individual total: ₦ {preview.individualTotal.toLocaleString('en-NG')} · Savings: ₦{' '}
                                  {preview.savingsAmount.toLocaleString('en-NG')} ({Math.round(preview.savingsPercentage)}%)
                                </p>
                              )}
                            </div>
                          );
                        })()}

                      <button type="submit" disabled={bundleSubmitBusy}>
                        {bundleSubmitBusy ? (
                          <Loading label={bundleEditingId ? 'Saving changes…' : 'Creating bundle…'} inline size="sm" />
                        ) : bundleEditingId ? (
                          'Save changes'
                        ) : (
                          'Create bundle'
                        )}
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          )}
        </DashboardShell>
        <AdminUserModal
          userId={selectedUserId}
          open={Boolean(selectedUserId)}
          currentUserId={currentUser?.id}
          onClose={() => setSelectedUserId(null)}
          onSaved={() => void load()}
        />
      </RequireAuth>
    </Layout>
  );
}
