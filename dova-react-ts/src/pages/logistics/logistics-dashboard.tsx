import { Link } from 'react-router-dom';
import { usePortalUI } from '../../components/PortalUI';
import LogisticsLayout from '../../layouts/LogisticsLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="head">
  <div>
    <div className="eyebrow">
      DELIVERY COMMAND CENTER
    </div>
    <h1>
      Good day, Delivery Partner
    </h1>
    <p className="lead">
      See only the delivery work assigned or made available to you. Order details, pickup information and status changes are synchronized with DOVA operations.
    </p>
  </div>
  <div className="actions">
    <Link className="btn gold" to="/logistics/available">
      Find Available Jobs
    </Link>
    <button className="btn primary" onClick={() => showToast("Availability status will sync with dispatch.")}>
      Set Availability
    </button>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Available Jobs
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Dispatch queue
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Active Delivery
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Current assignment
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Completed
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Today
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Today's Earnings
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Backend calculated
    </div>
  </div>
</div>
<div className="grid two">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Current Assignment
      </h2>
      <Link to="/logistics/active">
        Open delivery →
      </Link>
    </div>
    <div className="order-card" style={{"padding": "0", "boxShadow": "none", "border": "0"}}>
      <div className="order-top">
        <div>
          <div className="order-id">
            Order #DOVA-—
          </div>
          <div className="muted">
            Assigned delivery • details load from backend
          </div>
        </div>
        <span className="status yellow">
          Awaiting assignment data
        </span>
      </div>
      <div className="order-products">
        <div className="product-line">
          <span>
            Ordered products
          </span>
          <strong>
            —
          </strong>
        </div>
        <div className="product-line">
          <span>
            Packages
          </span>
          <strong>
            —
          </strong>
        </div>
      </div>
      <div className="route">
        <div className="route-point">
          <i className="route-dot"></i>
          <div className="route-text">
            <strong>
              Pickup
            </strong>
            <span>
              Supplier location will appear here.
            </span>
          </div>
        </div>
        <div className="route-line"></div>
        <div className="route-point">
          <i className="route-dot gold"></i>
          <div className="route-text">
            <strong>
              Customer delivery
            </strong>
            <span>
              Customer delivery location will appear here.
            </span>
          </div>
        </div>
      </div>
      <div className="order-actions">
        <Link className="btn primary" to="/logistics/active">
          Open Delivery
        </Link>
        <button className="btn ghost" onClick={() => showToast("Navigation will use the delivery provider integration.")}>
          Navigate
        </button>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Today at a Glance
      </h2>
      <Link to="/logistics/earnings">
        Earnings →
      </Link>
    </div>
    <div className="list">
      <div className="row">
        <div>
          <strong>
            Jobs accepted
          </strong>
          <span>
            Live value from backend
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Pickups completed
          </strong>
          <span>
            Live value from backend
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Deliveries completed
          </strong>
          <span>
            Live value from backend
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Distance / route time
          </strong>
          <span>
            Live value from backend
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Delivery success rate
          </strong>
          <span>
            Live value from backend
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
    </div>
  </section>
</div>
<div className="grid two" style={{"marginTop": "18px"}}>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Dispatch Activity
      </h2>
      <Link to="/logistics/history">
        History →
      </Link>
    </div>
    <div className="timeline">
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            New delivery assignment
          </strong>
          <p>
            Time, order ID and actor will be synchronized from DOVA.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Pickup confirmation
          </strong>
          <p>
            Time, order ID and actor will be synchronized from DOVA.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Customer delivery
          </strong>
          <p>
            Time, order ID and actor will be synchronized from DOVA.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Proof of delivery
          </strong>
          <p>
            Time, order ID and actor will be synchronized from DOVA.
          </p>
        </div>
      </div>
    </div>
  </section>
  <section className="callout">
    <h3>
      Your delivery status matters
    </h3>
    <p>
      When you accept, pick up or deliver an order, the event should immediately update the customer and DOVA admin views through the backend.
    </p>
    <Link className="btn gold" to="/logistics/active">
      View Active Delivery
    </Link>
  </section>
</div>
    </>
  );
}

export default function LogisticsDashboard() {
  return (
    <LogisticsLayout activePath="/logistics" title="Delivery Dashboard" subtitle="Dispatch overview & today's route">
      <PageContent />
    </LogisticsLayout>
  );
}