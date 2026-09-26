import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      COMMUNICATIONS
    </div>
    <h1>
      Contacts
    </h1>
    <p className="lead">
      Manage customer support, supplier enquiries, business partnerships and general contact submissions.
    </p>
  </div>
</div>
<div className="grid cards-3">
  <div className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      CS
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Customer Support
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)"}}>
      Live conversation count and queue data will appear here.
    </p>
    <span className="status gray">
      — open
    </span>
  </div>
  <div className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      BP
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Business / Partnerships
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)"}}>
      Live conversation count and queue data will appear here.
    </p>
    <span className="status gray">
      — open
    </span>
  </div>
  <div className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      FS
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Farmers / Suppliers
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)"}}>
      Live conversation count and queue data will appear here.
    </p>
    <span className="status gray">
      — open
    </span>
  </div>
</div>
<div className="card panel" style={{"marginTop": "18px"}}>
  <div className="toolbar">
    <input className="input search" placeholder="Search conversations" />
    <select className="select">
      <option>
        All statuses
      </option>
      <option>
        Open
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
            Contact
          </th>
          <th>
            Type
          </th>
          <th>
            Subject
          </th>
          <th>
            Status
          </th>
          <th>
            Received
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              Contact messages load here
            </strong>
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
          <td>
            —
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </>
  );
}

export default function AdminContacts() {
  return (
    <AdminLayout activePath="/admin/contacts" title="Contacts" subtitle="Customer & business enquiries">
      <PageContent />
    </AdminLayout>
  );
}