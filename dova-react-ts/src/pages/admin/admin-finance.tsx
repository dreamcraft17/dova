import AdminLayout from '../../layouts/AdminLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      FINANCIAL CONTROL
    </div>
    <h1>
      Finance & Payouts
    </h1>
    <p className="lead">
      Monitor customer payments, supplier settlements, logistics payouts, refunds and payment exceptions.
    </p>
  </div>
</div>
<div className="grid cards-4">
  <div className="card kpi">
    <small>
      Gross Sales
    </small>
    <strong>
      ₦ —
    </strong>
    <div className="delta">
      Backend calculated
    </div>
  </div>
  <div className="card kpi">
    <small>
      Supplier Payouts
    </small>
    <strong>
      ₦ —
    </strong>
    <div className="delta">
      Backend calculated
    </div>
  </div>
  <div className="card kpi">
    <small>
      Logistics Payouts
    </small>
    <strong>
      ₦ —
    </strong>
    <div className="delta">
      Backend calculated
    </div>
  </div>
  <div className="card kpi">
    <small>
      Refunds
    </small>
    <strong>
      ₦ —
    </strong>
    <div className="delta">
      Backend calculated
    </div>
  </div>
</div>
<div className="grid dashboard" style={{"marginTop": "18px"}}>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Payment Ledger
      </h2>
      <span className="status gray">
        Live backend data
      </span>
    </div>
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>
              Reference
            </th>
            <th>
              Order
            </th>
            <th>
              Type
            </th>
            <th>
              Amount
            </th>
            <th>
              Status
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              —
            </td>
            <td>
              #DOVA-—
            </td>
            <td>
              Customer payment
            </td>
            <td>
              ₦ —
            </td>
            <td>
              <span className="status gray">
                Backend
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Exceptions
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            RF
          </div>
          <div>
            <strong>
              Refund review
            </strong>
            <span>
              Backend queue
            </span>
          </div>
        </div>
        <span className="status yellow">
          Review
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            PO
          </div>
          <div>
            <strong>
              Payout exception
            </strong>
            <span>
              Backend queue
            </span>
          </div>
        </div>
        <span className="status red">
          Check
        </span>
      </div>
      <div className="row">
        <div className="row-main">
          <div className="thumb">
            PM
          </div>
          <div>
            <strong>
              Payment mismatch
            </strong>
            <span>
              Backend queue
            </span>
          </div>
        </div>
        <span className="status blue">
          Monitor
        </span>
      </div>
    </div>
  </section>
</div>
    </>
  );
}

export default function AdminFinance() {
  return (
    <AdminLayout activePath="/admin/finance" title="Finance & Payouts" subtitle="Payments, settlements & refunds">
      <PageContent />
    </AdminLayout>
  );
}