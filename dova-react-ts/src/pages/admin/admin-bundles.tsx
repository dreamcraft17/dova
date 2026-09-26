import { Link } from 'react-router-dom';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      BUNDLE MANAGEMENT
    </div>
    <h1>
      Bundles
    </h1>
    <p className="lead">
      Create and manage curated food bundles, their products, pricing rules, availability and visibility.
    </p>
  </div>
  <div className="actions">
    <Link className="btn btn-gold" to="/admin/bundle-detail">
      + Create Bundle
    </Link>
  </div>
</div>
<div className="grid cards-3">
  <section className="card panel">
    <div className="thumb" style={{"width": "52px", "height": "52px", "fontSize": "13px"}}>
      FLR
    </div>
    <h2 style={{"margin": "14px 0 5px", "fontSize": "17px", "color": "var(--deep)"}}>
      Flour Starter Bundle
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Bundle products, pricing and stock will be loaded from the backend.
    </p>
    <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginTop": "16px"}}>
      <span className="status gray">
        Not populated
      </span>
      <Link className="mini-btn" to="/admin/bundle-detail">
        Manage
      </Link>
    </div>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "52px", "height": "52px", "fontSize": "13px"}}>
      HOM
    </div>
    <h2 style={{"margin": "14px 0 5px", "fontSize": "17px", "color": "var(--deep)"}}>
      Home Food Bundle
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Bundle products, pricing and stock will be loaded from the backend.
    </p>
    <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginTop": "16px"}}>
      <span className="status gray">
        Not populated
      </span>
      <Link className="mini-btn" to="/admin/bundle-detail">
        Manage
      </Link>
    </div>
  </section>
  <section className="card panel">
    <div className="thumb" style={{"width": "52px", "height": "52px", "fontSize": "13px"}}>
      BUS
    </div>
    <h2 style={{"margin": "14px 0 5px", "fontSize": "17px", "color": "var(--deep)"}}>
      Business Supply Bundle
    </h2>
    <p style={{"fontSize": "11px", "color": "var(--muted)", "lineHeight": "1.5"}}>
      Bundle products, pricing and stock will be loaded from the backend.
    </p>
    <div style={{"display": "flex", "justifyContent": "space-between", "alignItems": "center", "marginTop": "16px"}}>
      <span className="status gray">
        Not populated
      </span>
      <Link className="mini-btn" to="/admin/bundle-detail">
        Manage
      </Link>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminBundles() {
  return (
    <AdminLayout activePath="/admin/bundles" title="Bundles" subtitle="Bundle catalog management">
      <PageContent />
    </AdminLayout>
  );
}