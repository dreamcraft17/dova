import { usePortalUI } from '../../components/PortalUI';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      PLATFORM RELIABILITY
    </div>
    <h1>
      System Monitoring
    </h1>
    <p className="lead">
      Monitor the technical services that keep DOVA online: API, database, authentication, payments, storage, webhooks and background jobs.
    </p>
  </div>
  <div className="actions">
    <button className="btn btn-gold" onClick={() => showToast("Refresh will connect to live health-check endpoints.")}>
      Refresh Checks
    </button>
  </div>
</div>
<div className="grid cards-4">
  <div className="card kpi">
    <small>
      API
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
  <div className="card kpi">
    <small>
      Database
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
  <div className="card kpi">
    <small>
      Authentication
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
  <div className="card kpi">
    <small>
      Payments
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
  <div className="card kpi">
    <small>
      Storage
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
  <div className="card kpi">
    <small>
      Webhooks
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
  <div className="card kpi">
    <small>
      Email
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
  <div className="card kpi">
    <small>
      Background Jobs
    </small>
    <strong>
      —
    </strong>
    <div className="delta">
      Awaiting health check
    </div>
  </div>
</div>
<div className="grid dashboard" style={{"marginTop": "18px"}}>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Service Health
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            1
          </div>
          <div>
            <strong>
              API
            </strong>
            <span>
              Endpoint / service health should load here
            </span>
          </div>
        </div>
        <span className="status gray">
          Unknown
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            2
          </div>
          <div>
            <strong>
              Database
            </strong>
            <span>
              Endpoint / service health should load here
            </span>
          </div>
        </div>
        <span className="status gray">
          Unknown
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            3
          </div>
          <div>
            <strong>
              Authentication
            </strong>
            <span>
              Endpoint / service health should load here
            </span>
          </div>
        </div>
        <span className="status gray">
          Unknown
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            4
          </div>
          <div>
            <strong>
              Paystack / Payments
            </strong>
            <span>
              Endpoint / service health should load here
            </span>
          </div>
        </div>
        <span className="status gray">
          Unknown
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            5
          </div>
          <div>
            <strong>
              Image Storage
            </strong>
            <span>
              Endpoint / service health should load here
            </span>
          </div>
        </div>
        <span className="status gray">
          Unknown
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            6
          </div>
          <div>
            <strong>
              Webhooks
            </strong>
            <span>
              Endpoint / service health should load here
            </span>
          </div>
        </div>
        <span className="status gray">
          Unknown
        </span>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Alert Rules
      </h2>
    </div>
    <div className="callout">
      <h3>
        Proactive monitoring
      </h3>
      <p>
        Configure alerts for payment webhook failures, API downtime, database errors, failed deliveries, stock exceptions and unusual activity.
      </p>
      <button className="btn btn-gold" onClick={() => showToast("Alert configuration will connect to monitoring settings.")}>
        Configure Alerts
      </button>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminMonitoring() {
  return (
    <AdminLayout activePath="/admin/monitoring" title="System Monitoring" subtitle="Technical health & alerts">
      <PageContent />
    </AdminLayout>
  );
}