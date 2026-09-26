import { usePortalUI } from '../../components/PortalUI';
import LogisticsLayout from '../../layouts/LogisticsLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="head">
  <div>
    <div className="eyebrow">
      DISPATCH QUEUE
    </div>
    <h1>
      Available Jobs
    </h1>
    <p className="lead">
      Orders approved for delivery assignment. Each job shows pickup, delivery zone, package information and the operational details required to accept it.
    </p>
  </div>
</div>
<div className="card panel">
  <div className="toolbar" style={{"display": "flex", "gap": "9px", "justifyContent": "space-between", "flexWrap": "wrap", "marginBottom": "18px"}}>
    <input className="input" style={{"maxWidth": "330px"}} placeholder="Search order or zone" />
    <div style={{"display": "flex", "gap": "8px"}}>
      <select className="select">
        <option>
          All zones
        </option>
        <option>
          Bayelsa
        </option>
        <option>
          Rivers
        </option>
      </select>
      <select className="select">
        <option>
          Nearest first
        </option>
        <option>
          Newest
        </option>
      </select>
    </div>
  </div>
  <div className="grid three">
    <article className="card order-card" style={{"boxShadow": "none"}}>
      <div className="order-top">
        <div>
          <div className="order-id">
            Order #DOVA-—
          </div>
          <div className="muted">
            Available for pickup
          </div>
        </div>
        <span className="status yellow">
          Available
        </span>
      </div>
      <div className="order-products">
        <div className="product-line">
          <span>
            Products
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
        <div className="product-line">
          <span>
            Delivery zone
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
              Supplier location loads here.
            </span>
          </div>
        </div>
        <div className="route-line"></div>
        <div className="route-point">
          <i className="route-dot gold"></i>
          <div className="route-text">
            <strong>
              Drop-off
            </strong>
            <span>
              Customer delivery location loads here.
            </span>
          </div>
        </div>
      </div>
      <div className="order-actions">
        <button className="btn primary" onClick={() => showToast("Accept action will lock this delivery to your account through the backend.")}>
          Accept Job
        </button>
        <button className="btn ghost" onClick={() => showToast("Job details will open from the backend order record.")}>
          Details
        </button>
      </div>
    </article>
    <article className="card order-card" style={{"boxShadow": "none"}}>
      <div className="order-top">
        <div>
          <div className="order-id">
            Order #DOVA-—
          </div>
          <div className="muted">
            Available for pickup
          </div>
        </div>
        <span className="status blue">
          Ready
        </span>
      </div>
      <div className="order-products">
        <div className="product-line">
          <span>
            Products
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
        <div className="product-line">
          <span>
            Delivery zone
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
              Supplier location loads here.
            </span>
          </div>
        </div>
        <div className="route-line"></div>
        <div className="route-point">
          <i className="route-dot gold"></i>
          <div className="route-text">
            <strong>
              Drop-off
            </strong>
            <span>
              Customer delivery location loads here.
            </span>
          </div>
        </div>
      </div>
      <div className="order-actions">
        <button className="btn primary" onClick={() => showToast("Accept action will lock this delivery to your account through the backend.")}>
          Accept Job
        </button>
        <button className="btn ghost" onClick={() => showToast("Job details will open from the backend order record.")}>
          Details
        </button>
      </div>
    </article>
    <article className="card order-card" style={{"boxShadow": "none"}}>
      <div className="order-top">
        <div>
          <div className="order-id">
            Order #DOVA-—
          </div>
          <div className="muted">
            Available for pickup
          </div>
        </div>
        <span className="status green">
          Priority
        </span>
      </div>
      <div className="order-products">
        <div className="product-line">
          <span>
            Products
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
        <div className="product-line">
          <span>
            Delivery zone
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
              Supplier location loads here.
            </span>
          </div>
        </div>
        <div className="route-line"></div>
        <div className="route-point">
          <i className="route-dot gold"></i>
          <div className="route-text">
            <strong>
              Drop-off
            </strong>
            <span>
              Customer delivery location loads here.
            </span>
          </div>
        </div>
      </div>
      <div className="order-actions">
        <button className="btn primary" onClick={() => showToast("Accept action will lock this delivery to your account through the backend.")}>
          Accept Job
        </button>
        <button className="btn ghost" onClick={() => showToast("Job details will open from the backend order record.")}>
          Details
        </button>
      </div>
    </article>
  </div>
</div>
    </>
  );
}

export default function LogisticsAvailable() {
  return (
    <LogisticsLayout activePath="/logistics/available" title="Available Jobs" subtitle="Delivery assignments available to you">
      <PageContent />
    </LogisticsLayout>
  );
}