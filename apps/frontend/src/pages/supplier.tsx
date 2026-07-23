import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Layout } from '../components/Layout';
import { RequireAuth } from '../components/RequireAuth';
import { DashboardShell } from '../components/DashboardShell';
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
  { id: 'overview', label: 'Dashboard' },
  { id: 'products', label: 'Products' },
  { id: 'add', label: 'Add Product' },
  { id: 'orders', label: 'Orders' },
];

export default function Supplier() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<SupplierOrder[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState<string>();
  const [message, setMessage] = useState('');
  const [supplierInfo, setSupplierInfo] = useState<{
    status: string;
    businessName: string;
    rejectionReason?: string;
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
    void api<{ status: string; businessName: string; rejectionReason?: string }>('/suppliers/status')
      .then((info) => {
        setSupplierInfo(info);
        if (info.status === 'approved') return load();
      })
      .catch((e) => setMessage(e.message));
  }, []);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMessage('');
    try {
      const path = editing ? `/suppliers/products/${editing}` : '/suppliers/products';
      await api(path, { method: editing ? 'PUT' : 'POST', body: JSON.stringify(form) });
      setForm({ ...empty, categoryId: categories[0]?.id || '' });
      setEditing(undefined);
      await load();
      setMessage('Product saved.');
      setTab('products');
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function remove(id: string) {
    if (!window.confirm('Remove this product?')) return;
    await api(`/suppliers/products/${id}`, { method: 'DELETE' });
    await load();
  }

  async function stock(id: string, reason: 'restock' | 'damage') {
    const raw = window.prompt(`${reason === 'restock' ? 'Restock' : 'Remove'} quantity`, '1');
    const quantity = Number(raw);
    if (!quantity) return;
    try {
      await api(`/suppliers/products/${id}/stock`, {
        method: 'PUT',
        body: JSON.stringify({ quantity, reason }),
      });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
    }
  }

  async function status(itemId: string, value: string) {
    try {
      await api(`/suppliers/orders/${itemId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: value }),
      });
      await load();
    } catch (err) {
      setMessage((err as Error).message);
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
        <DashboardShell title="DOVA" items={NAV} active={tab} onSelect={setTab}>
          {message && <p className={message.includes('saved') ? '' : 'error'}>{message}</p>}

          {tab === 'overview' && (
            <>
              <h1>Supplier Dashboard</h1>
              <p className="lead-muted">
                Welcome back{user?.fullName ? `, ${user.fullName}` : ''}
                {supplierInfo?.businessName ? ` · ${supplierInfo.businessName}` : ''}
              </p>
              <div className="dashboard-cards">
                <div className="dash-card">
                  <h2>{products.length}</h2>
                  <p>Total Products</p>
                </div>
                <div className="dash-card">
                  <h2>{orders.length}</h2>
                  <p>Total Orders</p>
                </div>
                <div className="dash-card">
                  <h2>₦ {revenue.toLocaleString('en-NG')}</h2>
                  <p>Order Value</p>
                </div>
              </div>
              <div className="recent-products">
                <h2>Recent Products</h2>
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
                    {products.slice(0, 8).map((p) => (
                      <tr key={p.id}>
                        <td data-label="Product">{p.name}</td>
                        <td data-label="Category">{p.categoryName}</td>
                        <td data-label="Stock">{p.stockQuantity}</td>
                        <td data-label="Status">
                          {p.stockQuantity < 20
                            ? 'Low Stock'
                            : p.isActive
                              ? 'Available'
                              : 'Hidden'}
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr>
                        <td colSpan={4}>No products yet. Add your first product.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'products' && (
            <>
              <h1>Your Products</h1>
              <p className="lead-muted">Manage stock and listings ({products.length}).</p>
              <div className="orders-table">
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
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Product">{p.name}</td>
                        <td data-label="Price">₦ {p.price.toLocaleString('en-NG')}</td>
                        <td data-label="Stock">{p.stockQuantity}</td>
                        <td data-label="Status">{p.isActive ? 'Active' : 'Hidden'}</td>
                        <td data-label="Actions">
                          <div className="product-actions">
                            <button className="button small" onClick={() => startEdit(p)}>
                              Edit
                            </button>
                            <button className="button small" onClick={() => void stock(p.id, 'restock')}>
                              + Stock
                            </button>
                            <button className="button small" onClick={() => void stock(p.id, 'damage')}>
                              − Stock
                            </button>
                            <button
                              className="button small secondary"
                              onClick={() => void remove(p.id)}
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'add' && (
            <>
              <h1>{editing ? 'Edit Product' : 'Add Product'}</h1>
              <p className="lead-muted">
                {editing ? 'Update your product details.' : 'List a new product on DOVA.'}
              </p>
              <div className="add-product-form">
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
                  <label>Image URL</label>
                  <input
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                    placeholder="https://..."
                  />
                  <button type="submit">{editing ? 'Save changes' : 'Add product'}</button>
                  {editing && (
                    <button
                      type="button"
                      className="button secondary"
                      style={{ marginTop: 12 }}
                      onClick={() => {
                        setEditing(undefined);
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
              <h1>Orders</h1>
              <p className="lead-muted">Manage all customer orders for your products.</p>
              <div className="orders-table">
                {orders.length === 0 ? (
                  <p>No incoming orders.</p>
                ) : (
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
                          <td data-label="Order">{o.orderNumber}</td>
                          <td data-label="Customer">
                            {o.customerName}
                            <br />
                            <small className="muted">{o.deliveryAddress}</small>
                          </td>
                          <td data-label="Product">{o.productName}</td>
                          <td data-label="Qty">{o.quantity}</td>
                          <td data-label="Total">₦ {o.subtotal.toLocaleString('en-NG')}</td>
                          <td data-label="Status">
                            {o.status === 'delivered' ? (
                              <span className="badge">{o.status}</span>
                            ) : (
                              <select
                                value={o.status}
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
                )}
              </div>
            </>
          )}
        </DashboardShell>
      </RequireAuth>
    </Layout>
  );
}
