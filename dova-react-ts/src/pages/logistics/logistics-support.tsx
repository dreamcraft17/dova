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
      DELIVERY SUPPORT
    </div>
    <h1>
      Support
    </h1>
    <p className="lead">
      Get help with an order, pickup, customer delivery, account issue or operational emergency.
    </p>
  </div>
</div>
<div className="grid three">
  <section className="card panel">
    <div className="thumb" style={{"width": "50px", "height": "50px"}}>
      01
    </div>
    <h2 style={{"color": "var(--deep)", "fontSize": "17px"}}>
      Order Support
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.6"}}>
      Report missing products, wrong packages, pickup problems or customer delivery issues.
    </p>
    <button className="btn ghost" onClick={() => showToast("Order support ticket will connect to DOVA operations.")}>
      Report Issue
    </button>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "50px", "height": "50px"}}>
      02
    </div>
    <h2 style={{"color": "var(--deep)", "fontSize": "17px"}}>
      Emergency
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.6"}}>
      Provide a fast escalation path for safety, vehicle or delivery emergencies.
    </p>
    <button className="btn gold" onClick={() => showToast("Emergency escalation will notify the configured DOVA operations team.")}>
      Contact Operations
    </button>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "50px", "height": "50px"}}>
      03
    </div>
    <h2 style={{"color": "var(--deep)", "fontSize": "17px"}}>
      Account Help
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.6"}}>
      Get assistance with login, profile verification, payout information or account access.
    </p>
    <button className="btn ghost" onClick={() => showToast("Account support ticket will connect to backend.")}>
      Get Help
    </button>
  </section>
</div>
<section className="card panel" style={{"marginTop": "18px"}}>
  <div className="panel-head">
    <h2>
      Submit a Support Ticket
    </h2>
  </div>
  <form onSubmit={handleSubmit}>
    <div className="form-grid">
      <div className="field">
        <label>
          Issue type
        </label>
        <select className="select">
          <option>
            Select issue
          </option>
          <option>
            Order
          </option>
          <option>
            Pickup
          </option>
          <option>
            Customer
          </option>
          <option>
            Vehicle
          </option>
          <option>
            Account
          </option>
          <option>
            Payment
          </option>
        </select>
      </div>
      <div className="field">
        <label>
          Order ID
        </label>
        <input className="input" placeholder="#DOVA-" />
      </div>
      <div className="field full">
        <label>
          Description
        </label>
        <textarea className="textarea" placeholder="Describe what happened..."></textarea>
      </div>
    </div>
    <div style={{"display": "flex", "justifyContent": "flex-end", "marginTop": "16px"}}>
      <button className="btn primary">
        Submit Ticket
      </button>
    </div>
  </form>
</section>
    </>
  );
}

export default function LogisticsSupport() {
  return (
    <LogisticsLayout activePath="/logistics/support" title="Support" subtitle="DOVA delivery operations support">
      <PageContent />
    </LogisticsLayout>
  );
}