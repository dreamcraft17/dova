import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import { Layout } from '../components/Layout';
import { ProductImage } from '../components/ProductImage';
import { api } from '../lib/api';
import styles from '../styles/Home.module.css';
import { formatPricePerUnit, productUnit } from 'dova-shared';
import type { Product } from 'dova-shared';

type PreviewProduct = {
  id: string;
  name: string;
  imageUrl?: string;
  categoryName?: string;
  price: number;
  inStock: boolean;
  href: string;
};

const STRIP = [
  { icon: '✓', label: 'Verified Suppliers' },
  { icon: '✦', label: 'Agricultural Products' },
  { icon: '↗', label: 'Flexible Fulfillment' },
  { icon: '♧', label: 'Farmer Access' },
  { icon: '⌁', label: 'Technology' },
] as const;

const PROBLEMS = [
  {
    number: '01',
    title: 'Limited Market Access',
    text: 'Farmers can struggle to reach consistent buyers beyond their immediate markets.',
  },
  {
    number: '02',
    title: 'Fragmented Supply',
    text: 'Buyers often have to coordinate across multiple informal sources.',
  },
  {
    number: '03',
    title: 'Logistics Friction',
    text: 'Moving agricultural products from source to destination can be difficult to coordinate.',
  },
] as const;

const SOLUTION_FLOW = [
  { label: 'Farmers & Suppliers', highlight: false },
  { label: 'Verification', highlight: true },
  { label: 'DOVA Marketplace', highlight: false },
  { label: 'Fulfillment', highlight: true },
  { label: 'Logistics', highlight: false },
  { label: 'Customers & Businesses', highlight: true },
] as const;

const ECO_NODES = [
  { label: 'Farmers', position: 'n1' },
  { label: 'Verification', position: 'n2' },
  { label: 'Logistics', position: 'n3' },
  { label: 'DOVA AI', position: 'n4' },
  { label: 'Marketplace', position: 'n5' },
  { label: 'Farmer Services', position: 'n6' },
] as const;

const FARMER_BENEFITS = [
  {
    icon: '✓',
    title: 'Reach More Buyers',
    text: 'Showcase agricultural products to households and businesses.',
  },
  {
    icon: '✓',
    title: 'Digital Records',
    text: 'Build useful transaction and supplier history over time.',
  },
  {
    icon: '✓',
    title: 'Access Services',
    text: 'Connect with relevant agricultural services and future partner programs.',
  },
] as const;

const BUYER_BENEFITS = [
  {
    icon: '01',
    title: 'Discover Products',
    text: 'Browse agricultural products from participating suppliers.',
  },
  {
    icon: '02',
    title: 'Flexible Fulfillment',
    text: 'Use available delivery, pickup or scheduled fulfillment options.',
  },
  {
    icon: '03',
    title: 'Business Purchasing',
    text: 'Support repeat and bulk sourcing for restaurants, retailers and other buyers.',
  },
] as const;

const MODEL = [
  {
    title: 'Marketplace & Service Fees',
    text: 'Revenue associated with transactions and platform services.',
  },
  {
    title: 'Delivery & Fulfillment',
    text: 'Revenue or margin from coordinated fulfillment and logistics services.',
  },
  {
    title: 'Farmer Services',
    text: 'Verification, aggregation, packaging, storage, analytics and related services.',
  },
  { title: 'Inputs & Services', text: 'Future agricultural input and service partnerships.' },
  {
    title: 'Financial Partnerships',
    text: 'Potential partner revenue from licensed financing or insurance services.',
  },
  {
    title: 'Future Membership',
    text: 'Potential premium customer or business membership services.',
  },
] as const;

const REVENUE_FLOW = [
  { label: 'Customers', active: false },
  { label: 'Transactions', active: false },
  { label: 'DOVA Platform', active: true },
  { label: 'Services', active: false },
  { label: 'Revenue', active: false },
] as const;

const ROADMAP = [
  {
    stage: 'Now',
    title: 'Marketplace',
    text: 'Connect agricultural suppliers and buyers.',
    future: false,
  },
  {
    stage: 'Next',
    title: 'Verification + Logistics',
    text: 'Strengthen supplier and fulfillment infrastructure.',
    future: false,
  },
  {
    stage: 'Expanding',
    title: 'Farmer Services + DOVA AI',
    text: 'Add technology and agricultural support layers.',
    future: false,
  },
  {
    stage: 'Future',
    title: 'Financial & Insurance Partnerships',
    text: 'Expand access through appropriate licensed partners.',
    future: true,
  },
  {
    stage: 'Long Term',
    title: 'Agricultural Infrastructure',
    text: 'Develop a connected food and agricultural network.',
    future: true,
  },
] as const;

