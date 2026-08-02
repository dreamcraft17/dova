import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { RequireAuth } from '../components/RequireAuth';
import { DashboardShell } from '../components/DashboardShell';
import { Loading, LoadingOverlay } from '../components/Loading';
import {
  IconBox,
  IconCart,
  IconClipboard,
  IconHome,
  IconMoney,
  IconPlusSquare,
} from '../components/DashboardIcons';
import { api } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import type { Category, Product } from 'dova-shared';

type SupplierOrder = {
  orderId: string;
  orderNumber: string;
  customerName: string;
  itemId: string;
  productName: string;
  quantity: number;
  subtotal: number;
  status: string;
  deliveryAddress: string;
};

const empty = { name: '', description: '', price: 1000, quantity: 1, categoryId: '', imageUrl: '' };

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: <IconHome /> },
  { id: 'products', label: 'Products', icon: <IconBox /> },
  { id: 'add', label: 'Add Product', icon: <IconPlusSquare /> },
  { id: 'orders', label: 'Orders', icon: <IconCart /> },
];

function productBadge(p: Product) {
  if (p.stockQuantity < 20) return { className: 'warn', label: 'Low Stock' };
  if (p.isActive) return { className: 'success', label: 'Available' };
  return { className: 'muted', label: 'Hidden' };
}

function supplierStatusBadge(status: string) {
  if (status === 'approved') return { className: 'success', label: 'Approved' };
  if (status === 'rejected') return { className: 'muted', label: 'Rejected' };
  return { className: 'warn', label: 'Pending review' };
}

