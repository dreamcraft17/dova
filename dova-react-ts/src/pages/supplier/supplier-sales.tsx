import { Link } from 'react-router-dom';
import SupplierLayout from '../../layouts/SupplierLayout';

function PageContent() {
  return (
    <>
<div className="page-head">
  <div>
    <div className="eyebrow">
      SALES & PERFORMANCE
    </div>
    <h1>
      Sales & Analytics
    </h1>
    <p className="lead">
      Understand product sales, order volume, revenue and marketplace performance over time.
    </p>
  </div>
  <select className="filter" style={{"height": "38px"}}>
    <option>
      Last 30 days
    </option>
    <option>
      Last 7 days
    </option>
    <option>
      This month
    </option>
    <option>
      This year
    </option>
  </select>
</div>
<div className="grid kpi-grid">
  <div className="card kpi">
    <h3>
      Gross Sales
    </h3>
    <strong>
      ₦ —
    </strong>
    <span className="stat-note">
      Backend calculated
    </span>
  </div>
  <div className="card kpi">
    <h3>
      Units Sold
    </h3>
    <strong>
      —
    </strong>
    <span className="stat-note">
      All listed products
    </span>
  </div>
  <div className="card kpi">
    <h3>
      Average Order Value
    </h3>
    <strong>
      ₦ —
    </strong>
    <span className="stat-note">
      Based on completed orders
    </span>
  </div>
</div>
<div className="grid dashboard-grid">
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Sales Trend
      </h2>
    </div>
    <div className="chart">
      <div className="chart-grid"></div>
      <div className="chart-line"></div>
    </div>
  </section>
  <section className="card panel">
    <div className="panel-head">
      <h2>
        Fulfillment
      </h2>
    </div>
    <div style={{"display": "grid", "gap": "14px"}}>
      <div>
        <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "10px", "marginBottom": "6px"}}>
          <strong>
            Completed
          </strong>
          <span>
            —
          </span>
        </div>
        <div className="progress">
          <span style={{"width": "72%"}}></span>
        </div>
      </div>
      <div>
        <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "10px", "marginBottom": "6px"}}>
          <strong>
            Processing
          </strong>
          <span>
            —
          </span>
        </div>
        <div className="progress">
          <span style={{"width": "40%"}}></span>
        </div>
      </div>
      <div>
        <div style={{"display": "flex", "justifyContent": "space-between", "fontSize": "10px", "marginBottom": "6px"}}>
          <strong>
            Cancelled
          </strong>
          <span>
            —
          </span>
        </div>
        <div className="progress">
          <span style={{"width": "12%"}}></span>
        </div>
      </div>
    </div>
  </section>
</div>
<div className="card panel">
  <div className="panel-head">
    <h2>
      Product Sales
    </h2>
    <Link to="/supplier/products">
      Catalog →
    </Link>
  </div>
  <div className="table-wrap">
    <table className="table">
      <thead>
        <tr>
          <th>
            Product
          </th>
          <th>
            Units Sold
          </th>
          <th>
            Orders
          </th>
          <th>
            Sales
          </th>
          <th>
            Stock
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>
              Plantain Flour
            </strong>
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
            —
          </td>
        </tr>
        <tr>
          <td>
            <strong>
              Other products
            </strong>
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
            —
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
    </>
  );
}

export default function SupplierSales() {
  return (
    <SupplierLayout activePath="/supplier/sales" title="Sales & Analytics" subtitle="DOVA Supplier Dashboard">
      <PageContent />
    </SupplierLayout>
  );
}