const ABOUT = [
  {
    title: 'About Us',
    text: 'DOVA connects verified farmers and suppliers with customers through a secure, transparent marketplace — so fresh produce moves with clarity, fair pricing and reliable delivery.',
  },
  {
    title: 'Mission',
    text: 'To give every farmer a dependable route to market, and every buyer a dependable source of fresh agricultural products.',
  },
  {
    title: 'Vision',
    text: 'A connected agricultural network across Africa where sourcing, fulfillment and farmer services run on shared, trusted infrastructure.',
  },
] as const;

/** Shown until the marketplace responds, and if it can't be reached. */
const FALLBACK_PRODUCTS: PreviewProduct[] = [
  { id: 'f1', name: 'Premium Rice', imageUrl: '/images/product1.jpg', price: 0, inStock: true, href: '/products' },
  { id: 'f2', name: 'Premium Palm Oil', imageUrl: '/images/product2.jpg', price: 0, inStock: true, href: '/products' },
  { id: 'f3', name: 'Organic Corn', imageUrl: '/images/product3.jpg', price: 0, inStock: true, href: '/products' },
  { id: 'f4', name: 'Fresh Vegetables', imageUrl: '/images/product1.jpg', price: 0, inStock: true, href: '/products' },
];

function formatPrice(product: PreviewProduct) {
  if (product.price <= 0) return '₦ —';
  const unit = productUnit(product.name, product.categoryName);
  return `₦ ${product.price.toLocaleString('en-NG')} ${formatPricePerUnit(unit)}`;
}

