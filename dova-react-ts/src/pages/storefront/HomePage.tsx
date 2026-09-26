import { useEffect, useState } from 'react';
import { HomeHeader } from '../../components/HomeHeader';
import { Link } from 'react-router-dom';

function HomeFooter() {
  return (
<footer>
  <div className="container">
    <div className="footer-grid">
      <div className="footer-brand">
        <Link className="brand" to="/">
          <span className="dova">
            DOVA
          </span>
          <span className="chain">
            CHAIN
          </span>
        </Link>
        <p>
          Building a technology-enabled food supply chain, starting with flour.
        </p>
      </div>
      <div>
        <div className="footer-title">
          Platform
        </div>
        <div className="footer-links">
          <Link to="/marketplace">
            Products
          </Link>
          <Link to="/bundles">
            Bundles
          </Link>
          <Link to="#how">
            How It Works
          </Link>
          <Link to="/chat">
            DOVA AI
          </Link>
          <Link to="#about">
            About Us
          </Link>
        </div>
      </div>
      <div>
        <div className="footer-title">
          Community
        </div>
        <div className="footer-links">
          <Link to="#farmers">
            For Farmers
          </Link>
          <Link to="/login">
            Customer Login
          </Link>
          <Link to="/register">
            Register
          </Link>
          <Link to="/feedback">
            Feedback
          </Link>
        </div>
      </div>
      <div>
        <div className="footer-title">
          Contact
        </div>
        <div className="footer-links">
          <a href="mailto:officialdovachain@gmail.com">
            officialdovachain@gmail.com
          </a>
          <a href="tel:+2349032696825">
            +234 903 269 6825
          </a>
          <span>
            Nigeria
          </span>
          <Link to="/contact">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
    <div className="footer-bottom">
      <span>
        © 2026 DOVA Chain. All rights reserved.
      </span>
      <span>
        From Farm to Table. On Time, Every Time.
      </span>
    </div>
  </div>
</footer>
  );
}

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('Featured');

  useEffect(() => {
    const elements = document.querySelectorAll('.home-app .reveal');
    if (!('IntersectionObserver' in window)) {
      elements.forEach((element) => element.classList.add('visible'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) entry.target.classList.add('visible');
      });
    }, { threshold: 0.12 });
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-app">
      <HomeHeader />
      <main>
