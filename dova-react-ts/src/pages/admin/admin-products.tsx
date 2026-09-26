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
      CATALOG CONTROL
    </div>
    <h1>
      Products
    </h1>
    <p className="lead">
      Approve, publish, edit and monitor every product entering the DOVA marketplace.
    </p>
  </div>
  <div className="actions">
    <button className="btn btn-gold" onClick={() => showToast("Product creation form can connect to the product API.")}>
      + Add Product
    </button>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Catalog
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      All products
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Live
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Published
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
      Awaiting approval
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Low Stock
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Inventory alerts
    </div>
  </div>
</div>
<div className="card panel">
  <div className="toolbar">
    <input className="input search" placeholder="Search products" />
    <div className="filters">
      <select className="select">
        <option>
          All categories
        </option>
        <option>
          Flour
        </option>
        <option>
          Coming Soon
        </option>
      </select>
      <select className="select">
        <option>
          All status
        </option>
        <option>
          Live
        </option>
        <option>
          Draft
        </option>
        <option>
          Pending
        </option>
      </select>
    </div>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Product
          </th>
          <th>
            Supplier
          </th>
          <th>
            Category
          </th>
          <th>
            Price
          </th>
          <th>
            Stock
          </th>
          <th>
            Status
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              Product data loads here
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
            —
          </td>
          <td>
            <span className="status gray">
              Backend data
            </span>
          </td>
          <td>
            <Link className="mini-btn" to="#">
              Manage
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

export default function AdminProducts() {
  return (
    <AdminLayout activePath="/admin/products" title="Products" subtitle="Marketplace catalog management">
      <PageContent />
    </AdminLayout>
  );
}