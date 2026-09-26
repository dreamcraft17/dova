import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      INVENTORY CONTROL
    </div>
    <h1>
      Inventory
    </h1>
    <p className="lead">
      Monitor stock, low-stock alerts, product availability and supplier inventory signals across the marketplace.
    </p>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      SKUs
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Catalog inventory
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
      Needs attention
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Out of Stock
    </div>
    <div className="stat-value">
      —
    </div>
    <div className="stat-note">
      Unavailable
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Stock Value
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Backend calculated
    </div>
  </div>
</div>
<div className="card panel">
  <div className="toolbar">
    <input className="input search" placeholder="Search SKU or product" />
    <div className="filters">
      <select className="select">
        <option>
          All stock states
        </option>
        <option>
          Healthy
        </option>
        <option>
          Low
        </option>
        <option>
          Out
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
            SKU
          </th>
          <th>
            Supplier
          </th>
          <th>
            Available
          </th>
          <th>
            Reserved
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
              Inventory records load here
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

export default function AdminInventory() {
  return (
    <AdminLayout activePath="/admin/inventory" title="Inventory" subtitle="Stock & availability management">
      <PageContent />
    </AdminLayout>
  );
}