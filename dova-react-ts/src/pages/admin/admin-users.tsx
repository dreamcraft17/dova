import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      CUSTOMER ACCOUNTS
    </div>
    <h1>
      Users
    </h1>
    <p className="lead">
      Manage customer accounts, access state, order history and support actions without exposing sensitive information unnecessarily.
    </p>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Users
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Registered accounts
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
      Active accounts
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
      Selected period
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Blocked
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Access restricted
    </div>
  </div>
</div>
<div className="card panel">
  <div className="toolbar">
    <input className="input search" placeholder="Search by name, email or phone" />
    <select className="select">
      <option>
        All users
      </option>
      <option>
        Active
      </option>
      <option>
        Blocked
      </option>
    </select>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            User
          </th>
          <th>
            Email
          </th>
          <th>
            Phone
          </th>
          <th>
            Orders
          </th>
          <th>
            Status
          </th>
          <th>
            Joined
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              User records load here
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

export default function AdminUsers() {
  return (
    <AdminLayout activePath="/admin/users" title="Users" subtitle="Customer account management">
      <PageContent />
    </AdminLayout>
  );
}