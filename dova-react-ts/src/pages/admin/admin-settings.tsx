import { usePortalUI } from '../../components/PortalUI';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      CONTROL & CONFIGURATION
    </div>
    <h1>
      Settings
    </h1>
    <p className="lead">
      Configure administrative roles, marketplace rules, notifications, integrations, security and operational preferences.
    </p>
  </div>
</div>
<div className="grid cards-3">
  <section className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      01
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Admin Roles & Permissions
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Role-based access control for administrators, operators, finance and support.
    </p>
    <button className="btn btn-ghost" onClick={() => showToast("Settings section ready for backend connection.")}>
      Configure
    </button>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      02
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Marketplace Settings
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Categories, product approval, bundles, availability and storefront rules.
    </p>
    <button className="btn btn-ghost" onClick={() => showToast("Settings section ready for backend connection.")}>
      Configure
    </button>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      03
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Payments & Webhooks
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Payment provider keys, webhook verification and transaction settings.
    </p>
    <button className="btn btn-ghost" onClick={() => showToast("Settings section ready for backend connection.")}>
      Configure
    </button>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      04
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Notifications
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Email, SMS, WhatsApp and in-dashboard notification preferences.
    </p>
    <button className="btn btn-ghost" onClick={() => showToast("Settings section ready for backend connection.")}>
      Configure
    </button>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      05
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Security
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Sessions, password rules, 2FA, login alerts and access policies.
    </p>
    <button className="btn btn-ghost" onClick={() => showToast("Settings section ready for backend connection.")}>
      Configure
    </button>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "48px", "height": "48px"}}>
      06
    </div>
    <h2 style={{"fontSize": "16px", "margin": "13px 0 5px", "color": "var(--deep)"}}>
      Delivery Rules
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Zones, delivery slots, assignment rules and fulfillment settings.
    </p>
    <button className="btn btn-ghost" onClick={() => showToast("Settings section ready for backend connection.")}>
      Configure
    </button>
  </section>
</div>
    </>
  );
}

export default function AdminSettings() {
  return (
    <AdminLayout activePath="/admin/settings" title="Settings" subtitle="Administration, roles & integrations">
      <PageContent />
    </AdminLayout>
  );
}