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
      SUPPLIER ACCOUNT
    </div>
    <h1>
      Profile
    </h1>
    <p className="lead">
      Manage your supplier identity, contact information, farm/business details and payout information.
    </p>
  </div>
  <button className="btn btn-primary" onClick={() => showToast("Profile changes will save through your API.")}>
    Save Changes
  </button>
</div>
<div className="grid profile-grid">
  <section className="card profile-card">
    <div className="profile-avatar">
      DS
    </div>
    <div className="profile-name">
      Demo Supplier
    </div>
    <div className="profile-role">
      Farmer / Food Supplier
    </div>
    <div className="profile-meta">
      <div>
        <small>
          Supplier ID
        </small>
        <strong>
          SUP-001
        </strong>
      </div>
      <div>
        <small>
          Verification status
        </small>
        <strong>
          <span className="status pending">
            Verification pending
          </span>
        </strong>
      </div>
      <div>
        <small>
          Member since
        </small>
        <strong>
          —
        </strong>
      </div>
    </div>
  </section>
  <form onSubmit={handleSubmit} className="card form-card">
    <div className="form-grid">
      <div className="field">
        <label>
          Full Name *
        </label>
        <input value="Demo Supplier" name="fullName" />
      </div>
      <div className="field">
        <label>
          Phone Number *
        </label>
        <input name="phone" placeholder="+234 ..." />
      </div>
      <div className="field">
        <label>
          Email Address
        </label>
        <input type="email" name="email" placeholder="supplier@example.com" />
      </div>
      <div className="field">
        <label>
          Business / Farm Name
        </label>
        <input value="Green Valley" name="businessName" />
      </div>
      <div className="field">
        <label>
          Supplier Type
        </label>
        <select name="type">
          <option>
            Farmer
          </option>
          <option>
            Processor
          </option>
          <option>
            Food Supplier
          </option>
          <option>
            Business
          </option>
        </select>
      </div>
      <div className="field">
        <label>
          Primary Product Category
        </label>
        <select>
          <option>
            Flour
          </option>
          <option>
            Staples
          </option>
          <option>
            Vegetables
          </option>
          <option>
            Fruits
          </option>
          <option>
            Other
          </option>
        </select>
      </div>
      <div className="field full">
        <label>
          Farm / Business Address
        </label>
        <input name="address" placeholder="Full address" />
      </div>
      <div className="field">
        <label>
          State
        </label>
        <input name="state" placeholder="State" />
      </div>
      <div className="field">
        <label>
          LGA
        </label>
        <input name="lga" placeholder="LGA" />
      </div>
      <div className="field full">
        <label>
          About your farm / business
        </label>
        <textarea name="about" placeholder="Describe what you produce or supply and any relevant factual information."></textarea>
      </div>
    </div>
  </form>
</div>
<div className="grid" style={{"gridTemplateColumns": "repeat(2,1fr)", "marginTop": "15px"}}>
  <div className="card panel">
    <div className="panel-head">
      <h2>
        Verification Documents
      </h2>
    </div>
    <p className="lead" style={{"fontSize": "10px", "marginBottom": "13px"}}>
      Upload only documents requested by DOVA. Verification status should be controlled by the backend.
    </p>
    <button className="btn btn-light" onClick={() => showToast("Document upload connects to your secure storage endpoint.")}>
      Manage Documents
    </button>
  </div>
  <div className="card panel">
    <div className="panel-head">
      <h2>
        Payout Information
      </h2>
    </div>
    <p className="lead" style={{"fontSize": "10px", "marginBottom": "13px"}}>
      Bank or payout details should be securely stored and never exposed publicly.
    </p>
    <Link className="btn btn-light" to="/supplier/settings">
      Manage Payout Settings
    </Link>
  </div>
</div>
    </>
  );
}

export default function SupplierProfile() {
  return (
    <SupplierLayout activePath="/supplier/profile" title="Profile" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}