import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      VOICE OF THE CUSTOMER
    </div>
    <h1>
      Feedback
    </h1>
    <p className="lead">
      Capture product, delivery, website and service feedback and turn recurring issues into operational actions.
    </p>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Feedback
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      All submissions
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      New
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Needs review
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Resolved
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Closed cases
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Issues
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Escalated
    </div>
  </div>
</div>
<div className="card panel">
  <div className="toolbar">
    <select className="select">
      <option>
        All feedback types
      </option>
      <option>
        Product
      </option>
      <option>
        Delivery
      </option>
      <option>
        Website
      </option>
      <option>
        Service
      </option>
    </select>
    <select className="select">
      <option>
        All status
      </option>
      <option>
        New
      </option>
      <option>
        Reviewing
      </option>
      <option>
        Resolved
      </option>
    </select>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Customer
          </th>
          <th>
            Type
          </th>
          <th>
            Rating
          </th>
          <th>
            Message
          </th>
          <th>
            Status
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              Feedback records load here
            </strong>
          </td>
          <td>
            —
          </td>
          <td>
            —
          </td>
          <td>
            —
          </td>
          <td>
            <span className="status gray">
              Backend
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

export default function AdminFeedback() {
  return (
    <AdminLayout activePath="/admin/feedback" title="Feedback" subtitle="Customer feedback management">
      <PageContent />
    </AdminLayout>
  );
}