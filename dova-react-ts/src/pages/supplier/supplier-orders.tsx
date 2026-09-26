import { usePortalUI } from '../../components/PortalUI';
import SupplierLayout from '../../layouts/SupplierLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      ORDER MANAGEMENT
    </div>
    <h1>
      Orders
    </h1>
    <p className="lead">
      See customer orders that contain your products, their status and the action required from you.
    </p>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      New Orders
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Needs attention
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Processing
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Being prepared
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
      Fulfilled orders
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Cancelled
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Current period
    </div>
  </div>
</div>
<div className="card panel">
  <div className="searchbar">
    <input placeholder="Search order ID, customer or product..." />
    <select className="filter">
      <option>
        All statuses
      </option>
      <option>
        New
      </option>
      <option>
        Processing
      </option>
      <option>
        Completed
      </option>
      <option>
        Cancelled
      </option>
    </select>
    <button className="btn btn-light" onClick={() => showToast("Order filters will connect to backend.")}>
      Filter
    </button>
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
            Product
          </th>
          <th>
            Qty
          </th>
          <th>
            Amount
          </th>
          <th>
            Status
          </th>
          <th>
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              #DOVA-0001
            </strong>
            <br />
            <span style={{"fontSize": "8px", "color": "var(--muted)"}}>
              Date: —
            </span>
          </td>
          <td>
            Customer name —
          </td>
          <td>
            Plantain Flour
          </td>
          <td>
            —
          </td>
          <td>
            ₦ —
          </td>
          <td>
            <span className="status pending">
              New
            </span>
          </td>
          <td>
            <button className="btn btn-primary" onClick={() => showToast("Order detail view will open here.")}>
              View
            </button>
          </td>
        </tr>
        <tr>
          <td>
            <strong>
              #DOVA-0002
            </strong>
            <br />
            <span style={{"fontSize": "8px", "color": "var(--muted)"}}>
              Date: —
            </span>
          </td>
          <td>
            Customer name —
          </td>
          <td>
            Product name —
          </td>
          <td>
            —
          </td>
          <td>
            ₦ —
          </td>
          <td>
            <span className="status processing">
              Processing
            </span>
          </td>
          <td>
            <button className="btn btn-light" onClick={() => showToast("Order detail view will open here.")}>
              View
            </button>
          </td>
        </tr>
        <tr>
          <td>
            <strong>
              #DOVA-0003
            </strong>
            <br />
            <span style={{"fontSize": "8px", "color": "var(--muted)"}}>
              Date: —
            </span>
          </td>
          <td>
            Customer name —
          </td>
          <td>
            Product name —
          </td>
          <td>
            —
          </td>
          <td>
            ₦ —
          </td>
          <td>
            <span className="status completed">
              Completed
            </span>
          </td>
          <td>
            <button className="btn btn-light" onClick={() => showToast("Order detail view will open here.")}>
              View
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
<div className="card panel" style={{"marginTop": "15px"}}>
  <div className="panel-head">
    <h2>
      Order workflow
    </h2>
  </div>
  <div className="grid" style={{"gridTemplateColumns": "repeat(4,1fr)"}}>
    <div>
      <strong style={{"fontSize": "11px"}}>
        1. New
      </strong>
      <p style={{"fontSize": "9px", "color": "var(--muted)"}}>
        Review the order and confirm stock.
      </p>
    </div>
    <div>
      <strong style={{"fontSize": "11px"}}>
        2. Prepare
      </strong>
      <p style={{"fontSize": "9px", "color": "var(--muted)"}}>
        Prepare the exact ordered quantity.
      </p>
    </div>
    <div>
      <strong style={{"fontSize": "11px"}}>
        3. Handover
      </strong>
      <p style={{"fontSize": "9px", "color": "var(--muted)"}}>
        Coordinate pickup/fulfillment with DOVA.
      </p>
    </div>
    <div>
      <strong style={{"fontSize": "11px"}}>
        4. Complete
      </strong>
      <p style={{"fontSize": "9px", "color": "var(--muted)"}}>
        Order status is updated after fulfillment.
      </p>
    </div>
  </div>
</div>
    </>
  );
}

export default function SupplierOrders() {
  return (
    <SupplierLayout activePath="/supplier/orders" title="Orders" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}