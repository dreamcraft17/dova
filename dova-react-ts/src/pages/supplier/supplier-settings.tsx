import { usePortalUI } from '../../components/PortalUI';
import SupplierLayout from '../../layouts/SupplierLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      ACCOUNT SETTINGS
    </div>
    <h1>
      Settings
    </h1>
    <p className="lead">
      Manage notifications, security, payout preferences and supplier account controls.
    </p>
  </div>
</div>
<div className="grid" style={{"gridTemplateColumns": "1fr 1fr"}}>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Notifications
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div>
          <strong>
            New order alerts
          </strong>
          <span>
            Receive notifications when a customer places an order.
          </span>
        </div>
        <input type="checkbox" checked />
      </div>
      <div className="row">
        <div>
          <strong>
            Order status updates
          </strong>
          <span>
            Receive updates about fulfillment and order changes.
          </span>
        </div>
        <input type="checkbox" checked />
      </div>
      <div className="row">
        <div>
          <strong>
            Product approval
          </strong>
          <span>
            Know when a product is approved or requires changes.
          </span>
        </div>
        <input type="checkbox" checked />
      </div>
      <div className="row">
        <div>
          <strong>
            Marketing updates
          </strong>
          <span>
            Optional DOVA announcements.
          </span>
        </div>
        <input type="checkbox" />
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Security
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div>
          <strong>
            Password
          </strong>
          <span>
            Change your account password.
          </span>
        </div>
        <button className="btn btn-light" onClick={() => showToast("Password change connects to auth service.")}>
          Change
        </button>
      </div>
      <div className="row">
        <div>
          <strong>
            Sessions
          </strong>
          <span>
            Review signed-in devices.
          </span>
        </div>
        <button className="btn btn-light" onClick={() => showToast("Session management connects to auth service.")}>
          Review
        </button>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Payout Preferences
      </h2>
    </div>
    <p className="lead" style={{"fontSize": "10px", "marginBottom": "15px"}}>
      Keep payout information private and encrypted. Only authorized account services should access it.
    </p>
    <button className="btn btn-primary" onClick={() => showToast("Payout setup connects to secure backend.")}>
      Manage Payouts
    </button>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Account
      </h2>
    </div>
    <div className="actions">
      <button className="btn btn-light" onClick={() => showToast("Download/export connects to backend.")}>
        Export My Data
      </button>
      <button className="btn btn-danger" onClick={() => showToast("Account closure requires secure confirmation.")}>
        Request Account Closure
      </button>
    </div>
  </section>
</div>
    </>
  );
}

export default function SupplierSettings() {
  return (
    <SupplierLayout activePath="/supplier/settings" title="Settings" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}