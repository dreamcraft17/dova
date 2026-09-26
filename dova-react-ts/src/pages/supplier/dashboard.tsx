import { Link } from 'react-router-dom';
import SupplierLayout from '../../layouts/SupplierLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      SUPPLIER OVERVIEW
    </div>
    <h1>
      Supplier Dashboard
    </h1>
    <p className="lead">
      Welcome back, Demo Supplier. Manage products, orders, sales and your DOVA supplier profile from one place.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-primary" to="/supplier/add-product">
      ＋ Add Product
    </Link>
    <Link className="btn btn-light" to="/supplier/orders">
      View Orders
    </Link>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Listed Products
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Live count from backend
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Pending Orders
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Orders awaiting action
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Sales
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Selected period
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Available Balance
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Connect payout wallet
    </div>
  </div>
</div>
<div className="grid dashboard-grid">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Sales Overview
      </h2>
      <Link to="/supplier/sales">
        Full analytics →
      </Link>
    </div>
    <div className="chart">
      <div className="chart-grid"></div>
      <div className="chart-line"></div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Recent Orders
      </h2>
      <Link to="/supplier/orders">
        View all →
      </Link>
    </div>
    <div className="list">
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            ORD
          </div>
          <div>
            <strong>
              Order #DOVA-0001
            </strong>
            <span>
              Product details from backend
            </span>
          </div>
        </div>
        <span className="status pending">
          Pending
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            ORD
          </div>
          <div>
            <strong>
              Order #DOVA-0002
            </strong>
            <span>
              Product details from backend
            </span>
          </div>
        </div>
        <span className="status processing">
          Processing
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            ORD
          </div>
          <div>
            <strong>
              Order #DOVA-0003
            </strong>
            <span>
              Product details from backend
            </span>
          </div>
        </div>
        <span className="status completed">
          Completed
        </span>
      </div>
    </div>
  </section>
</div>
<div className="grid dashboard-grid">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Product Performance
      </h2>
      <Link to="/supplier/products">
        Manage products →
      </Link>
    </div>
    <div className="list">
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            PF
          </div>
          <div>
            <strong>
              Plantain Flour
            </strong>
            <span>
              Orders / stock / revenue from API
            </span>
          </div>
        </div>
        <span className="amount">
          ₦ —
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            PF
          </div>
          <div>
            <strong>
              Other Products
            </strong>
            <span>
              Live catalog information
            </span>
          </div>
        </div>
        <span className="amount">
          ₦ —
        </span>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Supplier Activity
      </h2>
    </div>
    <div className="timeline">
      <div className="event">
        <div className="dot"></div>
        <div>
          <strong>
            Products and orders
          </strong>
          <p>
            Activity will be populated from your account.
          </p>
        </div>
      </div>
      <div className="event">
        <div className="dot"></div>
        <div>
          <strong>
            Payments
          </strong>
          <p>
            Payout and settlement events will appear here.
          </p>
        </div>
      </div>
      <div className="event">
        <div className="dot"></div>
        <div>
          <strong>
            Account
          </strong>
          <p>
            Profile and verification events will appear here.
          </p>
        </div>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function Dashboard() {
  return (
    <SupplierLayout activePath="/supplier" title="Supplier Dashboard" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}