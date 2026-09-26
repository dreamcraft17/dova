import { Link } from 'react-router-dom';
import { usePortalUI } from '../../components/PortalUI';
import { submitPrototypeForm } from '../../services/mockApi';
import type { FormEvent } from 'react';
import SupplierLayout from '../../layouts/SupplierLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitPrototypeForm(Object.fromEntries(new FormData(event.currentTarget).entries()));
    showToast('Form ready for backend/API integration.');
  };
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      PRODUCT MANAGEMENT
    </div>
    <h1>
      Add Product
    </h1>
    <p className="lead">
      Create a complete product listing that can be reviewed and published to the DOVA marketplace.
    </p>
  </div>
  <Link className="btn btn-light" to="/supplier/products">
    ← My Products
  </Link>
</div>
<div className="alert alert-info">
  Product fields are structured for backend integration. Approval, availability and marketplace visibility should be controlled by the server.
</div>
<form onSubmit={handleSubmit} className="card form-card">
  <div className="form-grid">
    <div className="field">
      <label>
        Product Name *
      </label>
      <input name="name" placeholder="e.g. Plantain Flour" />
    </div>
    <div className="field">
      <label>
        Category *
      </label>
      <select name="category">
        <option>
          Select category
        </option>
        <option>
          Flour
        </option>
        <option>
          Grains
        </option>
        <option>
          Vegetables
        </option>
        <option>
          Fruits
        </option>
        <option>
          Oils
        </option>
        <option>
          Pantry
        </option>
        <option>
          Other
        </option>
      </select>
    </div>
    <div className="field">
      <label>
        Pack / Unit Size *
      </label>
      <input name="packSize" placeholder="e.g. 1kg" />
    </div>
    <div className="field">
      <label>
        Price (₦) *
      </label>
      <input name="price" type="number" min="0" placeholder="Enter current selling price" />
    </div>
    <div className="field">
      <label>
        Available Quantity *
      </label>
      <input name="stock" type="number" min="0" placeholder="Current stock" />
    </div>
    <div className="field">
      <label>
        SKU / Product Code
      </label>
      <input name="sku" placeholder="Optional \u2014 backend can generate this" />
    </div>
    <div className="field full">
      <label>
        Product Images
      </label>
      <div className="upload">
        <strong>
          Upload product images
        </strong>
        <span>
          Use clear images showing the actual product and packaging.
        </span>
        <button type="button" className="btn btn-light" onClick={() => showToast("Connect to your storage/upload endpoint.")}>
          Choose Images
        </button>
      </div>
    </div>
    <div className="field full">
      <label>
        Short Description *
      </label>
      <textarea name="shortDescription" placeholder="A concise description customers will see on the marketplace."></textarea>
    </div>
    <div className="field full">
      <label>
        Product Details
      </label>
      <textarea name="details" placeholder="Ingredients, preparation information, packaging details, sourcing information or other factual product information."></textarea>
    </div>
    <div className="field">
      <label>
        Availability
      </label>
      <select name="availability">
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
    </div>
    <div className="field">
      <label>
        Delivery / Fulfillment Notes
      </label>
      <input name="delivery" placeholder="Optional operational note" />
    </div>
  </div>
  <div style={{"display": "flex", "justifyContent": "flex-end", "gap": "8px", "marginTop": "22px"}}>
    <button type="button" className="btn btn-light" onClick={() => showToast("Draft saved when connected to backend.")}>
      Save Draft
    </button>
    <button className="btn btn-primary">
      Submit Product
    </button>
  </div>
</form>
    </>
  );
}

export default function AddProduct() {
  return (
    <SupplierLayout activePath="/supplier/add-product" title="Add Product" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}