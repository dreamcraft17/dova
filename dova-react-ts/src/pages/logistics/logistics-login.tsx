import { Link } from 'react-router-dom';
import { PortalUIProvider, Toast, usePortalUI } from '../../components/PortalUI';
import type { FormEvent } from 'react';
import { submitPrototypeForm } from '../../services/mockApi';

function LogisticsLoginContent() {
  const { showToast } = usePortalUI();
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); await submitPrototypeForm(Object.fromEntries(new FormData(event.currentTarget).entries())); showToast('Form ready for backend/API integration.'); };
  return (
<div className="login-page">
  <section className="login-box">
    <div className="login-brand">
      <span className="brand-mark">
        D
      </span>
      <div>
        <strong style={{"color": "var(--deep)", "fontSize": "18px"}}>
          DOVA LOGISTICS
        </strong>
        <div style={{"fontSize": "10px", "color": "var(--muted)", "marginTop": "3px"}}>
          Delivery Partner Portal
        </div>
      </div>
    </div>
    <div className="eyebrow">
      AUTHORIZED ACCESS
    </div>
    <h1>
      Delivery Partner Login
    </h1>
    <p className="lead">
      Use the email and password issued by DOVA to access assigned deliveries, pickup information, customer delivery details and delivery status.
    </p>
    <form onSubmit={handleSubmit}>
      <div className="field" style={{"marginBottom": "14px"}}>
        <label>
          Email
        </label>
        <input className="input" type="email" placeholder="partner@example.com" required />
      </div>
      <div className="field">
        <label>
          Password
        </label>
        <input className="input" type="password" placeholder="Enter your password" required />
      </div>
      <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginTop": "12px", "fontSize": "10px", "color": "var(--muted)"}}>
        <label>
          <input type="checkbox" />
          Remember this device
        </label>
        <Link to="#" onClick={() => showToast("Password reset will connect to the backend.")} style={{"color": "var(--emerald)", "fontWeight": "900"}}>
          Forgot password?
        </Link>
      </div>
      <button className="btn primary" style={{"width": "100%", "marginTop": "20px"}}>
        Sign In
      </button>
    </form>
    <div className="security-note">
      <strong>
        Private delivery portal.
      </strong>
      Customers and suppliers do not see this dashboard. Access, roles, sessions and permissions should be controlled by the backend.
    </div>
    <div style={{"textAlign": "center", "marginTop": "18px", "fontSize": "10px", "color": "var(--muted)"}}>
      <Link to="/logistics" style={{"color": "var(--emerald)", "fontWeight": "900"}}>
        ← Back to DOVA
      </Link>
    </div>
  </section>
</div>

  );
}

export default function LogisticsLogin() {
  return <PortalUIProvider><div className="logistics-app">
    <LogisticsLoginContent />
    <Toast />
  </div></PortalUIProvider>;
}