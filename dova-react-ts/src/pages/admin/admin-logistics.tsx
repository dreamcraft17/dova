import { Link } from 'react-router-dom';
import { usePortalUI } from '../../components/PortalUI';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      FULFILLMENT CONTROL
    </div>
    <h1>
      Logistics
    </h1>
    <p className="lead">
      Assign deliveries, monitor riders, manage delivery zones and track the final-mile journey of every order.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-gold" to="/admin/logistics-registration">
      Logistics Registration
    </Link>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Providers
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Registered logistics
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Online
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Available riders
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Active
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Deliveries in progress
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
      Selected period
    </div>
  </div>
</div>
<div className="grid dashboard">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Dispatch Queue
      </h2>
      <Link to="/admin/orders">
        Orders →
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
              Pickup
            </th>
            <th>
              Customer
            </th>
            <th>
              Zone
            </th>
            <th>
              Assignment
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
              Supplier —
            </td>
            <td>
              Customer —
            </td>
            <td>
              —
            </td>
            <td>
              <span className="status yellow">
                Unassigned
              </span>
            </td>
            <td>
              <button className="mini-btn" onClick={() => showToast("Assignment will connect to dispatch API.")}>
                Assign
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Delivery Controls
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            01
          </div>
          <div>
            <strong>
              Rider availability
            </strong>
            <span>
              Backend-controlled
            </span>
          </div>
        </div>
        <span className="status green">
          Ready
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            02
          </div>
          <div>
            <strong>
              Delivery zones
            </strong>
            <span>
              Backend-controlled
            </span>
          </div>
        </div>
        <span className="status green">
          Ready
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            03
          </div>
          <div>
            <strong>
              Pickup confirmation
            </strong>
            <span>
              Backend-controlled
            </span>
          </div>
        </div>
        <span className="status green">
          Ready
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            04
          </div>
          <div>
            <strong>
              Proof of delivery
            </strong>
            <span>
              Backend-controlled
            </span>
          </div>
        </div>
        <span className="status green">
          Ready
        </span>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminLogistics() {
  return (
    <AdminLayout activePath="/admin/logistics" title="Logistics" subtitle="Delivery operations & dispatch">
      <PageContent />
    </AdminLayout>
  );
}