export default function Home() {
  const [products, setProducts] = useState<PreviewProduct[]>(FALLBACK_PRODUCTS);
  const [productsLoading, setProductsLoading] = useState(true);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api<{ data: Product[] }>('/products?page=1&limit=4')
      .then((r) => {
        if (!r.data?.length) return;
        setProducts(
          r.data.map((p) => ({
            id: p.id,
            name: p.name,
            imageUrl: p.imageUrl,
            categoryName: p.categoryName,
            price: p.price,
            inStock: p.stockQuantity > 0,
            href: `/products/${p.id}`,
          })),
        );
      })
      .catch(() => undefined)
      .finally(() => setProductsLoading(false));
  }, []);

  // One observer for the whole page rather than a ref per block; re-runs when the
  // marketplace grid swaps in so the new cards get observed too.
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const targets = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
    if (typeof IntersectionObserver === 'undefined') {
      targets.forEach((el) => el.classList.add(styles.revealVisible));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add(styles.revealVisible);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12 },
    );
    targets.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [productsLoading]);

  return (
    <Layout>
      <div className={styles.page} ref={pageRef}>
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={`${styles.heroCopy} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>African AgriTech • Supply Chain</div>
              <h1>
                From Farm to Table. <span className={styles.heroAccent}>On Time, Every Time.</span>
              </h1>
              <p>
                DOVA Chain is building a technology-enabled agricultural marketplace and supply-chain
                network connecting verified farmers and suppliers with households, restaurants,
                retailers and commercial food buyers.
              </p>
              <div className={styles.actions}>
                <Link href="/products" className={`${styles.btn} ${styles.primary}`}>
                  Shop Agricultural Products →
                </Link>
                <Link
                  href="/auth/supplier-register"
                  className={`${styles.btn} ${styles.secondary}`}
                >
                  Join as a Farmer →
                </Link>
              </div>
            </div>

            <div className={`${styles.heroImage} ${styles.reveal}`} data-reveal="">
              <img src="/images/farmer.jpg" alt="Farmer standing in a field of young crops" />
              <div className={styles.heroOverlay}>
                <div className={styles.flow}>
                  <span>FARMERS</span>
                  <b aria-hidden="true">→</b>
                  <span>DOVA CHAIN</span>
                  <b aria-hidden="true">→</b>
                  <span>LOGISTICS</span>
                  <b aria-hidden="true">→</b>
                  <span>CUSTOMERS</span>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.heroStrip}>
            <div className={`${styles.container} ${styles.stripGrid}`}>
              {STRIP.map((item) => (
                <div className={styles.stripItem} key={item.label}>
                  <span className={styles.icon} aria-hidden="true">
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>The Challenge</div>
              <h2>A fragmented food supply chain creates friction.</h2>
              <p>
                Between the farm gate and the kitchen sit brokers, guesswork and unreliable
                transport. Both sides lose margin to the gap.
              </p>
            </div>
            <div className={styles.grid3}>
              {PROBLEMS.map((item) => (
                <article
                  className={`${styles.card} ${styles.tallCard} ${styles.reveal}`}
                  data-reveal=""
                  key={item.number}
                >
                  <div className={styles.number}>{item.number}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="solution">
          <div className={styles.container}>
            <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>The DOVA Solution</div>
              <h2>One connected path from farmer to buyer.</h2>
              <p>
                Every order moves along the same verified path — so both sides know where the
                produce came from and when it arrives.
              </p>
            </div>
            <div className={`${styles.storyFlow} ${styles.reveal}`} data-reveal="">
              {SOLUTION_FLOW.map((step, index) => (
                <Fragment key={step.label}>
                  {index > 0 && (
                    <div className={styles.arrow} aria-hidden="true">
                      →
                    </div>
                  )}
                  <div
                    className={`${styles.node}${step.highlight ? ` ${styles.nodeHighlight}` : ''}`}
                  >
                    {step.label}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`}>
          <div className={`${styles.container} ${styles.ecosystem}`}>
            <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>More Than a Marketplace</div>
              <h2>DOVA Chain connects the pieces.</h2>
              <p>
                Marketplace, supplier verification, logistics, agricultural data, DOVA AI and farmer
                services run as one network — with financial and insurance partnerships planned.
              </p>
            </div>
            <div className={`${styles.ecoMap} ${styles.reveal}`} data-reveal="">
              <div className={styles.ecoLine} aria-hidden="true" />
              <div className={styles.ecoCenter}>
                DOVA
                <br />
                CHAIN
              </div>
              {ECO_NODES.map((node) => (
                <div
                  className={`${styles.ecoNode} ${styles[node.position]}`}
                  key={node.label}
                >
                  {node.label}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="farmers">
          <div className={`${styles.container} ${styles.split}`}>
            <div className={`${styles.imageCard} ${styles.reveal}`} data-reveal="">
              <img src="/images/supplier.jpg" alt="Farmer holding freshly harvested seedlings" />
            </div>
            <div className={styles.reveal} data-reveal="">
              <div className={styles.eyebrow}>For Farmers</div>
              <h2>More markets. More visibility. More opportunity.</h2>
              <p>
                List your harvest once and reach households, restaurants and retailers already
                buying on DOVA.
              </p>
              <div className={styles.checkList}>
                {FARMER_BENEFITS.map((item) => (
                  <div className={styles.check} key={item.title}>
                    <span className={styles.icon} aria-hidden="true">
                      {item.icon}
                    </span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link
                href="/auth/supplier-register"
                className={`${styles.btn} ${styles.outline}`}
              >
                Join DOVA as a Farmer →
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={`${styles.container} ${styles.split}`}>
            <div className={styles.reveal} data-reveal="">
              <div className={styles.eyebrow}>For Customers &amp; Businesses</div>
              <h2>Source agricultural products through one connected platform.</h2>
              <p>
                One account, one cart, one delivery schedule — whether you are cooking dinner or
                stocking a kitchen.
              </p>
              <div className={styles.checkList}>
                {BUYER_BENEFITS.map((item) => (
                  <div className={styles.check} key={item.title}>
                    <span className={styles.icon} aria-hidden="true">
                      {item.icon}
                    </span>
                    <div>
                      <b>{item.title}</b>
                      <p>{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/products" className={`${styles.btn} ${styles.primary}`}>
                Source With DOVA →
              </Link>
            </div>
            <div className={`${styles.imageCard} ${styles.reveal}`} data-reveal="">
              <img src="/images/product2.jpg" alt="Produce traders at a busy market stall" />
            </div>
          </div>
        </section>

        <section className={styles.section} id="marketplace">
          <div className={styles.container}>
            <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>Marketplace Preview</div>
              <h2>Fresh agricultural products, presented professionally.</h2>
              <p>Live from the DOVA marketplace — listed and priced by verified suppliers.</p>
            </div>
            <div className={styles.marketGrid}>
              {productsLoading
                ? FALLBACK_PRODUCTS.map((p) => (
                    <div className={styles.marketSkeleton} key={p.id} aria-hidden="true" />
                  ))
                : products.map((product) => (
                    <Link
                      className={`${styles.product} ${styles.reveal}`}
                      data-reveal=""
                      href={product.href}
                      key={product.id}
                    >
                      <div className={styles.productMedia}>
                        <ProductImage
                          name={product.name}
                          imageUrl={product.imageUrl}
                          categoryName={product.categoryName}
                        />
                      </div>
                      <div className={styles.productBody}>
                        <h3>{product.name}</h3>
                        <div className={styles.productMeta}>
                          <span className={styles.price}>{formatPrice(product)}</span>
                          <span
                            className={`${styles.badge}${product.inStock ? '' : ` ${styles.badgeMuted}`}`}
                          >
                            {product.inStock ? 'Available' : 'Out of stock'}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
            </div>
            <div
              className={`${styles.actions} ${styles.actionsCenter} ${styles.reveal}`}
              data-reveal=""
              style={{ marginTop: 32 }}
            >
              <Link href="/products" className={`${styles.btn} ${styles.outline}`}>
                View All Products →
              </Link>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.dark}`} id="ai">
          <div className={`${styles.container} ${styles.aiBox}`}>
            <div className={styles.reveal} data-reveal="">
              <div className={styles.eyebrow}>DOVA AI</div>
              <h2>Intelligent agricultural assistance, built into the DOVA ecosystem.</h2>
              <p>
                Ask about a crop, send a photo of a struggling plant, or find the right product in
                the marketplace — in the same place you buy and sell.
              </p>
              <div className={styles.actions} style={{ marginTop: 28 }}>
                <Link href="/chat" className={`${styles.btn} ${styles.primary}`}>
                  Explore DOVA AI →
                </Link>
              </div>
            </div>
            <div className={`${styles.phone} ${styles.reveal}`} data-reveal="">
              <div className={styles.phoneScreen}>
                <div className={styles.phoneTop}>
                  <b>🌿 DOVA AI</b>
                  <br />
                  <small>Agricultural Assistant</small>
                </div>
                <div className={styles.aiMessage}>
                  <b>You</b>
                  <br />
                  What could be affecting these leaves?
                </div>
                <div className={`${styles.aiMessage} ${styles.aiAnswer}`}>
                  <b>DOVA AI</b>
                  <br />
                  Upload a clear photo of the plant and I can help identify possible issues and
                  suggest practical next steps.
                </div>
                <div className={styles.aiMessage}>
                  <b>Quick actions</b>
                  <br />
                  🌱 Crop Help &nbsp; 📷 Scan Photo
                  <br />
                  🌾 Farming Questions &nbsp; 🧺 DOVA Products
                </div>
                <div className={styles.aiInput}>Ask DOVA AI anything… →</div>
              </div>
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>Business Model</div>
              <h2>Build multiple value layers around the agricultural network.</h2>
              <p>
                The marketplace funds the network; the network makes every layer above it worth
                more.
              </p>
            </div>
            <div className={styles.grid3}>
              {MODEL.map((item) => (
                <article
                  className={`${styles.card} ${styles.tallCard} ${styles.reveal}`}
                  data-reveal=""
                  key={item.title}
                >
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
            <div className={`${styles.revenueFlow} ${styles.reveal}`} data-reveal="">
              {REVENUE_FLOW.map((step, index) => (
                <Fragment key={step.label}>
                  {index > 0 && <b aria-hidden="true">→</b>}
                  <span className={step.active ? styles.active : undefined}>{step.label}</span>
                </Fragment>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="roadmap">
          <div className={styles.container}>
            <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>Vision &amp; Roadmap</div>
              <h2>Start with the marketplace. Build the infrastructure around it.</h2>
              <p>
                What is live today and what is still ahead, kept clearly apart so nothing planned
                reads as shipped.
              </p>
            </div>
            <div className={styles.timeline}>
              {ROADMAP.map((item) => (
                <div
                  className={`${styles.roadmap}${item.future ? ` ${styles.roadmapFuture}` : ''} ${styles.reveal}`}
                  data-reveal=""
                  key={item.title}
                >
                  <small>{item.stage}</small>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.soft}`}>
          <div className={styles.container}>
            <div className={`${styles.sectionHead} ${styles.reveal}`} data-reveal="">
              <div className={styles.eyebrow}>About DOVA Chain</div>
              <h2>Technology connecting agriculture, people and opportunity.</h2>
            </div>
            <div className={styles.grid3}>
              {ABOUT.map((item) => (
                <article className={`${styles.card} ${styles.reveal}`} data-reveal="" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.cta} id="cta">
          <div className={`${styles.container} ${styles.ctaContent} ${styles.reveal}`} data-reveal="">
            <div className={styles.eyebrow}>Build With DOVA</div>
            <h2>From Farm to Table. On Time, Every Time.</h2>
            <p>
              Whether you grow it, cook with it or sell it — there is a place for you on the DOVA
              network.
            </p>
            <div className={`${styles.actions} ${styles.actionsCenter}`}>
              <Link href="/products" className={`${styles.btn} ${styles.primary}`}>
                Shop Products
              </Link>
              <Link href="/auth/supplier-register" className={`${styles.btn} ${styles.secondary}`}>
                Join as a Farmer
              </Link>
              <Link href="/contact" className={`${styles.btn} ${styles.secondary}`}>
                Partner With DOVA
              </Link>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
