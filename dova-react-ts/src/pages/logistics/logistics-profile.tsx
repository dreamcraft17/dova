import { usePortalUI } from '../../components/PortalUI';
import { submitPrototypeForm } from '../../services/mockApi';
import type { FormEvent } from 'react';
import LogisticsLayout from '../../layouts/LogisticsLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitPrototypeForm(Object.fromEntries(new FormData(event.currentTarget).entries()));
    showToast('Form ready for backend/API integration.');
  };
  return (
    <>
<div className="head">
  <div>
    <div className="eyebrow">
      ACCOUNT & VERIFICATION
    </div>
    <h1>
      My Profile
    </h1>
    <p className="lead">
      Manage the information DOVA needs to identify, verify and assign work to this logistics partner.
    </p>
  </div>
  <button className="btn gold" onClick={() => showToast("Profile changes will be saved through the backend.")}>
    Save Changes
  </button>
</div>
<section className="card profile-hero">
  <div className="big-avatar">
    DR
  </div>
  <div>
    <h2>
      Delivery Partner —
    </h2>
    <p>
      Partner ID: — • Verification status: backend controlled
    </p>
  </div>
</section>
<div className="grid two" style={{"marginTop": "18px"}}>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Personal / Business Details
      </h2>
    </div>
    <form onSubmit={handleSubmit}>
      <div className="form-grid">
        <div className="field">
          <label>
            Full name / company
          </label>
          <input className="input" placeholder="Backend profile" />
        </div>
        <div className="field">
          <label>
            Phone
          </label>
          <input className="input" placeholder="+234" />
        </div>
        <div className="field">
          <label>
            Email
          </label>
          <input className="input" placeholder="partner@example.com" />
        </div>
        <div className="field">
          <label>
            Operating location
          </label>
          <input className="input" placeholder="City / State" />
        </div>
        <div className="field">
          <label>
            Vehicle type
          </label>
          <select className="select">
            <option>
              Backend data
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
          </select>
        </div>
        <div className="field">
          <label>
            Vehicle registration
          </label>
          <input className="input" placeholder="Backend data" />
        </div>
      </div>
    </form>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Verification & Security
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div>
          <strong>
            Identity verification
          </strong>
          <span>
            Verification document status
          </span>
        </div>
        <span className="status yellow">
          Backend
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Vehicle verification
          </strong>
          <span>
            Vehicle document status
          </span>
        </div>
        <span className="status gray">
          Backend
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Account status
          </strong>
          <span>
            Access control status
          </span>
        </div>
        <span className="status green">
          Backend
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Password
          </strong>
          <span>
            Change through secure authentication
          </span>
        </div>
        <span className="status blue">
          Manage
        </span>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function LogisticsProfile() {
  return (
    <LogisticsLayout activePath="/logistics/profile" title="My Profile" subtitle="Delivery partner account">
      <PageContent />
    </LogisticsLayout>
  );
}