import { Link } from 'react-router-dom';
import { PortalUIProvider, Toast, usePortalUI } from '../../components/PortalUI';

function AdminIndexContent() {
  return (
<div style={{"maxWidth": "900px", "margin": "50px auto", "padding": "20px"}}>
  <div className="card panel">
    <div className="eyebrow">
      DOVA CHAIN
    </div>
    <h1>
      Admin HTML Pages
    </h1>
    <p className="lead">
      Standalone pages. Each page contains its own styling and can be opened directly.
    </p>
    <div className="grid cards-2" style={{"marginTop": "22px"}}>
      <Link className="btn btn-ghost" to="/admin" style={{"justifyContent": "flex-start"}}>
        Dashboard
      </Link>
      <Link className="btn btn-ghost" to="/admin/suppliers" style={{"justifyContent": "flex-start"}}>
        Suppliers
      </Link>
      <Link className="btn btn-ghost" to="/admin/supplier-detail" style={{"justifyContent": "flex-start"}}>
        Supplier Detail
      </Link>
      <Link className="btn btn-ghost" to="/admin/products" style={{"justifyContent": "flex-start"}}>
        Products
      </Link>
      <Link className="btn btn-ghost" to="/admin/bundles" style={{"justifyContent": "flex-start"}}>
        Bundles
      </Link>
      <Link className="btn btn-ghost" to="/admin/bundle-detail" style={{"justifyContent": "flex-start"}}>
        Bundle Detail
      </Link>
      <Link className="btn btn-ghost" to="/admin/orders" style={{"justifyContent": "flex-start"}}>
        Orders
      </Link>
      <Link className="btn btn-ghost" to="/admin/order-detail" style={{"justifyContent": "flex-start"}}>
        Order Detail
      </Link>
      <Link className="btn btn-ghost" to="/admin/logistics" style={{"justifyContent": "flex-start"}}>
        Logistics
      </Link>
      <Link className="btn btn-ghost" to="/admin/logistics-registration" style={{"justifyContent": "flex-start"}}>
        Logistics Registration
      </Link>
      <Link className="btn btn-ghost" to="/admin/users" style={{"justifyContent": "flex-start"}}>
        Users
      </Link>
      <Link className="btn btn-ghost" to="/admin/inventory" style={{"justifyContent": "flex-start"}}>
        Inventory
      </Link>
      <Link className="btn btn-ghost" to="/admin/finance" style={{"justifyContent": "flex-start"}}>
        Finance
      </Link>
      <Link className="btn btn-ghost" to="/admin/analytics" style={{"justifyContent": "flex-start"}}>
        Analytics
      </Link>
      <Link className="btn btn-ghost" to="/admin/monitoring" style={{"justifyContent": "flex-start"}}>
        Monitoring
      </Link>
      <Link className="btn btn-ghost" to="/admin/audit" style={{"justifyContent": "flex-start"}}>
        Audit
      </Link>
      <Link className="btn btn-ghost" to="/admin/contacts" style={{"justifyContent": "flex-start"}}>
        Contacts
      </Link>
      <Link className="btn btn-ghost" to="/admin/feedback" style={{"justifyContent": "flex-start"}}>
        Feedback
      </Link>
      <Link className="btn btn-ghost" to="/admin/settings" style={{"justifyContent": "flex-start"}}>
        Settings
      </Link>
    </div>
  </div>
</div>
  );
}

export default function AdminIndex() {
  return <PortalUIProvider><div className="admin-app">
    <AdminIndexContent />
    <Toast />
  </div></PortalUIProvider>;
}