export default function Supplier() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [imageFile, setImageFile] = useState<File>();
  const [editing, setEditing] = useState<string>();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [supplierInfo, setSupplierInfo] = useState<{
    id: string;
    status: string;
    businessName: string;
    rejectionReason?: string;
    documentUrl?: string;
  }>();

  const revenue = useMemo(
    () => orders.reduce((sum, o) => sum + (o.subtotal || 0), 0),
    [orders],
  );

  const load = async () => {
    const [p, o, c] = await Promise.all([
      api<Product[]>('/suppliers/products'),
      api<SupplierOrder[]>('/suppliers/orders'),
      api<Category[]>('/categories'),
    ]);
    setProducts(p);
    setOrders(o);
    setCategories(c);
    if (!form.categoryId && c[0]) setForm((x) => ({ ...x, categoryId: c[0].id }));
  };

  useEffect(() => {
    void api<{
      id: string;
      status: string;
      businessName: string;
      rejectionReason?: string;
      documentUrl?: string;
    }>('/suppliers/status')
      .then((info) => {
        setSupplierInfo(info);
        if (info.status === 'approved') return load();
      })
      .catch((e) => setMessage(e.message))
      .finally(() => setLoading(false));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    setSubmitBusy(true);
    try {
      const path = editing ? `/suppliers/products/${editing}` : '/suppliers/products';
      const body = new FormData();
      body.append('name', form.name);
      body.append('description', form.description);
      body.append('price', String(form.price));
      body.append('quantity', String(form.quantity));
      body.append('categoryId', form.categoryId);
      if (form.imageUrl) body.append('imageUrl', form.imageUrl);
      if (imageFile) body.append('image', imageFile);
      await api(path, { method: editing ? 'PUT' : 'POST', body });
      setForm({ ...empty, categoryId: categories[0]?.id || '' });
      setImageFile(undefined);
      setEditing(undefined);
      await load();
      setMessage('Product saved.');
      setTab('products');
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setSubmitBusy(false);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this product?')) return;
    setActionBusy(true);
    try {
      await api(`/suppliers/products/${id}`, { method: 'DELETE' });
      await load();
    } finally {
      setActionBusy(false);
    }
  }

  async function stock(id: string, reason: 'restock' | 'damage') {
    const raw = window.prompt(`${reason === 'restock' ? 'Restock' : 'Remove'} quantity`, '1');
    const quantity = Number(raw);
    if (!quantity) return;
    setActionBusy(true);
    try {
      await api(`/suppliers/products/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantity, reason }),
      });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setActionBusy(false);
    }
  }

  async function status(itemId: string, value: string) {
    setActionBusy(true);
    try {
      await api(`/suppliers/orders/${itemId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: value }),
      });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    } finally {
      setActionBusy(false);
    }
  }

  function startEdit(p: Product) {
    setEditing(p.id);
    setForm({
      name: p.name,
      description: p.description,
      price: p.price,
      quantity: p.stockQuantity,
      categoryId: p.categoryId,
      imageUrl: p.imageUrl || '',
    });
    setTab('add');
  }

  if (loading) {
    return (
      <Layout chrome="none">
        <RequireAuth roles={['supplier', 'admin']}>
          <Loading label="Loading supplier dashboard…" block />
        </RequireAuth>
      </Layout>
    );
  }

  if (supplierInfo && supplierInfo.status !== 'approved') {
    return (
      <Layout>
        <RequireAuth roles={['supplier']}>
          <section className="form-page">
            <p className="eyebrow">Supplier application</p>
            <h1>
              {supplierInfo.status === 'pending'
                ? 'Application under review'
                : 'Application not approved'}
            </h1>
            <p>
              {supplierInfo.status === 'pending'
                ? 'Your supplier account is waiting for admin approval.'
                : supplierInfo.rejectionReason ||
                  'Please contact DOVA support for more information.'}
            </p>
          </section>
        </RequireAuth>
      </Layout>
    );
  }

  return (
    <Layout chrome="none">
      <RequireAuth roles={['supplier', 'admin']}>
        <DashboardShell
          variant="supplier"
          title="DOVA SUPPLIER"
          subtitle="Dashboard Supplier"
          items={NAV}
          active={tab}
          onSelect={setTab}
        >
          {message && <p className={message.includes('saved') ? '' : 'error'}>{message}</p>}

          {tab === 'overview' && (
            <>
              <h2 className="supplier-dash-title">Supplier Dashboard</h2>
              <p className="supplier-dash-subtitle">
                Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
                {supplierInfo?.businessName ? ` · ${supplierInfo.businessName}` : ''}
              </p>

              <div className="supplier-dash-stats">
                <div className="supplier-dash-stat-card">
                  <div className="supplier-dash-stat-body">
                    <div className="supplier-dash-icon-circle orange">
                      <IconBox />
                    </div>
                    <h3>{products.length}</h3>
                    <p>Total Products</p>
                  </div>
                </div>
                <div className="supplier-dash-stat-card">
                  <div className="supplier-dash-stat-body">
                    <div className="supplier-dash-icon-circle purple">
                      <IconClipboard />
                    </div>
                    <h3>{orders.length}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>
                <div className="supplier-dash-stat-card">
                  <div className="supplier-dash-stat-body">
                    <div className="supplier-dash-icon-circle green">
                      <IconMoney />
                    </div>
                    <h3>₦ {revenue.toLocaleString('en-NG')}</h3>
                    <p>Order Value</p>
                  </div>
                </div>
              </div>

              <div className="supplier-dash-panel">
                <div className="supplier-dash-panel-header">
                  <span>Recent Products</span>
                  <button
                    type="button"
                    className="supplier-dash-view-btn"
                    onClick={() => setTab('products')}
                  >
                    View All
                  </button>
                </div>
                <div className="supplier-dash-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Category</th>
                        <th>Stock</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.slice(0, 8).map((p) => {
                        const badge = productBadge(p);
                        return (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.categoryName}</td>
                            <td>{p.stockQuantity}</td>
                            <td>
                              <span className={`supplier-dash-badge ${badge.className}`}>
                                {badge.label}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      {products.length === 0 && (
                        <tr>
                          <td colSpan={4}>No products yet. Add your first product.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === 'products' && (
            <>
              <h2 className="supplier-dash-title">Your Products</h2>
              <p className="supplier-dash-subtitle">Manage stock and listings ({products.length}).</p>
              <div className={`supplier-dash-panel${actionBusy ? ' supplier-dash-busy' : ''}`}>
                {actionBusy ? <LoadingOverlay label="Saving changes…" /> : null}
                <div className="supplier-dash-table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Price</th>
                        <th>Stock</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((p) => {
                        const badge = productBadge(p);
                        return (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>₦ {p.price.toLocaleString('en-NG')}</td>
                            <td>{p.stockQuantity}</td>
                            <td>
                              <span className={`supplier-dash-badge ${badge.className}`}>
                                {badge.label}
                              </span>
                            </td>
                            <td>
                              <div className="supplier-dash-actions-row">
                                <button
                                  type="button"
                                  className="supplier-dash-btn-sm supplier-dash-btn-warning"
                                  disabled={actionBusy}
                                  onClick={() => startEdit(p)}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="supplier-dash-btn-sm supplier-dash-btn-warning"
                                  disabled={actionBusy}
                                  onClick={() => void stock(p.id, 'restock')}
                                >
                                  + Stock
                                </button>
                                <button
                                  type="button"
                                  className="supplier-dash-btn-sm supplier-dash-btn-warning"
                                  disabled={actionBusy}
                                  onClick={() => void stock(p.id, 'damage')}
                                >
                                  − Stock
                                </button>
                                <button
                                  type="button"
                                  className="supplier-dash-btn-sm supplier-dash-btn-danger"
                                  disabled={actionBusy}
                                  onClick={() => void remove(p.id)}
                                >
                                  Remove
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {tab === 'add' && (
            <>
              <h2 className="supplier-dash-title">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <p className="supplier-dash-subtitle">
                {editing ? 'Update your product details.' : 'List a new product on DOVA.'}
              </p>
              <div className="supplier-dash-form-panel">
                <form onSubmit={submit}>
                  <label>Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <label>Description</label>
                  <textarea
                    required
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  <label>Price (₦)</label>
                  <input
                    type="number"
                    min={1000}
                    required
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                  />
                  <label>Stock</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                  />
                  <label>Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <label>Product image (JPG / PNG / WEBP, max 5 MB)</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => setImageFile(e.target.files?.[0])}
                  />
                  {imageFile && <p className="form-hint">Selected: {imageFile.name}</p>}
                  <label>Or image URL (optional)</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  <button type="submit" disabled={submitBusy}>
                    {submitBusy ? (
                      <Loading
                        label={editing ? 'Saving changes…' : 'Adding product…'}
                        inline
                        size="sm"
                      />
                    ) : editing ? (
                      'Save changes'
                    ) : (
                      'Add product'
                    )}
                  </button>
                  {editing && (
                    <button
                      type="button"
                      className="supplier-dash-btn-sm supplier-dash-btn-warning"
                      style={{ marginTop: 12 }}
                      onClick={() => {
                        setEditing(undefined);
                        setImageFile(undefined);
                        setForm({ ...empty, categoryId: categories[0]?.id || '' });
                      }}
                    >
                      Cancel edit
                    </button>
                  )}
                </form>
              </div>
            </>
          )}

          {tab === 'orders' && (
            <>
              <h2 className="supplier-dash-title">Orders</h2>
              <p className="supplier-dash-subtitle">Manage all customer orders for your products.</p>
              <div className={`supplier-dash-panel${actionBusy ? ' supplier-dash-busy' : ''}`}>
                {actionBusy ? <LoadingOverlay label="Updating order…" /> : null}
                {orders.length === 0 ? (
                  <p className="supplier-dash-subtitle" style={{ padding: '24px' }}>
                    No incoming orders.
                  </p>
                ) : (
                  <div className="supplier-dash-table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Product</th>
                          <th>Qty</th>
                          <th>Total</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.map((o) => (
                          <tr key={o.itemId}>
                            <td>{o.orderNumber}</td>
                            <td>
                              {o.customerName}
                              <br />
                              <small className="muted">{o.deliveryAddress}</small>
                            </td>
                            <td>{o.productName}</td>
                            <td>{o.quantity}</td>
                            <td>₦ {o.subtotal.toLocaleString('en-NG')}</td>
                            <td>
                              {o.status === 'delivered' ? (
                                <span className="supplier-dash-badge success">{o.status}</span>
                              ) : (
                                <select
                                  value={o.status}
                                  disabled={actionBusy}
                                  onChange={(e) => void status(o.itemId, e.target.value)}
                                >
                                  <option value={o.status}>{o.status}</option>
                                  {(o.status === 'pending' || o.status === 'paid') && (
                                    <option value="processing">processing</option>
                                  )}
                                  {o.status === 'processing' && (
                                    <option value="shipped">shipped</option>
                                  )}
                                  {o.status === 'shipped' && (
                                    <option value="delivered">delivered</option>
                                  )}
                                </select>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {tab === 'profile' && (
            <>
              <h2 className="supplier-dash-title">Profile</h2>
              <p className="supplier-dash-subtitle">Your account and business information.</p>

              <div className="supplier-dash-profile-grid">
                <div className="supplier-dash-panel supplier-dash-profile-card">
                  <h3>Account</h3>
                  <dl>
                    <div className="supplier-dash-profile-row">
                      <dt>Full name</dt>
                      <dd>{user?.fullName || '—'}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Email</dt>
                      <dd>{user?.email || '—'}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Phone</dt>
                      <dd>{user?.phoneNumber || '—'}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Role</dt>
                      <dd>{user?.role || 'supplier'}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Account status</dt>
                      <dd>
                        <span
                          className={`supplier-dash-badge ${user?.isActive ? 'success' : 'muted'}`}
                        >
                          {user?.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="supplier-dash-panel supplier-dash-profile-card">
                  <h3>Business</h3>
                  <dl>
                    <div className="supplier-dash-profile-row">
                      <dt>Business name</dt>
                      <dd>{supplierInfo?.businessName || '—'}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Supplier ID</dt>
                      <dd>{supplierInfo?.id || '—'}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Verification</dt>
                      <dd>
                        {supplierInfo ? (
                          <span
                            className={`supplier-dash-badge ${supplierStatusBadge(supplierInfo.status).className}`}
                          >
                            {supplierStatusBadge(supplierInfo.status).label}
                          </span>
                        ) : (
                          '—'
                        )}
                      </dd>
                    </div>
                    {supplierInfo?.documentUrl && (
                      <div className="supplier-dash-profile-row">
                        <dt>Document</dt>
                        <dd>
                          <a href={supplierInfo.documentUrl} target="_blank" rel="noreferrer">
                            View uploaded document
                          </a>
                        </dd>
                      </div>
                    )}
                    {supplierInfo?.rejectionReason && (
                      <div className="supplier-dash-profile-row">
                        <dt>Rejection reason</dt>
                        <dd>{supplierInfo.rejectionReason}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                <div className="supplier-dash-panel supplier-dash-profile-card">
                  <h3>Store summary</h3>
                  <dl>
                    <div className="supplier-dash-profile-row">
                      <dt>Products listed</dt>
                      <dd>{products.length}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Orders received</dt>
                      <dd>{orders.length}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Total order value</dt>
                      <dd>₦ {revenue.toLocaleString('en-NG')}</dd>
                    </div>
                    <div className="supplier-dash-profile-row">
                      <dt>Member since</dt>
                      <dd>
                        {user?.createdAt
                          ? new Date(user.createdAt).toLocaleDateString('en-NG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })
                          : '—'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </>
          )}
        </DashboardShell>
      </RequireAuth>
    </Layout>
  );
}
