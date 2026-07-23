import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { RequireAuth } from '../components/RequireAuth';
import { DashboardShell } from '../components/DashboardShell';
import { api } from '../lib/api';
import type { Order, Product } from 'dova-shared';

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

const NAV = [
  { id: 'overview', label: 'Dashboard' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'products', label: 'Products' },
  { id: 'orders', label: 'Orders' },
  { id: 'users', label: 'Users' },
];

export default function Admin() {
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState<Stats>();
  const [pending, setPending] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [message, setMessage] = useState('');

  const load = async () => {
    const [s, p, u, pr, o] = await Promise.all([
      api<Stats>('/admin/dashboard'),
      api<Supplier[]>('/admin/suppliers/pending'),
      api<AdminUser[]>('/admin/users'),
      api<Product[]>('/admin/products'),
      api<AdminOrder[]>('/admin/orders'),
    ]);
    setStats(s);
    setPending(p);
    setUsers(u);
    setProducts(pr);
    setOrders(o);
  };

  useEffect(() => {
    void load().catch((e) => setMessage(e.message));
  }, []);

  async function decision(id: string, action: 'approve' | 'reject') {
    const reason = action === 'reject' ? window.prompt('Rejection reason') : undefined;
    if (action === 'reject' && !reason) return;
    await api(`/admin/suppliers/${id}/${action}`, {
      method: 'POST',
      ...(reason ? { body: JSON.stringify({ reason }) } : {}),
    });
    await load();
  }

  async function toggleUser(user: AdminUser) {
    await api(`/admin/users/${user.id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ active: !user.isActive }),
    });
    await load();
  }

  async function toggleProduct(product: Product) {
    await api(`/admin/products/${product.id}/active`, {
      method: 'PUT',
      body: JSON.stringify({ active: !product.isActive }),
    });
    await load();
  }

  return (
    <Layout chrome="none">
      <RequireAuth roles={['admin']}>
        <DashboardShell title="DOVA ADMIN" items={NAV} active={tab} onSelect={setTab}>
          {message && <p className="error">{message}</p>}

          {tab === 'overview' && (
            <>
              <h1>Admin Dashboard</h1>
              <p className="lead-muted">Monitor and manage the DOVA platform.</p>
              {stats && (
                <div className="dashboard-cards">
                  <div className="dash-card">
                    <h2>{stats.users}</h2>
                    <p>Total Users</p>
                  </div>
                  <div className="dash-card">
                    <h2>{stats.suppliers}</h2>
                    <p>Suppliers</p>
                  </div>
                  <div className="dash-card">
                    <h2>{stats.products}</h2>
                    <p>Products</p>
                  </div>
                  <div className="dash-card">
                    <h2>{stats.orders}</h2>
                    <p>Orders</p>
                  </div>
                  <div className="dash-card">
                    <h2>{stats.pendingSuppliers}</h2>
                    <p>Pending</p>
                  </div>
                </div>
              )}
              <div className="admin-table">
                <h2>Recent Users</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 8).map((u) => (
                      <tr key={u.id}>
                        <td data-label="Name">{u.fullName}</td>
                        <td data-label="Role">{u.role}</td>
                        <td data-label="Status">{u.isActive ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'suppliers' && (
            <>
              <h1>Pending Suppliers</h1>
              <p className="lead-muted">Review and approve supplier applications.</p>
              <div className="orders-table">
                {pending.length === 0 ? (
                  <p>No pending suppliers.</p>
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
                            <span className="badge">{s.status}</span>
                          </td>
                          <td data-label="Actions" className="product-actions">
                            <button className="button small" onClick={() => void decision(s.id, 'approve')}>
                              Approve
                            </button>
                            <button
                              className="button small secondary"
                              onClick={() => void decision(s.id, 'reject')}
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {tab === 'products' && (
            <>
              <h1>Products</h1>
              <p className="lead-muted">Activate or deactivate marketplace products.</p>
              <div className="orders-table">
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
                    {products.map((p) => (
                      <tr key={p.id}>
                        <td data-label="Product">{p.name}</td>
                        <td data-label="Supplier">{p.supplierName}</td>
                        <td data-label="Stock">{p.stockQuantity}</td>
                        <td data-label="Status">{p.isActive ? 'Active' : 'Hidden'}</td>
                        <td data-label="">
                          <button className="button small" onClick={() => void toggleProduct(p)}>
                            {p.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {tab === 'orders' && (
            <>
              <h1>Orders</h1>
              <p className="lead-muted">All platform orders.</p>
              <div className="orders-table">
                {orders.length === 0 ? (
                  <p>No orders.</p>
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
                            <span className="badge">{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}

          {tab === 'users' && (
            <>
              <h1>Users</h1>
              <p className="lead-muted">Manage account access.</p>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td data-label="Name">{u.fullName}</td>
                        <td data-label="Email">{u.email}</td>
                        <td data-label="Role">{u.role}</td>
                        <td data-label="">
                          <button className="button small" onClick={() => void toggleUser(u)}>
                            {u.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </DashboardShell>
      </RequireAuth>
    </Layout>
  );
}
