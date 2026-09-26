import { usePortalUI } from '../../components/PortalUI';
import { submitPrototypeForm } from '../../services/mockApi';
import type { FormEvent } from 'react';
import AdminLayout from '../../layouts/AdminLayout';

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
      LOGISTICS NETWORK
    </div>
    <h1>
      Logistics Registration
    </h1>
    <p className="lead">
      Create the onboarding flow for riders and logistics companies before they can receive DOVA delivery assignments.
    </p>
  </div>
</div>
<section className="card panel">
  <form onSubmit={handleSubmit}>
    <div className="form-grid">
      <div className="field">
        <label>
          Full name / company name
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="Enter legal name" />
      </div>
      <div className="field">
        <label>
          Phone number
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="+234" />
      </div>
      <div className="field">
        <label>
          Email
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="name@example.com" />
      </div>
      <div className="field">
        <label>
          Vehicle type
        </label>
        <select className="select" style={{"width": "100%"}}>
          <option>
            Select vehicle
          </option>
          <option>
            Motorcycle
          </option>
          <option>
            Car
          </option>
          <option>
            Van
          </option>
          <option>
            Truck
          </option>
        </select>
      </div>
      <div className="field">
        <label>
          Vehicle registration
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="Registration number" />
      </div>
      <div className="field">
        <label>
          Operating location
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="City / state" />
      </div>
      <div className="field full">
        <label>
          Delivery zones
        </label>
        <input className="input" style={{"width": "100%"}} placeholder="Areas you can serve" />
      </div>
      <div className="field full">
        <label>
          Verification documents
        </label>
        <input className="input" type="file" style={{"width": "100%"}} />
      </div>
    </div>
    <div className="form-actions">
      <button className="btn btn-ghost" type="button" onClick={() => showToast("Draft saved locally in the prototype.")}>
        Save Draft
      </button>
      <button className="btn btn-primary">
        Submit Registration
      </button>
    </div>
  </form>
</section>
    </>
  );
}

export default function LogisticsRegistration() {
  return (
    <AdminLayout activePath="/admin/logistics" title="Logistics Registration" subtitle="Register logistics providers">
      <PageContent />
    </AdminLayout>
  );
}