<main>
  <section className="hero">
    <div className="container hero-grid">
      <div className="hero-copy reveal">
        <div className="eyebrow">
          African Food Supply Chain
        </div>
        <h1>
          Building a better
          <em>
            food supply chain.
          </em>
        </h1>
        <p>
          DOVA Chain connects trusted agricultural supply with consumers and businesses through sourcing, processing, quality verification and reliable delivery — starting with food flour.
        </p>
        <div className="hero-actions">
          <Link className="btn gold" to="/marketplace">
            Shop Products
            <span>
              ↗
            </span>
          </Link>
          <Link className="btn ghost" to="/auth/supplier-register">
            Join the DOVA Network
            <span>
              ↗
            </span>
          </Link>
        </div>
        <div className="hero-note">
          <span></span>
          Now: Plantain Flour · Next: More food categories · Future: Food infrastructure
        </div>
      </div>
      <div className="hero-visual reveal" aria-label="Agriculture and plantain flour visual">
        <div className="hero-photo">
          <img src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=82" alt="Fresh agricultural produce at a market" />
        </div>
        <div className="product-orbit">
          <div className="pack" aria-hidden="true"></div>
          <small>
            First commercial entry point
          </small>
          <strong>
            Plantain Flour
          </strong>
        </div>
        <div className="hero-badge">
          FARM → PROCESS → PACK → DELIVER
        </div>
      </div>
    </div>
  </section>
  <section className="supply-strip" aria-label="DOVA supply chain">
    <div className="container supply-row">
      <div className="supply-step">
        <span className="dot">
          01
        </span>
        Farmers
      </div>
      <div className="supply-arrow">
        →
      </div>
      <div className="supply-step">
        <span className="dot">
          02
        </span>
        Sourcing
      </div>
      <div className="supply-arrow">
        →
      </div>
      <div className="supply-step">
        <span className="dot">
          03
        </span>
        Processing
      </div>
      <div className="supply-arrow">
        →
      </div>
      <div className="supply-step">
        <span className="dot">
          04
        </span>
        Quality Check
      </div>
      <div className="supply-arrow">
        →
      </div>
      <div className="supply-step">
        <span className="dot">
          05
        </span>
        Packaging
      </div>
      <div className="supply-arrow">
        →
      </div>
      <div className="supply-step">
        <span className="dot">
          06
        </span>
        DOVA
      </div>
      <div className="supply-arrow">
        →
      </div>
      <div className="supply-step">
        <span className="dot">
          07
        </span>
        Logistics
      </div>
      <div className="supply-arrow">
        →
      </div>
      <div className="supply-step">
        <span className="dot">
          08
        </span>
        Customers
      </div>
    </div>
  </section>
  <section className="trust-band" aria-label="DOVA buying confidence">
    <div className="container trust-grid">
      <div className="trust-item">
        <div className="trust-icon">
          01
        </div>
        <div>
          <strong>
            Product clarity
          </strong>
          <span>
            Clear pack, price and availability information
          </span>
        </div>
      </div>
      <div className="trust-item">
        <div className="trust-icon">
          02
        </div>
        <div>
          <strong>
            Secure checkout
          </strong>
          <span>
            Designed around the existing payment flow
          </span>
        </div>
      </div>
      <div className="trust-item">
        <div className="trust-icon">
          03
        </div>
        <div>
          <strong>
            Quality focus
          </strong>
          <span>
            Built around better food sourcing and preparation
          </span>
        </div>
      </div>
      <div className="trust-item">
        <div className="trust-icon">
          04
        </div>
        <div>
          <strong>
            Customer support
          </strong>
          <span>
            A clear route to help before and after an order
          </span>
        </div>
      </div>
    </div>
  </section>
  <section className="section light">
    <div className="container">
      <div className="section-head reveal">
        <div className="eyebrow">
          The Challenge
        </div>
        <h2>
          Food supply should be simpler.
        </h2>
        <p>
          Farmers need dependable routes to buyers. Customers need dependable access to quality food. Businesses need reliable sourcing. DOVA is designed to connect these parts into one structured supply chain.
        </p>
      </div>
      <div className="cards-3">
        <article className="info-card reveal">
          <div className="index">
            01
          </div>
          <h3>
            Market access
          </h3>
          <p>
            Farmers can face difficulty reaching consistent buyers beyond their immediate markets.
          </p>
        </article>
        <article className="info-card reveal">
          <div className="index">
            02
          </div>
          <h3>
            Fragmented sourcing
          </h3>
          <p>
            Buyers may have to coordinate across multiple informal sources to find the products they need.
          </p>
        </article>
        <article className="info-card reveal">
          <div className="index">
            03
          </div>
          <h3>
            Fulfillment friction
          </h3>
          <p>
            Moving agricultural products from source to destination requires coordination across supply and logistics.
          </p>
        </article>
      </div>
    </div>
  </section>
  <section className="section process-section" id="how">
    <div className="container process-wrap">
      <div className="section-head reveal">
        <div className="eyebrow">
          The DOVA Solution
        </div>
        <h2>
          One connected path from farm to customer.
        </h2>
        <p>
          Source, verify, process, package and move food through a more organized path — with technology supporting the network.
        </p>
      </div>
      <div className="process-grid">
        <article className="process-item reveal">
          <span className="num">
            01
          </span>
          <h3>
            Farmer sourcing
          </h3>
          <p>
            Build supply around real demand.
          </p>
        </article>
        <article className="process-item reveal">
          <span className="num">
            02
          </span>
          <h3>
            Verification
          </h3>
          <p>
            Organize supplier information and checks.
          </p>
        </article>
        <article className="process-item reveal">
          <span className="num">
            03
          </span>
          <h3>
            Processing
          </h3>
          <p>
            Turn selected raw materials into food products.
          </p>
        </article>
        <article className="process-item reveal">
          <span className="num">
            04
          </span>
          <h3>
            Quality control
          </h3>
          <p>
            Keep quality information visible and structured.
          </p>
        </article>
        <article className="process-item reveal">
          <span className="num">
            05
          </span>
          <h3>
            Packaging
          </h3>
          <p>
            Prepare products for consumer and business orders.
          </p>
        </article>
        <article className="process-item reveal">
          <span className="num">
            06
          </span>
          <h3>
            Marketplace
          </h3>
          <p>
            Give customers one place to discover products.
          </p>
        </article>
        <article className="process-item reveal">
          <span className="num">
            07
          </span>
          <h3>
            Fulfillment
          </h3>
          <p>
            Coordinate pickup, delivery and order flow.
          </p>
        </article>
        <article className="process-item reveal">
          <span className="num">
            08
          </span>
          <h3>
            Customers
          </h3>
          <p>
            Serve households and business buyers.
          </p>
        </article>
      </div>
    </div>
  </section>
  <section className="order-strip" aria-label="Customer order journey">
    <div className="container order-row">
      <div className="order-intro">
        <strong>
          What happens after you order?
        </strong>
        <span>
          A simple customer journey from product selection to delivery.
        </span>
      </div>
      <div className="order-step">
        <b>
          01
        </b>
        Order
      </div>
      <div className="order-step">
        <b>
          02
        </b>
        Confirm
      </div>
      <div className="order-step">
        <b>
          03
        </b>
        Prepare
      </div>
      <div className="order-step">
        <b>
          04
        </b>
        Fulfill
      </div>
      <div className="order-step">
        <b>
          05
        </b>
        Receive
      </div>
    </div>
  </section>
  <section className="section">
    <div className="container flour-feature">
      <div className="flour-art reveal" aria-label="Plantain flour launch visual">
        <div className="flour-pack" aria-hidden="true">
          <div className="pack-inner">
            <span>
              FOOD FLOUR
            </span>
            <strong>
              PLANTAIN
              <br />
              FLOUR
            </strong>
            <div className="leaf">
              ✦
            </div>
            <span>
              DOVA CHAIN
            </span>
          </div>
        </div>
      </div>
      <div className="feature-copy reveal">
        <div className="eyebrow">
          Starting With Flour
        </div>
        <h2>
          Starting with Flour. Building for More.
        </h2>
        <p>
          Plantain flour is DOVA's focused first commercial entry point into a larger food supply chain. The strategy is simple: start with a clear product category, learn the operating loop, then expand the network around it.
        </p>
        <div className="feature-list">
          <div>
            <span>
              ✓
            </span>
            <div>
              <b>
                Plantain flour first
              </b>
              <br />
              <small>
                Our flagship launch category.
              </small>
            </div>
          </div>
          <div>
            <span>
              ✓
            </span>
            <div>
              <b>
                Focused catalog
              </b>
              <br />
              <small>
                More categories can be added as supply and operations develop.
              </small>
            </div>
          </div>
          <div>
            <span>
              ✓
            </span>
            <div>
              <b>
                Infrastructure around food
              </b>
              <br />
              <small>
                Sourcing, processing, packaging, marketplace and fulfillment form the larger system.
              </small>
            </div>
          </div>
        </div>
        <Link className="btn outline" to="/marketplace">
          Explore the DOVA Marketplace ↗
        </Link>
        <div className="feature-note">
          Launch status: product availability should always reflect the live DOVA catalog. Planned products are not presented as live inventory.
        </div>
      </div>
    </div>
  </section>
  <section className="section light" id="marketplace">
    <div className="container">
      <div className="section-head row reveal">
        <div className="copy">
          <div className="eyebrow">
            Marketplace
          </div>
          <h2>
            Start with Plantain Flour. Scale the catalog with purpose.
          </h2>
          <p>
            Plantain Flour is the starting commercial product. As DOVA grows, additional food categories can be introduced without losing a simple, fast shopping experience.
          </p>
        </div>
        <Link className="btn outline side-link" to="/marketplace">
          View Live Products ↗
        </Link>
      </div>
      <div className="market-toolbar" aria-label="Product categories">
        <button type="button" className={`filter-chip ${activeFilter === "Featured" ? "active" : ""}`} onClick={() => setActiveFilter("Featured")}>
          Featured
        </button>
        <button type="button" className={`filter-chip ${activeFilter === "Flour" ? "active" : ""}`} onClick={() => setActiveFilter("Flour")}>
          Flour
        </button>
        <button type="button" className={`filter-chip ${activeFilter === "Staples" ? "active" : ""}`} onClick={() => setActiveFilter("Staples")}>
          Staples
        </button>
        <button type="button" className={`filter-chip ${activeFilter === "Fresh Produce" ? "active" : ""}`} onClick={() => setActiveFilter("Fresh Produce")}>
          Fresh Produce
        </button>
        <button type="button" className={`filter-chip ${activeFilter === "Bundles" ? "active" : ""}`} onClick={() => setActiveFilter("Bundles")}>
          Bundles
        </button>
        <button type="button" className={`filter-chip ${activeFilter === "Coming Soon" ? "active" : ""}`} onClick={() => setActiveFilter("Coming Soon")}>
          Coming Soon
        </button>
      </div>
      <div className="catalog-grid">
        <article className="product-card reveal">
          <div className="product-image">
            <div className="mini-pack">
              <span>
                PLANTAIN
                <br />
                FLOUR
                <br />
                DOVA
              </span>
            </div>
            <span className="product-status pill live">
              Starting
            </span>
          </div>
          <div className="product-body">
            <div className="product-cat">
              Flour
            </div>
            <h3 className="product-name">
              Plantain Flour
            </h3>
            <div className="product-meta">
              <div>
                <div className="product-size">
                  Pack sizes • See product page
                </div>
                <div className="product-price">
                  View product
                </div>
              </div>
              <Link className="add-btn" to="/marketplace" aria-label="View plantain flour products">
                +
              </Link>
            </div>
          </div>
        </article>
        <article className="product-card reveal">
          <div className="product-image">
            <div className="mini-pack">
              <span>
                CASSAVA
                <br />
                FLOUR
              </span>
            </div>
            <span className="product-status pill soon">
              Soon
            </span>
          </div>
          <div className="product-body">
            <div className="product-cat">
              Flour
            </div>
            <h3 className="product-name">
              Cassava Flour
            </h3>
            <div className="product-meta">
              <div>
                <div className="product-size">
                  Expansion category
                </div>
                <div className="product-price">
                  Coming soon
                </div>
              </div>
              <button className="add-btn" type="button" aria-label="Cassava flour coming soon" disabled>
                +
              </button>
            </div>
          </div>
        </article>
        <article className="product-card reveal">
          <div className="product-image">
            <div className="mini-pack">
              <span>
                YAM
                <br />
                FLOUR
              </span>
            </div>
            <span className="product-status pill soon">
              Soon
            </span>
          </div>
          <div className="product-body">
            <div className="product-cat">
              Flour
            </div>
            <h3 className="product-name">
              Yam Flour
            </h3>
            <div className="product-meta">
              <div>
                <div className="product-size">
                  Expansion category
                </div>
                <div className="product-price">
                  Coming soon
                </div>
              </div>
              <button className="add-btn" type="button" aria-label="Yam flour coming soon" disabled>
                +
              </button>
            </div>
          </div>
        </article>
        <article className="product-card reveal">
          <div className="product-image">
            <img src="https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=78" alt="Plantains prepared for food processing" />
            <span className="product-status pill soon">
              Expansion
            </span>
          </div>
          <div className="product-body">
            <div className="product-cat">
              Farm products
            </div>
            <h3 className="product-name">
              More Food Products
            </h3>
            <div className="product-meta">
              <div>
                <div className="product-size">
                  Curated as supply grows
                </div>
                <div className="product-price">
                  Coming soon
                </div>
              </div>
              <button className="add-btn" type="button" aria-label="More food products coming soon" disabled>
                +
              </button>
            </div>
          </div>
        </article>
      </div>
      <p className="catalog-note">
        Only live product data should be displayed here. Plantain Flour is the current commercial focus; future categories remain clearly marked until they are actually launched.
      </p>
    </div>
  </section>
  <section className="section" id="farmers">
    <div className="container">
      <div className="section-head reveal">
        <div className="eyebrow">
          For Farmers
        </div>
        <h2>
          Better market access starts at the farm.
        </h2>
        <p>
          DOVA helps organize supply from farmers and connect it to real demand through a structured marketplace and supply-chain workflow.
        </p>
      </div>
      <div className="audience-grid">
        <article className="audience-card reveal">
          <h3>
            Join as a Farmer
          </h3>
          <p>
            Build a clearer route from what you grow to the people and businesses looking to buy food.
          </p>
          <div className="benefits">
            <div>
              <i>
                ✓
              </i>
              Market access
            </div>
            <div>
              <i>
                ✓
              </i>
              Supplier verification
            </div>
            <div>
              <i>
                ✓
              </i>
              Aggregation and processing pathways
            </div>
            <div>
              <i>
                ✓
              </i>
              Digital records
            </div>
            <div>
              <i>
                ✓
              </i>
              Future farmer services
            </div>
          </div>
          <Link className="btn outline" to="/auth/supplier-register">
            Become a DOVA Supplier ↗
          </Link>
        </article>
        <article className="audience-card dark-card reveal">
          <h3>
            For Customers & Businesses
          </h3>
          <p>
            Source food through one connected platform — from browsing and ordering to available fulfillment options.
          </p>
          <div className="benefits">
            <div>
              <i>
                01
              </i>
              Browse products
            </div>
            <div>
              <i>
                02
              </i>
              Order and pay
            </div>
            <div>
              <i>
                03
              </i>
              Receive through available fulfillment
            </div>
            <div>
              <i>
                04
              </i>
              Repeat or source in bulk as the catalog grows
            </div>
          </div>
          <Link className="btn gold" to="/marketplace">
            Source With DOVA ↗
          </Link>
        </article>
      </div>
    </div>
  </section>
  <section className="section dark" id="ai">
    <div className="container ai-grid">
      <div className="reveal">
        <div className="eyebrow">
          DOVA AI
        </div>
        <h2>
          Technology that supports the agricultural network.
        </h2>
        <p style={{"marginTop": "18px"}}>
          DOVA AI sits as a technology layer inside the wider ecosystem. Its agricultural role includes helping users explore crop questions and possible plant-health issues from images, while keeping the language appropriately cautious.
        </p>
        <div className="benefits" style={{"marginTop": "25px"}}>
          <div>
            <i>
              ✦
            </i>
            Crop and farming questions
          </div>
          <div>
            <i>
              ⌕
            </i>
            Photo-based plant issue assistance
          </div>
          <div>
            <i>
              ⌁
            </i>
            DOVA product and ecosystem guidance
          </div>
        </div>
        <Link className="btn gold" to="/chat">
          Explore DOVA AI ↗
        </Link>
      </div>
      <div className="ai-demo reveal">
        <div className="ai-screen">
          <div className="ai-top">
            <strong>
              🌿 DOVA AI
            </strong>
            <small>
              Agricultural Assistant
            </small>
          </div>
          <div className="bubble">
            <b>
              You
            </b>
            <br />
            What could be affecting these leaves?
          </div>
          <div className="bubble answer">
            <b>
              DOVA AI
            </b>
            <br />
            Upload a clear photo and I can help identify possible issues and suggest practical next steps.
          </div>
          <div className="ai-actions">
            <div className="ai-action">
              🌱 Crop Help
            </div>
            <div className="ai-action">
              📷 Scan Photo
            </div>
            <div className="ai-action">
              🌾 Farming Questions
            </div>
            <div className="ai-action">
              🧺 DOVA Products
            </div>
          </div>
          <div className="bubble" style={{"borderRadius": "999px", "color": "var(--muted)"}}>
            Ask DOVA AI anything…
          </div>
        </div>
      </div>
    </div>
  </section>
  <section className="section light">
    <div className="container">
      <div className="section-head reveal">
        <div className="eyebrow">
          Business Model
        </div>
        <h2>
          Build value layers around the food network.
        </h2>
        <p>
          DOVA can create value through the transactions and services that support sourcing, processing, fulfillment and future network capabilities.
        </p>
      </div>
      <div className="value-grid">
        <article className="value-card reveal">
          <div className="symbol">
            01
          </div>
          <h3>
            Marketplace revenue
          </h3>
          <p>
            Revenue associated with product transactions and platform services.
          </p>
        </article>
        <article className="value-card reveal">
          <div className="symbol">
            02
          </div>
          <h3>
            Processing & packaging
          </h3>
          <p>
            Value created by turning agricultural raw materials into market-ready food products.
          </p>
        </article>
        <article className="value-card reveal">
          <div className="symbol">
            03
          </div>
          <h3>
            Fulfillment & delivery
          </h3>
          <p>
            Coordinated movement of orders from supply points to customers.
          </p>
        </article>
        <article className="value-card reveal">
          <div className="symbol">
            04
          </div>
          <h3>
            Business supply
          </h3>
          <p>
            Repeat and bulk sourcing opportunities for restaurants, retailers and other buyers.
          </p>
        </article>
        <article className="value-card reveal">
          <div className="symbol">
            05
          </div>
          <h3>
            Farmer services
          </h3>
          <p>
            Future services around verification, aggregation, storage, data and market access.
          </p>
        </article>
        <article className="value-card reveal">
          <div className="symbol">
            06
          </div>
          <h3>
            Future partnerships
          </h3>
          <p>
            Potential licensed partnerships for financing, insurance and other agricultural services.
          </p>
        </article>
      </div>
      <div className="value-flow reveal">
        <span>
          Customers
        </span>
        <b>
          →
        </b>
        <span>
          Transactions
        </span>
        <b>
          →
        </b>
        <span className="active">
          DOVA Platform
        </span>
        <b>
          →
        </b>
        <span>
          Services
        </span>
        <b>
          →
        </b>
        <span>
          Revenue
        </span>
      </div>
    </div>
  </section>
  <section className="section light">
    <div className="container">
      <div className="section-head reveal">
        <div className="eyebrow">
          DOVA At A Glance
        </div>
        <h2>
          Focused enough to launch. Built enough to grow.
        </h2>
        <p>
          A concise view of where DOVA is starting today and the direction of the larger platform.
        </p>
      </div>
      <div className="glance-grid">
        <article className="glance-card reveal">
          <div className="label">
            Market
          </div>
          <strong>
            Nigeria
          </strong>
          <p>
            Starting locally, with a long-term African network in view.
          </p>
        </article>
        <article className="glance-card reveal">
          <div className="label">
            Launch category
          </div>
          <strong>
            Food Flour
          </strong>
          <p>
            Plantain Flour is the first commercial product focus.
          </p>
        </article>
        <article className="glance-card reveal">
          <div className="label">
            Platform
          </div>
          <strong>
            Food + Supply Chain
          </strong>
          <p>
            Marketplace, sourcing, processing, packaging and fulfillment.
          </p>
        </article>
        <article className="glance-card reveal">
          <div className="label">
            Long-term direction
          </div>
          <strong>
            Food Infrastructure
          </strong>
          <p>
            Expand from products into a broader connected food network.
          </p>
        </article>
      </div>
    </div>
  </section>
  <section className="section" id="roadmap">
    <div className="container">
      <div className="section-head reveal">
        <div className="eyebrow">
          Vision & Roadmap
        </div>
        <h2>
          Start with flour. Build the infrastructure around it.
        </h2>
        <p>
          Current, next and future capabilities are separated so planned infrastructure is not presented as already operational.
        </p>
      </div>
      <div className="roadmap-grid">
        <article className="road-card reveal">
          <div className="road-label">
            Now
          </div>
          <h3>
            Flour launch
          </h3>
          <p>
            Plantain flour, farmer sourcing, processing, packaging, marketplace and available fulfillment.
          </p>
        </article>
        <article className="road-card next reveal">
          <div className="road-label">
            Next
          </div>
          <h3>
            Supply expansion
          </h3>
          <p>
            More flour categories, more farmers, more food products, aggregation and stronger business supply.
          </p>
        </article>
        <article className="road-card future reveal">
          <div className="road-label">
            Future
          </div>
          <h3>
            Food infrastructure
          </h3>
          <p>
            Regional distribution, deeper supply-chain technology, farmer financial partnerships, DOVA AI expansion and a broader African food network.
          </p>
        </article>
      </div>
    </div>
  </section>
  <section className="section light" id="about">
    <div className="container">
      <div className="section-head reveal">
        <div className="eyebrow">
          About DOVA Chain
        </div>
        <h2>
          Products first. Network next. Infrastructure over time.
        </h2>
        <p>
          DOVA is an African food-supply-chain technology company building infrastructure that connects agricultural supply with real demand.
        </p>
      </div>
      <div className="about-grid">
        <article className="about-card reveal">
          <strong>
            Mission
          </strong>
          <h3>
            Connect agricultural supply with dependable food access.
          </h3>
          <p>
            DOVA's platform is designed to make sourcing, processing, marketplace distribution and fulfillment more organized for farmers, customers and businesses.
          </p>
        </article>
        <article className="about-card reveal">
          <strong>
            Vision
          </strong>
          <h3>
            Build a connected food network across Africa.
          </h3>
          <p>
            DOVA starts with products, builds the network around them, and grows toward broader food infrastructure without presenting future capabilities as current operations.
          </p>
        </article>
      </div>
    </div>
  </section>
  <section className="cta">
    <div className="container cta-inner reveal">
      <div className="eyebrow">
        Build With DOVA
      </div>
      <h2>
        From Farm to Table. On Time, Every Time.
      </h2>
      <p>
        Whether you grow food, buy it for your household or source it for a business, DOVA is building a more connected path through the food supply chain.
      </p>
      <div className="cta-actions">
        <Link className="btn gold" to="/marketplace">
          Shop Products ↗
        </Link>
        <Link className="btn ghost" to="/auth/supplier-register">
          Join as a Farmer ↗
        </Link>
        <Link className="btn ghost" to="/contact">
          Contact DOVA ↗
        </Link>
      </div>
    </div>
  </section>
</main>
      </main>
      <HomeFooter />
    </div>
  );
}
