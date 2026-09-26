import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      ORDER LIFECYCLE
    </div>
    <h1>
      Order #DOVA-—
    </h1>
    <p className="lead">
      One view for payment, customer, products, supplier, logistics assignment and delivery proof.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-gold" to="/admin/logistics">
      Assign Logistics
    </Link>
  </div>
</div>
<div className="detail-grid">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Order Items
      </h2>
      <span className="status gray">
        Backend data
      </span>
    </div>
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>
              Product
            </th>
            <th>
              Pack
            </th>
            <th>
              Qty
            </th>
            <th>
              Unit
            </th>
            <th>
              Total
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <strong>
                Products load from order
              </strong>
            </td>
            <td>
              —
            </td>
            <td>
              —
            </td>
            <td>
              ₦ —
            </td>
            <td>
              ₦ —
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style={{"marginTop": "18px"}}>
      <h2 style={{"fontSize": "15px"}}>
        Customer & Delivery
      </h2>
      <div className="grid cards-2">
        <div className="card kpi">
          <small>
            Customer
          </small>
          <strong>
            —
          </strong>
        </div>
        <div className="card kpi">
          <small>
            Phone
          </small>
          <strong>
            —
          </strong>
        </div>
        <div className="card kpi">
          <small>
            Delivery address
          </small>
          <strong>
            —
          </strong>
        </div>
        <div className="card kpi">
          <small>
            Delivery zone
          </small>
          <strong>
            —
          </strong>
        </div>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Order Timeline
      </h2>
    </div>
    <div className="timeline">
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Order created
          </strong>
          <p>
            Timestamp and actor will load from backend.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Payment confirmed
          </strong>
          <p>
            Timestamp and actor will load from backend.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Supplier notified
          </strong>
          <p>
            Timestamp and actor will load from backend.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Prepared for pickup
          </strong>
          <p>
            Timestamp and actor will load from backend.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Logistics assigned
          </strong>
          <p>
            Timestamp and actor will load from backend.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Picked up
          </strong>
          <p>
            Timestamp and actor will load from backend.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Delivered
          </strong>
          <p>
            Timestamp and actor will load from backend.
          </p>
        </div>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminOrderDetail() {
  return (
    <AdminLayout activePath="/admin/orders" title="Order Details" subtitle="Order lifecycle & fulfillment">
      <PageContent />
    </AdminLayout>
  );
}