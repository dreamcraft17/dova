import { Link } from 'react-router-dom';
import { PortalUIProvider, Toast, usePortalUI } from '../../components/PortalUI';

function LogisticsIndexContent() {
  return (
<div style={{"maxWidth": "950px", "margin": "45px auto", "padding": "18px"}}>
  <section className="card panel">
    <div className="eyebrow">
      DOVA CHAIN
    </div>
    <h1 style={{"color": "var(--deep)", "fontSize": "38px"}}>
      Logistics Partner Portal
    </h1>
    <p className="lead">
      Standalone HTML pages for the private DOVA delivery dashboard. Open the login first.
    </p>
    <div className="grid three" style={{"marginTop": "20px"}}>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/login">
        Login
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/dashboard">
        Dashboard
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/available">
        Available
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/active">
        Active
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/history">
        History
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/earnings">
        Earnings
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/notifications">
        Notifications
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/profile">
        Profile
      </Link>
      <Link className="btn ghost" style={{"justifyContent": "flex-start"}} to="/logistics/support">
        Support
      </Link>
    </div>
  </section>
</div>
  );
}

export default function LogisticsIndex() {
  return <PortalUIProvider><div className="logistics-app">
    <LogisticsIndexContent />
    <Toast />
  </div></PortalUIProvider>;
}