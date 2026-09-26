import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      PLATFORM CONTROL CENTER
    </div>
    <h1>
      Admin Dashboard
    </h1>
    <p className="lead">
      A single command center for suppliers, products, orders, logistics, payments, customers and platform health.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-primary" to="/admin/orders">
      Review Orders
    </Link>
    <Link className="btn btn-gold" to="/admin/monitoring">
      System Health
    </Link>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Suppliers
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Registered & verified
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Products
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Catalog listings
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Orders
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Selected period
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Customers
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Registered users
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Gross Sales
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Backend calculated
    </div>
  </div>
</div>
<div className="grid dashboard">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Marketplace Activity
      </h2>
      <Link to="/admin/analytics">
        Full analytics →
      </Link>
    </div>
    <div className="chart">
      <div className="chart-grid"></div>
      <div className="bars">
        <i className="bar"></i>
        <i className="bar"></i>
        <i className="bar"></i>
        <i className="bar"></i>
        <i className="bar"></i>
        <i className="bar"></i>
        <i className="bar"></i>
        <i className="bar"></i>
        <i className="bar"></i>
      </div>
      <div className="chart-labels">
        <span>
          W1
        </span>
        <span>
          W2
        </span>
        <span>
          W3
        </span>
        <span>
          W4
        </span>
        <span>
          Current
        </span>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Needs Attention
      </h2>
      <Link to="/admin/audit">
        Audit →
      </Link>
    </div>
    <div className="list">
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            SUP
          </div>
          <div>
            <strong>
              Supplier verification
            </strong>
            <span>
              Live status from backend
            </span>
          </div>
        </div>
        <span className="status yellow">
          Review
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            PRO
          </div>
          <div>
            <strong>
              Product approvals
            </strong>
            <span>
              Live status from backend
            </span>
          </div>
        </div>
        <span className="status blue">
          Action
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            ORD
          </div>
          <div>
            <strong>
              Order exceptions
            </strong>
            <span>
              Live status from backend
            </span>
          </div>
        </div>
        <span className="status yellow">
          Monitor
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            PAY
          </div>
          <div>
            <strong>
              Payout exceptions
            </strong>
            <span>
              Live status from backend
            </span>
          </div>
        </div>
        <span className="status red">
          Check
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            LOG
          </div>
          <div>
            <strong>
              Logistics dispatch
            </strong>
            <span>
              Live status from backend
            </span>
          </div>
        </div>
        <span className="status green">
          Track
        </span>
      </div>
    </div>
  </section>
</div>
<div className="grid dashboard">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Recent Orders
      </h2>
      <Link to="/admin/orders">
        View all →
      </Link>
    </div>
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>
              Order
            </th>
            <th>
              Customer
            </th>
            <th>
              Supplier
            </th>
            <th>
              Amount
            </th>
            <th>
              Status
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>
                #DOVA-—
              </strong>
            </td>
            <td>
              Customer —
            </td>
            <td>
              Supplier —
            </td>
            <td>
              ₦ —
            </td>
            <td>
              <span className="status yellow">
                Pending
              </span>
            </td>
            <td>
              <Link className="mini-btn" to="/admin/orders">
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td>
              <strong>
                #DOVA-—
              </strong>
            </td>
            <td>
              Customer —
            </td>
            <td>
              Supplier —
            </td>
            <td>
              ₦ —
            </td>
            <td>
              <span className="status blue">
                Processing
              </span>
            </td>
            <td>
              <Link className="mini-btn" to="/admin/orders">
                View
              </Link>
            </td>
          </tr>
          <tr>
            <td>
              <strong>
                #DOVA-—
              </strong>
            </td>
            <td>
              Customer —
            </td>
            <td>
              Supplier —
            </td>
            <td>
              ₦ —
            </td>
            <td>
              <span className="status green">
                Completed
              </span>
            </td>
            <td>
              <Link className="mini-btn" to="/admin/orders">
                View
              </Link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        System Health
      </h2>
      <Link to="/admin/monitoring">
        Monitor →
      </Link>
    </div>
    <div className="health">
      <div className="health-item">
        <span className="health-dot"></span>
        <strong>
          API
        </strong>
        <p>
          Connection and service health from monitoring.
        </p>
      </div>
      <div className="health-item">
        <span className="health-dot"></span>
        <strong>
          Database
        </strong>
        <p>
          Connection and service health from monitoring.
        </p>
      </div>
      <div className="health-item">
        <span className="health-dot"></span>
        <strong>
          Payments
        </strong>
        <p>
          Connection and service health from monitoring.
        </p>
      </div>
      <div className="health-item">
        <span className="health-dot"></span>
        <strong>
          Storage
        </strong>
        <p>
          Connection and service health from monitoring.
        </p>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminDashboard() {
  return (
    <AdminLayout activePath="/admin" title="Admin Dashboard" subtitle="DOVA Chain Administration">
      <PageContent />
    </AdminLayout>
  );
}