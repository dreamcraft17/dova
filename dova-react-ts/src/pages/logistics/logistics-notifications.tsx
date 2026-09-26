import { usePortalUI } from '../../components/PortalUI';
import LogisticsLayout from '../../layouts/LogisticsLayout';

function PageContent() {
  const { showToast } = usePortalUI();
  return (
    <>
<div className="head">
  <div>
    <div className="eyebrow">
      DISPATCH COMMUNICATIONS
    </div>
    <h1>
      Notifications
    </h1>
    <p className="lead">
      Receive new assignments, pickup changes, customer updates, operational notices and payout notifications.
    </p>
  </div>
  <button className="btn ghost" onClick={() => showToast("Notification state will sync with backend.")}>
    Mark All Read
  </button>
</div>
<div className="card panel">
  <div className="list">
    <div className="row">
      <div className="row-main">
        <div className="thumb">
          01
        </div>
        <div>
          <strong>
            New delivery assignment
          </strong>
          <span>
            Notification content and timestamp load from backend.
          </span>
        </div>
      </div>
      <span className="status yellow">
        New
      </span>
    </div>
    <div className="row">
      <div className="row-main">
        <div className="thumb">
          02
        </div>
        <div>
          <strong>
            Pickup schedule changed
          </strong>
          <span>
            Notification content and timestamp load from backend.
          </span>
        </div>
      </div>
      <span className="status blue">
        Update
      </span>
    </div>
    <div className="row">
      <div className="row-main">
        <div className="thumb">
          03
        </div>
        <div>
          <strong>
            Customer delivery note
          </strong>
          <span>
            Notification content and timestamp load from backend.
          </span>
        </div>
      </div>
      <span className="status green">
        Info
      </span>
    </div>
    <div className="row">
      <div className="row-main">
        <div className="thumb">
          04
        </div>
        <div>
          <strong>
            Payout processed
          </strong>
          <span>
            Notification content and timestamp load from backend.
          </span>
        </div>
      </div>
      <span className="status gray">
        Finance
      </span>
    </div>
  </div>
</div>
    </>
  );
}

export default function LogisticsNotifications() {
  return (
    <LogisticsLayout activePath="/logistics/notifications" title="Notifications" subtitle="Delivery alerts & dispatch messages">
      <PageContent />
    </LogisticsLayout>
  );
}