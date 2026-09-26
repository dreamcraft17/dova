import { Link } from 'react-router-dom';
import StorefrontLayout from '../../layouts/StorefrontLayout';

function PageContent() {
  return (
    <>
<section className="hero">
  <div className="container hero-grid">
    <div>
      <div className="eyebrow">
        DOVA Bundles
      </div>
      <h1>
        Curated food combinations, built for simpler buying.
      </h1>
      <p>
        Bundles can combine complementary products once DOVA has enough live products. This page is ready for the bundle backend to populate real contents, pricing and availability.
      </p>
      <Link className="btn gold" to="#bundles" style={{"marginTop": "18px"}}>
        Explore Bundles
      </Link>
    </div>
    <div className="hero-art">
      <div className="flow">
        <b>
          SELECT
        </b>
        <span>
          →
        </span>
        <b>
          COMBINE
        </b>
        <span>
          →
        </span>
        <b>
          SAVE
        </b>
        <span>
          →
        </span>
        <b>
          DELIVER
        </b>
      </div>
    </div>
  </div>
</section>
<section className="section" id="bundles">
  <div className="container">
    <div className="section-head">
      <div>
        <div className="eyebrow">
          Bundle marketplace
        </div>
        <h2>
          Shop DOVA bundles
        </h2>
      </div>
      <p>
        Bundle cards use the same compact two-column mobile system as the marketplace.
      </p>
    </div>
    <div className="notice">
      Bundle contents, prices, savings and availability should come directly from the bundle API. The examples below are layout placeholders—not live offers.
    </div>
    <div className="grid2">
      <Link className="card" to="#">
        <div className="visual">
          <span className="badge">
            Bundle
          </span>
          <div className="pack">
            DOVA
            <br />
            FLOUR
            <br />
            STARTER
          </div>
        </div>
        <div className="body">
          <h3>
            Flour Starter Bundle
          </h3>
          <div className="meta">
            Bundle contents from backend
          </div>
          <div className="price">
            ₦ —
          </div>
          <span className="status">
            Configure live bundle
          </span>
        </div>
      </Link>
      <Link className="card" to="#">
        <div className="visual">
          <span className="badge">
            Coming Soon
          </span>
          <div className="pack">
            DOVA
            <br />
            HOME
            <br />
            BUNDLE
          </div>
        </div>
        <div className="body">
          <h3>
            Home Food Bundle
          </h3>
          <div className="meta">
            Future bundle category
          </div>
          <span className="status">
            Coming Soon
          </span>
        </div>
      </Link>
      <Link className="card" to="#">
        <div className="visual">
          <span className="badge">
            Coming Soon
          </span>
          <div className="pack">
            DOVA
            <br />
            BUSINESS
            <br />
            BUNDLE
          </div>
        </div>
        <div className="body">
          <h3>
            Business Supply Bundle
          </h3>
          <div className="meta">
            For restaurants & food businesses
          </div>
          <span className="status">
            Coming Soon
          </span>
        </div>
      </Link>
      <Link className="card" to="#">
        <div className="visual">
          <span className="badge">
            In Development
          </span>
          <div className="pack">
            DOVA
            <br />
            FAMILY
            <br />
            BUNDLE
          </div>
        </div>
        <div className="body">
          <h3>
            Family Food Bundle
          </h3>
          <div className="meta">
            Future bundle concept
          </div>
          <span className="status">
            In Development
          </span>
        </div>
      </Link>
    </div>
  </div>
</section>
<section className="section">
  <div className="container">
    <div className="steps">
      <div className="step">
        <b>
          01 · Choose
        </b>
        <span>
          Select a bundle.
        </span>
      </div>
      <div className="step">
        <b>
          02 · Confirm
        </b>
        <span>
          Review contents and price.
        </span>
      </div>
      <div className="step">
        <b>
          03 · Fulfill
        </b>
        <span>
          DOVA prepares the order.
        </span>
      </div>
      <div className="step">
        <b>
          04 · Receive
        </b>
        <span>
          Get your food products.
        </span>
      </div>
    </div>
  </div>
</section>
    </>
  );
}

export default function Bundles() { return <StorefrontLayout><PageContent /></StorefrontLayout>; }