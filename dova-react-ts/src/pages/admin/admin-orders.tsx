import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      ORDER OPERATIONS
    </div>
    <h1>
      Orders
    </h1>
    <p className="lead">
      Track every order from payment confirmation through supplier preparation, dispatch and delivery.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-gold" to="/admin/order-detail">
      Open Order Detail
    </Link>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      All Orders
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Backend count
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Pending
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Awaiting processing
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      In Delivery
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Active fulfillment
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
      Delivered
    </div>
  </div>
</div>
<div className="card panel">
  <div className="toolbar">
    <input className="input search" placeholder="Search order ID, customer or phone" />
    <div className="filters">
      <select className="select">
        <option>
          All statuses
        </option>
        <option>
          Pending
        </option>
        <option>
          Processing
        </option>
        <option>
          Dispatched
        </option>
        <option>
          Delivered
        </option>
      </select>
      <select className="select">
        <option>
          All dates
        </option>
        <option>
          Today
        </option>
        <option>
          This week
        </option>
      </select>
    </div>
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
            Items
          </th>
          <th>
            Total
          </th>
          <th>
            Payment
          </th>
          <th>
            Fulfillment
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
            — items
          </td>
          <td>
            ₦ —
          </td>
          <td>
            <span className="status gray">
              Backend
            </span>
          </td>
          <td>
            <span className="status gray">
              Backend
            </span>
          </td>
          <td>
            <Link className="mini-btn" to="/admin/order-detail">
              Open
            </Link>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </>
  );
}

export default function AdminOrders() {
  return (
    <AdminLayout activePath="/admin/orders" title="Orders" subtitle="Order operations">
      <PageContent />
    </AdminLayout>
  );
}