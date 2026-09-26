import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      SECURITY & ACCOUNTABILITY
    </div>
    <h1>
      Audit Logs
    </h1>
    <p className="lead">
      A chronological record of sensitive administrative actions, authentication events, changes and system events.
    </p>
  </div>
</div>
<div className="card panel">
  <div className="toolbar">
    <input className="input search" placeholder="Search event, actor or resource" />
    <div className="filters">
      <select className="select">
        <option>
          All event types
        </option>
        <option>
          Authentication
        </option>
        <option>
          Product
        </option>
        <option>
          Order
        </option>
        <option>
          Supplier
        </option>
        <option>
          Finance
        </option>
      </select>
      <select className="select">
        <option>
          All actors
        </option>
        <option>
          Admin
        </option>
        <option>
          System
        </option>
      </select>
    </div>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Time
          </th>
          <th>
            Actor
          </th>
          <th>
            Action
          </th>
          <th>
            Resource
          </th>
          <th>
            IP / Device
          </th>
          <th>
            Result
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            —
          </td>
          <td>
            —
          </td>
          <td>
            Audit events load here
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

export default function AdminAudit() {
  return (
    <AdminLayout activePath="/admin/audit" title="Audit Logs" subtitle="Security & administrator activity">
      <PageContent />
    </AdminLayout>
  );
}