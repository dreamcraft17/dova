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
      SUPPLIER SUPPORT
    </div>
    <h1>
      Feedback
    </h1>
    <p className="lead">
      Send feedback, report a problem or share an idea that can improve your experience on DOVA.
    </p>
  </div>
</div>
<div className="grid" style={{"gridTemplateColumns": "1fr .75fr"}}>
  <form onSubmit={handleSubmit} className="card form-card">
    <div className="form-grid">
      <div className="field">
        <label>
          Feedback Type *
        </label>
        <select>
          <option>
            General feedback
          </option>
          <option>
            Product issue
          </option>
          <option>
            Order issue
          </option>
          <option>
            Payment / payout
          </option>
          <option>
            Technical problem
          </option>
          <option>
            Suggestion
          </option>
        </select>
      </div>
      <div className="field">
        <label>
          Related Order ID
        </label>
        <input placeholder="Optional" />
      </div>
      <div className="field full">
        <label>
          Subject *
        </label>
        <input placeholder="Briefly describe your feedback" />
      </div>
      <div className="field full">
        <label>
          Message *
        </label>
        <textarea placeholder="Tell DOVA what happened or what you would like improved."></textarea>
      </div>
      <div className="field full">
        <label>
          Attachment
        </label>
        <div className="upload">
          <strong>
            Add a screenshot or document
          </strong>
          <span>
            Optional. Connect this control to your secure upload service.
          </span>
          <button type="button" className="btn btn-light" onClick={() => showToast("Connect to upload endpoint.")}>
            Choose File
          </button>
        </div>
      </div>
    </div>
    <div style={{"display": "flex", "justifyContent": "flex-end", "marginTop": "20px"}}>
      <button className="btn btn-primary">
        Send Feedback
      </button>
    </div>
  </form>
  <div className="card panel">
    <div className="panel-head">
      <h2>
        Support Topics
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div>
          <strong>
            Products
          </strong>
          <span>
            Listing, editing, stock and approval
          </span>
        </div>
        <span>
          →
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Orders
          </strong>
          <span>
            Order status and fulfillment
          </span>
        </div>
        <span>
          →
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Payouts
          </strong>
          <span>
            Settlement and account information
          </span>
        </div>
        <span>
          →
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Technical
          </strong>
          <span>
            Account or platform problems
          </span>
        </div>
        <span>
          →
        </span>
      </div>
    </div>
  </div>
</div>
    </>
  );
}

export default function SupplierFeedback() {
  return (
    <SupplierLayout activePath="/supplier/feedback" title="Feedback" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}