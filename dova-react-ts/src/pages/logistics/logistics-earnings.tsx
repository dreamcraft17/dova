import { Link } from 'react-router-dom';
import LogisticsLayout from '../../layouts/LogisticsLayout';

function PageContent() {
  return (
    <>
<div className="head">
  <div>
    <div className="eyebrow">
      FINANCIAL OVERVIEW
    </div>
    <h1>
      Earnings
    </h1>
    <p className="lead">
      See completed delivery earnings, payout status and transaction history. Amounts should be calculated by the DOVA backend.
    </p>
  </div>
</div>
<div className="grid stats">
  <div className="card stat">
    <div className="stat-label">
      Today
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Completed jobs
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      This Week
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Backend calculated
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      This Month
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Backend calculated
    </div>
  </div>
  <div className="card stat">
    <div className="stat-label">
      Pending Payout
    </div>
    <div className="stat-value">
      ₦ —
    </div>
    <div className="stat-note">
      Settlement status
    </div>
  </div>
</div>
<div className="grid two">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Payout History
      </h2>
    </div>
    <div className="table-wrap">
      <table className="table">
        <thead>
          <tr>
            <th>
              Date
            </th>
            <th>
              Reference
            </th>
            <th>
              Deliveries
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
              —
            </td>
            <td>
              —
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
        Payout Account
      </h2>
    </div>
    <div className="list">
      <div className="row">
        <div>
          <strong>
            Account holder
          </strong>
          <span>
            Backend profile data
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Bank
          </strong>
          <span>
            Backend profile data
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Account number
          </strong>
          <span>
            Backend profile data
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
      <div className="row">
        <div>
          <strong>
            Settlement schedule
          </strong>
          <span>
            Backend profile data
          </span>
        </div>
        <span className="status gray">
          —
        </span>
      </div>
    </div>
    <Link className="btn ghost" to="/logistics/profile" style={{"marginTop": "12px"}}>
      Manage Profile
    </Link>
  </section>
</div>
    </>
  );
}

export default function LogisticsEarnings() {
  return (
    <LogisticsLayout activePath="/logistics/earnings" title="Earnings" subtitle="Delivery earnings & payout history">
      <PageContent />
    </LogisticsLayout>
  );
}