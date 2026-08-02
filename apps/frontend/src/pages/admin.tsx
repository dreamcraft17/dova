import { useEffect, useState } from 'react';
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

type AdminContact = { id: string; name: string; email: string; message: string; status: string; createdAt: string };

const NAV = [
  { id: 'overview', label: 'Dashboard', icon: <IconChart /> },
  { id: 'suppliers', label: 'Suppliers', icon: <IconStore /> },
  { id: 'products', label: 'Products', icon: <IconBox /> },
  { id: 'orders', label: 'Orders', icon: <IconCart /> },
  { id: 'users', label: 'Users', icon: <IconUsers /> },
  { id: 'contacts', label: 'Contacts', icon: <IconMail /> },
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
  const [stats, setStats] = useState<Stats>();
  const [pending, setPending] = useState<Supplier[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [contacts, setContacts] = useState<AdminContact[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const load = async () => {
    const [s, p, u, pr, o, c] = await Promise.all([
      api<Stats>('/admin/dashboard'),
      api<Supplier[]>('/admin/suppliers/pending'),
      api<AdminUser[]>('/admin/users'),
      api<Product[]>('/admin/products'),
      api<AdminOrder[]>('/admin/orders'),
      api<AdminContact[]>('/admin/contacts'),
    ]);
    setStats(s);
    setPending(p);
    setUsers(u);
    setProducts(pr);
    setOrders(o);
    setContacts(c);
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
                            <td>{u.fullName}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
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
                              <td>{s.businessName}</td>
                              <td>
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
                              <td>
                                <span className="admin-dash-status pending">{s.status}</span>
                              </td>
                              <td>
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
                        {products.map((p) => (
                          <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.supplierName}</td>
                            <td>{p.stockQuantity}</td>
                            <td>
                              <span className={`admin-dash-status ${p.isActive ? 'active' : 'inactive'}`}>
                                {p.isActive ? 'Active' : 'Hidden'}
                              </span>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="admin-dash-btn admin-dash-btn-primary"
                                disabled={actionBusy}
                                onClick={() => void toggleProduct(p)}
                              >
                                {p.isActive ? 'Deactivate' : 'Activate'}
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
                              <td>{o.orderNumber}</td>
                              <td>{o.customerName}</td>
                              <td>₦ {o.totalAmount.toLocaleString('en-NG')}</td>
                              <td>
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
                            <td>{u.fullName}</td>
                            <td>{u.email}</td>
                            <td>{u.role}</td>
                            <td>
                              <span className={`admin-dash-status ${userStatusClass(u)}`}>
                                {userStatusLabel(u)}
                              </span>
                            </td>
                            <td>
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
                              <td>{c.name}</td>
                              <td>{c.email}</td>
                              <td>{c.message}</td>
                              <td>
                                <span className="admin-dash-status pending">{c.status}</span>
                              </td>
                              <td>{new Date(c.createdAt).toLocaleString('en-NG')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
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
