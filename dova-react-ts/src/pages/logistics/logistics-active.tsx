import { usePortalUI } from '../../components/PortalUI';
import LogisticsLayout from '../../layouts/LogisticsLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="head">
  <div>
    <div className="eyebrow">
      LIVE DELIVERY
    </div>
    <h1>
      Order #DOVA-—
    </h1>
    <p className="lead">
      This is the operational screen for the current delivery. Status changes here should synchronize to the DOVA admin and customer order views.
    </p>
  </div>
  <div className="actions">
    <button className="btn gold" onClick={() => showToast("Emergency/support action will notify DOVA operations.")}>
      Need Help
    </button>
  </div>
</div>
<div className="grid two">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Route
      </h2>
      <span className="status blue">
        Active
      </span>
    </div>
    <div className="map">
      <div className="map-pin pin1">
        P
      </div>
      <div className="map-label lab1">
        Pickup
      </div>
      <div className="map-pin pin2">
        D
      </div>
      <div className="map-label lab2">
        Customer
      </div>
      <div className="map-pin pin3">
        R
      </div>
      <div className="map-label lab3">
        Current
      </div>
    </div>
    <div style={{"display": "flex", "gap": "8px", "flexWrap": "wrap", "marginTop": "14px"}}>
      <button className="btn primary" onClick={() => showToast("Navigation integration will open here.")}>
        Open Navigation
      </button>
      <button className="btn ghost" onClick={() => showToast("Location sharing will connect to backend permissions.")}>
        Share Location
      </button>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Delivery Steps
      </h2>
      <span className="status gray">
        Backend synced
      </span>
    </div>
    <div className="timeline">
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Accept delivery
          </strong>
          <p>
            Timestamp will be recorded.
          </p>
          <button className="btn lime" onClick={() => showToast("Accepted status will sync to admin and customer.")}>
            Confirm Accepted
          </button>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Arrive at pickup
          </strong>
          <p>
            Supplier and pickup contact appear here.
          </p>
          <button className="btn ghost" onClick={() => showToast("Pickup arrival will sync to order timeline.")}>
            Mark Arrived
          </button>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Pickup confirmed
          </strong>
          <p>
            Confirm that the correct packages have been collected.
          </p>
          <button className="btn ghost" onClick={() => showToast("Pickup confirmation will sync to admin.")}>
            Confirm Pickup
          </button>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Arrive at customer
          </strong>
          <p>
            Customer delivery details and contact appear here.
          </p>
          <button className="btn ghost" onClick={() => showToast("Arrival event will sync to order.")}>
            Mark Arrived
          </button>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Delivered
          </strong>
          <p>
            Proof of delivery should be required before completion.
          </p>
          <button className="btn gold" onClick={() => showToast("Delivery completion will require backend proof-of-delivery validation.")}>
            Complete Delivery
          </button>
        </div>
      </div>
    </div>
  </section>
</div>
<div className="card panel" style={{"marginTop": "18px"}}>
  <div className="panel-head">
    <h2>
      Order Information
    </h2>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Information
          </th>
          <th>
            Value
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            Products ordered
          </td>
          <td>
            Backend order items
          </td>
        </tr>
        <tr>
          <td>
            Package count
          </td>
          <td>
            —
          </td>
        </tr>
        <tr>
          <td>
            Supplier pickup
          </td>
          <td>
            Backend supplier address & contact
          </td>
        </tr>
        <tr>
          <td>
            Customer delivery
          </td>
          <td>
            Backend delivery address & contact
          </td>
        </tr>
        <tr>
          <td>
            Payment status
          </td>
          <td>
            <span className="status gray">
              Backend controlled
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </>
  );
}

export default function LogisticsActive() {
  return (
    <LogisticsLayout activePath="/logistics/active" title="Active Delivery" subtitle="Pickup \u2192 customer delivery">
      <PageContent />
    </LogisticsLayout>
  );
}