import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      SUPPLIER NETWORK
    </div>
    <h1>
      Suppliers
    </h1>
    <p className="lead">
      Review supplier registrations, verification status, product activity and operational performance.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-gold" to="/admin/supplier-detail">
      Open Supplier Profile
    </Link>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      All Suppliers
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
      Verification queue
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Verified
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Approved suppliers
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Suspended
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Needs review
    </div>
  </div>
</div>
<div className="card panel">
  <div className="toolbar">
    <input className="input search" placeholder="Search supplier, phone or ID" />
    <div className="filters">
      <select className="select">
        <option>
          All status
        </option>
        <option>
          Pending
        </option>
        <option>
          Verified
        </option>
        <option>
          Suspended
        </option>
      </select>
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
    </div>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Supplier
          </th>
          <th>
            Location
          </th>
          <th>
            Products
          </th>
          <th>
            Verification
          </th>
          <th>
            Joined
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              Supplier records load here
            </strong>
            <br />
            <span style={{"color": "var(--muted)", "fontSize": "10px"}}>
              No live records hard-coded
            </span>
          </td>
          <td>
            —
          </td>
          <td>
            —
          </td>
          <td>
            <span className="status gray">
              Awaiting data
            </span>
          </td>
          <td>
            —
          </td>
          <td>
            <Link className="mini-btn" to="/admin/supplier-detail">
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

export default function AdminSuppliers() {
  return (
    <AdminLayout activePath="/admin/suppliers" title="Suppliers" subtitle="Supplier network management">
      <PageContent />
    </AdminLayout>
  );
}