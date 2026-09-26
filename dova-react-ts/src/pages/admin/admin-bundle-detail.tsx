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
      BUNDLE BUILDER
    </div>
    <h1>
      Bundle Details
    </h1>
    <p className="lead">
      Define the products inside a bundle, quantities, pricing, stock rules and storefront visibility.
    </p>
  </div>
  <div className="actions">
    <button className="btn btn-gold" onClick={() => showToast("Bundle save will connect to the backend.")}>
      Save Bundle
    </button>
  </div>
</div>
<div className="detail-grid">
  <section className="card panel">
    <div className="form-grid">
      <div className="field">
        <label>
          Bundle name
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="e.g. Flour Starter Bundle" />
      </div>
      <div className="field">
        <label>
          Status
        </label>
        <select className="select" style={{"width": "100%"}}>
          <option>
            Draft
          </option>
          <option>
            Live
          </option>
          <option>
            Paused
          </option>
        </select>
      </div>
      <div className="field full">
        <label>
          Description
        </label>
        <textarea className="textarea" placeholder="Bundle description"></textarea>
      </div>
      <div className="field">
        <label>
          Bundle price
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="\u20a6 \u2014" />
      </div>
      <div className="field">
        <label>
          Availability
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="Backend inventory rule" />
      </div>
    </div>
    <div style={{"marginTop": "22px"}}>
      <div className="panel-head">
        <h2>
          Products in Bundle
        </h2>
        <button className="btn btn-ghost" onClick={() => showToast("Product picker will connect to catalog API.")}>
          + Add Product
        </button>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>
                Product
              </th>
              <th>
                Pack size
              </th>
              <th>
                Qty
              </th>
              <th>
                Price
              </th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>
                  Product selected from catalog
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
                <button className="mini-btn" onClick={() => showToast("Remove will connect to bundle API.")}>
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Bundle Preview
      </h2>
      <span className="status gray">
        Preview
      </span>
    </div>
    <div className="callout">
      <h3>
        Flour Starter Bundle
      </h3>
      <p>
        Storefront preview will show the selected bundle products, quantities, price, savings and availability.
      </p>
      <Link className="btn btn-gold" to="/admin/bundles">
        Back to Bundles
      </Link>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminBundleDetail() {
  return (
    <AdminLayout activePath="/admin/bundles" title="Bundle Details" subtitle="Bundle configuration">
      <PageContent />
    </AdminLayout>
  );
}