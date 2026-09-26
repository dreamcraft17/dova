import { usePortalUI } from '../../components/PortalUI';
import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      SUPPLIER PROFILE
    </div>
    <h1>
      Supplier Details
    </h1>
    <p className="lead">
      Backend-loaded supplier identity, verification documents, products, orders and operational history.
    </p>
  </div>
  <div className="actions">
    <button className="btn btn-gold" onClick={() => showToast("Verification action ready for backend.")}>
      Verify Supplier
    </button>
  </div>
</div>
<div className="detail-grid">
  <section className="card panel">
    <div className="row-main" style={{"marginBottom": "18px"}}>
      <div className="thumb" style={{"width": "58px", "height": "58px"}}>
        SUP
      </div>
      <div>
        <h2 style={{"margin": "0", "color": "var(--deep)"}}>
          Supplier —
        </h2>
        <span style={{"color": "var(--muted)", "fontSize": "11px"}}>
          Supplier ID: —
        </span>
      </div>
    </div>
    <div className="grid cards-2">
      <div className="card kpi">
        <small>
          Location
        </small>
        <strong>
          —
        </strong>
      </div>
      <div className="card kpi">
        <small>
          Products
        </small>
        <strong>
          —
        </strong>
      </div>
      <div className="card kpi">
        <small>
          Orders
        </small>
        <strong>
          —
        </strong>
      </div>
      <div className="card kpi">
        <small>
          Status
        </small>
        <strong>
          —
        </strong>
      </div>
    </div>
    <div style={{"marginTop": "18px"}}>
      <h2 style={{"fontSize": "15px"}}>
        Supplier Information
      </h2>
      <div className="table-wrap">
        <table className="table">
          <tbody>
            <tr>
              <td>
                Full name / business
              </td>
              <td>
                —
              </td>
            </tr>
            <tr>
              <td>
                Phone
              </td>
              <td>
                —
              </td>
            </tr>
            <tr>
              <td>
                Email
              </td>
              <td>
                —
              </td>
            </tr>
            <tr>
              <td>
                Operating area
              </td>
              <td>
                —
              </td>
            </tr>
            <tr>
              <td>
                Verification documents
              </td>
              <td>
                Backend document links
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Verification Timeline
      </h2>
      <span className="status yellow">
        Pending data
      </span>
    </div>
    <div className="timeline">
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Registration received
          </strong>
          <p>
            Backend event will appear here.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Documents reviewed
          </strong>
          <p>
            Backend event will appear here.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Supplier approved
          </strong>
          <p>
            Backend event will appear here.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            Products reviewed
          </strong>
          <p>
            Backend event will appear here.
          </p>
        </div>
      </div>
      <div className="timeline-item">
        <span className="dot"></span>
        <div>
          <strong>
            First order fulfilled
          </strong>
          <p>
            Backend event will appear here.
          </p>
        </div>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminSupplierDetail() {
  return (
    <AdminLayout activePath="/admin/suppliers" title="Supplier Details" subtitle="Supplier verification & operations">
      <PageContent />
    </AdminLayout>
  );
}