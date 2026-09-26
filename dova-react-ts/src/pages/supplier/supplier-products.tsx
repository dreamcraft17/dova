import { Link } from 'react-router-dom';
import { usePortalUI } from '../../components/PortalUI';
import SupplierLayout from '../../layouts/SupplierLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      YOUR CATALOG
    </div>
    <h1>
      My Products
    </h1>
    <p className="lead">
      View, manage and monitor every product you have listed on DOVA Chain.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-primary" to="/supplier/add-product">
      ＋ Add Product
    </Link>
  </div>
</div>
<div className="card panel" style={{"marginBottom": "15px"}}>
  <div className="searchbar">
    <input id="productSearch" placeholder="Search your products..." />
    <select className="filter">
      <option>
        All status
      </option>
      <option>
        Available
      </option>
      <option>
        Out of stock
      </option>
      <option>
        Draft
      </option>
    </select>
    <button className="btn btn-light" onClick={() => showToast("Filters will connect to the product API.")}>
      Filter
    </button>
  </div>
</div>
<div className="grid product-grid">
  <article className="card product-card">
    <div className="product-img">
      <span>
        Product Image
      </span>
    </div>
    <div className="product-body">
      <small>
        Flour
      </small>
      <h3>
        Plantain Flour
      </h3>
      <p>
        Pack size: — · Stock: —
      </p>
      <div className="product-foot">
        <strong>
          ₦ —
        </strong>
        <span className="status available">
          Available
        </span>
      </div>
    </div>
  </article>
  <article className="card product-card">
    <div className="product-img">
      <span>
        Product Image
      </span>
    </div>
    <div className="product-body">
      <small>
        Product
      </small>
      <h3>
        Product Name
      </h3>
      <p>
        Pack size: — · Stock: —
      </p>
      <div className="product-foot">
        <strong>
          ₦ —
        </strong>
        <span className="status pending">
          Pending
        </span>
      </div>
    </div>
  </article>
  <article className="card product-card">
    <div className="product-img">
      <span>
        Product Image
      </span>
    </div>
    <div className="product-body">
      <small>
        Product
      </small>
      <h3>
        Product Name
      </h3>
      <p>
        Pack size: — · Stock: —
      </p>
      <div className="product-foot">
        <strong>
          ₦ —
        </strong>
        <span className="status available">
          Available
        </span>
      </div>
    </div>
  </article>
  <article className="card product-card">
    <div className="product-img">
      <span>
        Product Image
      </span>
    </div>
    <div className="product-body">
      <small>
        Product
      </small>
      <h3>
        Product Name
      </h3>
      <p>
        Pack size: — · Stock: —
      </p>
      <div className="product-foot">
        <strong>
          ₦ —
        </strong>
        <span className="status pending">
          Draft
        </span>
      </div>
    </div>
  </article>
</div>
<div className="card panel" style={{"marginTop": "15px"}}>
  <div className="panel-head">
    <h2>
      Product Management
    </h2>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Product
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
          <th>
            Updated
          </th>
          <th>
            Action
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              Plantain Flour
            </strong>
          </td>
          <td>
            ₦ —
          </td>
          <td>
            —
          </td>
          <td>
            <span className="status available">
              Available
            </span>
          </td>
          <td>
            —
          </td>
          <td>
            <Link className="btn btn-light" to="/supplier/add-product?edit=product-001">
              Edit
            </Link>
          </td>
        </tr>
        <tr>
          <td>
            <strong>
              Other Product
            </strong>
          </td>
          <td>
            ₦ —
          </td>
          <td>
            —
          </td>
          <td>
            <span className="status pending">
              Pending
            </span>
          </td>
          <td>
            —
          </td>
          <td>
            <Link className="btn btn-light" to="/supplier/add-product?edit=product-002">
              Edit
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

export default function SupplierProducts() {
  return (
    <SupplierLayout activePath="/supplier/products" title="My Products" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}