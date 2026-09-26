import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      DATA & INSIGHTS
    </div>
    <h1>
      Analytics
    </h1>
    <p className="lead">
      Turn marketplace, customer, supplier and fulfillment data into operational visibility. Every metric should be calculated from the backend.
    </p>
  </div>
  <div className="actions">
    <select className="select">
      <option>
        Last 30 days
      </option>
      <option>
        Last 7 days
      </option>
      <option>
        Quarter
      </option>
    </select>
  </div>
</div>
<div className="grid cards-4">
  <div className="card kpi">
    <small>
      Orders
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Period total
    </div>
  </div>
  <div className="card kpi">
    <small>
      Sales
    </small>
    <strong>
      ₦ —
    </strong>
    <div className="delta">
      Period total
    </div>
  </div>
  <div className="card kpi">
    <small>
      Average Order
    </small>
    <strong>
      ₦ —
    </strong>
    <div className="delta">
      Backend calculated
    </div>
  </div>
  <div className="card kpi">
    <small>
      Completion Rate
    </small>
    <strong>
      —%
    </strong>
    <div className="delta">
      Backend calculated
    </div>
  </div>
</div>
<div className="grid dashboard" style={{"marginTop": "18px"}}>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Orders & Sales Trend
      </h2>
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
          Start
        </span>
        <span>
          Week 1
        </span>
        <span>
          Week 2
        </span>
        <span>
          Week 3
        </span>
        <span>
          Now
        </span>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Key Dimensions
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div>
          <strong>
            Top products
          </strong>
          <span>
            Backend report
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Top suppliers
          </strong>
          <span>
            Backend report
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Top customer zones
          </strong>
          <span>
            Backend report
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Delivery time
          </strong>
          <span>
            Backend report
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Repeat customers
          </strong>
          <span>
            Backend report
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminAnalytics() {
  return (
    <AdminLayout activePath="/admin/analytics" title="Analytics" subtitle="Business intelligence">
      <PageContent />
    </AdminLayout>
  );
}