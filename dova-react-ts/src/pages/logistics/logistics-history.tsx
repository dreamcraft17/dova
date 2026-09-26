import LogisticsLayout from '../../layouts/LogisticsLayout';

function PageContent() {
  return (
    <>
<div className="head">
  <div>
    <div className="eyebrow">
      DELIVERY RECORD
    </div>
    <h1>
      Delivery History
    </h1>
    <p className="lead">
      A searchable history of deliveries completed by this logistics partner, including timestamps, status and earnings.
    </p>
  </div>
</div>
<div className="card panel">
  <div className="toolbar" style={{"display": "flex", "justifyContent": "space-between", "gap": "10px", "flexWrap": "wrap"}}>
    <input className="input" style={{"maxWidth": "330px"}} placeholder="Search order ID" />
    <div style={{"display": "flex", "gap": "8px"}}>
      <select className="select">
        <option>
          All statuses
        </option>
        <option>
          Delivered
        </option>
        <option>
          Cancelled
        </option>
        <option>
          Failed
        </option>
      </select>
      <select className="select">
        <option>
          Latest first
        </option>
        <option>
          Oldest first
        </option>
      </select>
    </div>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Order
          </th>
          <th>
            Pickup
          </th>
          <th>
            Drop-off
          </th>
          <th>
            Completed
          </th>
          <th>
            Status
          </th>
          <th>
            Earnings
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              #DOVA-—
            </strong>
          </td>
          <td>
            Supplier —
          </td>
          <td>
            Customer —
          </td>
          <td>
            —
          </td>
          <td>
            <span className="status gray">
              Backend
            </span>
          </td>
          <td>
            ₦ —
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </>
  );
}

export default function LogisticsHistory() {
  return (
    <LogisticsLayout activePath="/logistics/history" title="Delivery History" subtitle="Completed & past delivery jobs">
      <PageContent />
    </LogisticsLayout>
  );
}