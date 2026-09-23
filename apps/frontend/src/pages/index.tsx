import Head from 'next/head';
import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import type { Product } from 'dova-shared';
import { formatPricePerUnit, formatStockInUnit, productUnit } from 'dova-shared';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { api } from '../lib/api';
import styles from '../styles/home-v3.module.css';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

function Reveal({
  as = 'div',
  className,
  children,
  ...rest
}: {
  as?: 'div' | 'article';
  className?: string;
  children: ReactNode;
  id?: string;
  'aria-label'?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.12 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const Tag = as as ElementType;
  return (
    <Tag ref={ref} className={cx(styles.reveal, visible && styles.revealVisible, className)} {...rest}>
      {children}
    </Tag>
  );
}

const SUPPLY_STEPS = [
  'Farmers',
  'Sourcing',
  'Processing',
  'Quality Check',
  'Packaging',
  'DOVA',
  'Logistics',
  'Customers',
];

const TRUST_ITEMS = [
  { title: 'Product clarity', text: 'Clear pack, price and availability information' },
  { title: 'Secure checkout', text: 'Designed around the existing payment flow' },
  { title: 'Quality focus', text: 'Built around better food sourcing and preparation' },
  { title: 'Customer support', text: 'A clear route to help before and after an order' },
];

const CHALLENGES = [
  {
    title: 'Market access',
    text: 'Farmers can face difficulty reaching consistent buyers beyond their immediate markets.',
  },
  {
    title: 'Fragmented sourcing',
    text: 'Buyers may have to coordinate across multiple informal sources to find the products they need.',
  },
  {
    title: 'Fulfillment friction',
    text: 'Moving agricultural products from source to destination requires coordination across supply and logistics.',
  },
];

const PROCESS_STEPS = [
  { title: 'Farmer sourcing', text: 'Build supply around real demand.' },
  { title: 'Verification', text: 'Organize supplier information and checks.' },
  { title: 'Processing', text: 'Turn selected raw materials into food products.' },
  { title: 'Quality control', text: 'Keep quality information visible and structured.' },
  { title: 'Packaging', text: 'Prepare products for consumer and business orders.' },
  { title: 'Marketplace', text: 'Give customers one place to discover products.' },
  { title: 'Fulfillment', text: 'Coordinate pickup, delivery and order flow.' },
  { title: 'Customers', text: 'Serve households and business buyers.' },
];

const ORDER_STEPS = ['Order', 'Confirm', 'Prepare', 'Fulfill', 'Receive'];

const FEATURE_POINTS = [
  { title: 'Plantain flour first', text: 'Our flagship launch category.' },
  {
    title: 'Focused catalog',
    text: 'More categories can be added as supply and operations develop.',
  },
  {
    title: 'Infrastructure around food',
    text: 'Sourcing, processing, packaging, marketplace and fulfillment form the larger system.',
  },
];

const FILTERS = [
  { id: 'featured', label: 'Featured' },
  { id: 'flour', label: 'Flour' },
  { id: 'staples', label: 'Staples' },
  { id: 'produce', label: 'Fresh Produce' },
  { id: 'bundles', label: 'Bundles' },
  { id: 'coming', label: 'Coming Soon' },
];

type PreviewProduct = {
  id: string;
  name: string;
  category: string;
  tags: string[];
  size: string;
  price: string;
  status: string;
  tone: 'live' | 'soon';
  href?: string;
  packLines?: string[];
  image?: { src: string; alt: string };
};

const PREVIEW_PRODUCTS: PreviewProduct[] = [
  {
    id: 'plantain-flour',
    name: 'Plantain Flour',
    category: 'Flour',
    tags: ['flour'],
    size: 'Pack sizes • See product page',
    price: 'View product',
    status: 'Starting',
    tone: 'live',
    href: '/products',
    packLines: ['PLANTAIN', 'FLOUR', 'DOVA'],
  },
  {
    id: 'cassava-flour',
    name: 'Cassava Flour',
    category: 'Flour',
    tags: ['flour', 'coming'],
    size: 'Expansion category',
    price: 'Coming soon',
    status: 'Soon',
    tone: 'soon',
    packLines: ['CASSAVA', 'FLOUR'],
  },
  {
    id: 'yam-flour',
    name: 'Yam Flour',
    category: 'Flour',
    tags: ['flour', 'coming'],
    size: 'Expansion category',
    price: 'Coming soon',
    status: 'Soon',
    tone: 'soon',
    packLines: ['YAM', 'FLOUR'],
  },
  {
    id: 'more-food',
    name: 'More Food Products',
    category: 'Farm products',
    tags: ['coming'],
    size: 'Curated as supply grows',
    price: 'Coming soon',
    status: 'Expansion',
    tone: 'soon',
    image: {
      src: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=78',
      alt: 'Plantains prepared for food processing',
    },
  },
];

const VALUE_LAYERS = [
  {
    title: 'Marketplace revenue',
    text: 'Revenue associated with product transactions and platform services.',
  },
  {
    title: 'Processing & packaging',
    text: 'Value created by turning agricultural raw materials into market-ready food products.',
  },
  {
    title: 'Fulfillment & delivery',
    text: 'Coordinated movement of orders from supply points to customers.',
  },
  {
    title: 'Business supply',
    text: 'Repeat and bulk sourcing opportunities for restaurants, retailers and other buyers.',
  },
  {
    title: 'Farmer services',
    text: 'Future services around verification, aggregation, storage, data and market access.',
  },
  {
    title: 'Future partnerships',
    text: 'Potential licensed partnerships for financing, insurance and other agricultural services.',
  },
];

const GLANCE = [
  { label: 'Market', value: 'Nigeria', text: 'Starting locally, with a long-term African network in view.' },
  {
    label: 'Launch category',
    value: 'Food Flour',
    text: 'Plantain Flour is the first commercial product focus.',
  },
  {
    label: 'Platform',
    value: 'Food + Supply Chain',
    text: 'Marketplace, sourcing, processing, packaging and fulfillment.',
  },
  {
    label: 'Long-term direction',
    value: 'Food Infrastructure',
    text: 'Expand from products into a broader connected food network.',
  },
];

const ROADMAP = [
  {
    label: 'Now',
    title: 'Flour launch',
    text: 'Plantain flour, farmer sourcing, processing, packaging, marketplace and available fulfillment.',
    modifier: undefined,
  },
  {
    label: 'Next',
    title: 'Supply expansion',
    text: 'More flour categories, more farmers, more food products, aggregation and stronger business supply.',
    modifier: styles.roadNext,
  },
  {
    label: 'Future',
    title: 'Food infrastructure',
    text: 'Regional distribution, deeper supply-chain technology, farmer financial partnerships, DOVA AI expansion and a broader African food network.',
    modifier: styles.roadFuture,
  },
];

export default function Home() {
  const { user } = useAuth();
  const { count } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [filter, setFilter] = useState('featured');
  const [liveProduct, setLiveProduct] = useState<Product | null>(null);

  useEffect(() => {
    api<{ data: Product[] }>('/products?search=plantain&limit=1')
      .then((r) => setLiveProduct(r.data[0] ?? null))
      .catch(() => setLiveProduct(null));
  }, []);

  // Admin and supplier accounts don't shop, matching the cart rules in Layout.
  const canShop = !user || user.role === 'customer';
  const dashboard =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/supplier' : '/customer/profile';

  const products = useMemo(() => {
    if (!liveProduct) return PREVIEW_PRODUCTS;
    const unit = productUnit(liveProduct.name, liveProduct.categoryName);
    return PREVIEW_PRODUCTS.map((p) =>
      p.id === 'plantain-flour'
        ? {
            ...p,
            name: liveProduct.name,
            category: liveProduct.categoryName,
            size: formatStockInUnit(liveProduct.stockQuantity, unit),
            price: `₦ ${liveProduct.price.toLocaleString('en-NG')} ${formatPricePerUnit(unit)}`,
            href: `/products/${liveProduct.id}`,
          }
        : p,
    );
  }, [liveProduct]);

  const visibleProducts =
    filter === 'featured' ? products : products.filter((p) => p.tags.includes(filter));

  const closeMenu = () => setMenuOpen(false);

  return (
    <div className={styles.page}>
      <Head>
        <title>DOVA Chain — Food Supply Chain &amp; Agricultural Marketplace</title>
        <meta
          name="description"
          content="DOVA Chain connects trusted farmers, food products and customers through a technology-enabled food supply chain, starting with flour."
        />
        <meta name="theme-color" content="#031F17" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;800;900&family=Inter:wght@400;500;700;800;900&display=swap"
        />
      </Head>

      <header className={styles.siteHeader}>
        <div className={cx(styles.container, styles.nav)}>
          <Link href="/" className={styles.brand} aria-label="DOVA Chain home">
            <span className={styles.brandName}>DOVA</span>
            <span className={styles.brandSuffix}>CHAIN</span>
          </Link>
          <nav className={styles.navLinks} aria-label="Primary navigation">
            <a href="#how">How It Works</a>
            <Link href="/marketplace">Products</Link>
            <Link href="/bundles">Bundles</Link>
            <a href="#farmers">Farmers</a>
            <a href="#ai">DOVA AI</a>
            <a href="#about">About</a>
          </nav>
          <div className={styles.navActions}>
            <Link href="/marketplace" className={styles.iconLink} aria-label="Search products">
              ⌕
            </Link>
            {canShop && (
              <Link href="/cart" className={styles.iconLink} aria-label="Open cart">
                🛒
                {count > 0 && <span className={styles.cartCount}>{count}</span>}
              </Link>
            )}
            <Link href="/marketplace" className={cx(styles.btn, styles.gold)}>
              Shop DOVA
            </Link>
          </div>
          <button
            type="button"
            className={styles.menuBtn}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobileMenu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
        <div
          id="mobileMenu"
          className={cx(styles.mobileMenu, menuOpen && styles.mobileMenuOpen)}
          aria-label="Mobile navigation"
        >
          <a href="#how" onClick={closeMenu}>
            How It Works
          </a>
          <Link href="/marketplace" onClick={closeMenu}>
            Products
          </Link>
          <Link href="/bundles" onClick={closeMenu}>
            Bundles
          </Link>
          <a href="#farmers" onClick={closeMenu}>
            Farmers
          </a>
          <a href="#ai" onClick={closeMenu}>
            DOVA AI
          </a>
          <a href="#roadmap" onClick={closeMenu}>
            Roadmap
          </a>
          <div className={styles.mobileActions}>
            <Link
              href={user ? dashboard : '/auth/login'}
              className={cx(styles.btn, styles.ghost)}
              onClick={closeMenu}
            >
              {user ? 'My account' : 'Login'}
            </Link>
            <Link href="/marketplace" className={cx(styles.btn, styles.gold)} onClick={closeMenu}>
              Shop DOVA
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={cx(styles.container, styles.heroGrid)}>
            <Reveal className={styles.heroCopy}>
              <div className={styles.eyebrow}>African Food Supply Chain</div>
              <h1>
                Building a better <em>food supply chain.</em>
              </h1>
              <p style={{color: '#ffff'}}>
                DOVA Chain connects trusted agricultural supply with consumers and businesses through
                sourcing, processing, quality verification and reliable delivery — starting with food
                flour.
              </p>
              <div className={styles.heroActions}>
                <Link href="/marketplace" className={cx(styles.btn, styles.gold)}>
                  Shop Products <span aria-hidden="true">↗</span>
                </Link>
                <Link href="/auth/supplier-register" className={cx(styles.btn, styles.ghost)}>
                  Join the DOVA Network <span aria-hidden="true">↗</span>
                </Link>
              </div>
              <div className={styles.heroNote}>
                <span className={styles.heroNoteDot} aria-hidden="true" />
                Now: Plantain Flour · Next: More food categories · Future: Food infrastructure
              </div>
            </Reveal>

            <Reveal className={styles.heroVisual} aria-label="Agriculture and plantain flour visual">
              <div className={styles.heroPhoto}>
                <img
                  src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=82"
                  alt="Fresh agricultural produce at a market"
                />
              </div>
              <div className={styles.productOrbit}>
                <div className={styles.orbitPack} aria-hidden="true">
                  <span className={styles.orbitPackLabel}>
                    PLANTAIN
                    <br />
                    FLOUR
                  </span>
                </div>
                <small>First commercial entry point</small>
                <strong>Plantain Flour</strong>
              </div>
              <div className={styles.heroBadge}>FARM → PROCESS → PACK → DELIVER</div>
            </Reveal>
          </div>
        </section>

        <section className={styles.supplyStrip} aria-label="DOVA supply chain">
          <div className={cx(styles.container, styles.supplyRow)}>
            {SUPPLY_STEPS.map((step, i) => (
              <Fragment key={step}>
                <div className={styles.supplyStep}>
                  <span className={styles.supplyDot}>{String(i + 1).padStart(2, '0')}</span>
                  {step}
                </div>
                {i < SUPPLY_STEPS.length - 1 && (
                  <div className={styles.supplyArrow} aria-hidden="true">
                    →
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </section>

        <section className={styles.trustBand} aria-label="DOVA buying confidence">
          <div className={cx(styles.container, styles.trustGrid)}>
            {TRUST_ITEMS.map((item, i) => (
              <div className={styles.trustItem} key={item.title}>
                <div className={styles.trustIcon} aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={cx(styles.section, styles.light)}>
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>The Challenge</div>
              <h2>Food supply should be simpler.</h2>
            </Reveal>
            <Reveal className={styles.challengeText}>
              <p>
                Farmers need dependable routes to buyers. Customers need dependable access to quality
                food. Businesses need reliable sourcing. DOVA is designed to connect these parts into
                one structured supply chain.
              </p>
            </Reveal>
            <div className={styles.cards3}>
              {CHALLENGES.map((item, i) => (
                <Reveal as="article" className={styles.infoCard} key={item.title}>
                  <div className={styles.infoIndex} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={cx(styles.section, styles.processSection)} id="how">
          <div className={cx(styles.container, styles.processWrap)}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>The DOVA Solution</div>
              <h2>One connected path from farm to customer.</h2>
              <p>
                Source, verify, process, package and move food through a more organized path — with
                technology supporting the network.
              </p>
            </Reveal>
            <div className={styles.processGrid}>
              {PROCESS_STEPS.map((step, i) => (
                <Reveal as="article" className={styles.processItem} key={step.title}>
                  <span className={styles.processNum}>{String(i + 1).padStart(2, '0')}</span>
                  <h3>{step.title}</h3>
                  <p>{step.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.orderStrip} aria-label="Customer order journey">
          <div className={cx(styles.container, styles.orderRow)}>
            <div className={styles.orderIntro}>
              <strong>What happens after you order?</strong>
              <span>A simple customer journey from product selection to delivery.</span>
            </div>
            {ORDER_STEPS.map((step, i) => (
              <div className={styles.orderStep} key={step}>
                <b aria-hidden="true">{String(i + 1).padStart(2, '0')}</b>
                {step}
              </div>
            ))}
          </div>
        </section>

        <section className={styles.section}>
          <div className={cx(styles.container, styles.flourFeature)}>
            <Reveal className={styles.flourArt} aria-label="Plantain flour launch visual">
              <div className={styles.flourPack} aria-hidden="true">
                <div className={styles.packInner}>
                  <span>FOOD FLOUR</span>
                  <strong>
                    PLANTAIN
                    <br />
                    FLOUR
                  </strong>
                  <div className={styles.packLeaf}>✦</div>
                  <span>DOVA CHAIN</span>
                </div>
              </div>
            </Reveal>
            <Reveal className={styles.featureCopy}>
              <div className={styles.eyebrow}>Starting With Flour</div>
              <h2>Starting with Flour. Building for More.</h2>
              <p>
                Plantain flour is DOVA&apos;s focused first commercial entry point into a larger food
                supply chain. The strategy is simple: start with a clear product category, learn the
                operating loop, then expand the network around it.
              </p>
              <div className={styles.featureList}>
                {FEATURE_POINTS.map((point) => (
                  <div className={styles.featureItem} key={point.title}>
                    <span className={styles.featureCheck} aria-hidden="true">
                      ✓
                    </span>
                    <div>
                      <b>{point.title}</b>
                      <br />
                      <small>{point.text}</small>
                    </div>
                  </div>
                ))}
              </div>
              <Link href="/marketplace" className={cx(styles.btn, styles.outline)}>
                Explore the DOVA Marketplace ↗
              </Link>
              <div className={styles.featureNote}>
                Launch status: product availability should always reflect the live DOVA catalog.
                Planned products are not presented as live inventory.
              </div>
            </Reveal>
          </div>
        </section>

        <section className={cx(styles.section, styles.light)} id="marketplace">
          <div className={styles.container}>
            <Reveal className={cx(styles.sectionHead, styles.sectionHeadRow)}>
              <div className={styles.copy}>
                <div className={styles.eyebrow}>Marketplace</div>
                <h2>Start with Plantain Flour. Scale the catalog with purpose.</h2>
                <p>
                  Plantain Flour is the starting commercial product. As DOVA grows, additional food
                  categories can be introduced without losing a simple, fast shopping experience.
                </p>
              </div>
              <Link href="/marketplace" className={cx(styles.btn, styles.outline, styles.sideLink)}>
                View Live Products ↗
              </Link>
            </Reveal>

            <div className={styles.marketToolbar} role="group" aria-label="Product categories">
              {FILTERS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  className={cx(styles.filterChip, filter === chip.id && styles.filterChipActive)}
                  aria-pressed={filter === chip.id}
                  onClick={() => setFilter(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className={styles.catalogGrid}>
              {visibleProducts.map((product) => (
                <Reveal as="article" className={styles.productCard} key={product.id}>
                  <div className={styles.productImage}>
                    {product.image ? (
                      <img src={product.image.src} alt={product.image.alt} loading="lazy" />
                    ) : (
                      <div className={styles.miniPack} aria-hidden="true">
                        <span>
                          {product.packLines?.map((line, i) => (
                            <Fragment key={line}>
                              {i > 0 && <br />}
                              {line}
                            </Fragment>
                          ))}
                        </span>
                      </div>
                    )}
                    <span
                      className={cx(
                        styles.productStatus,
                        styles.pill,
                        product.tone === 'live' ? styles.live : styles.soon,
                      )}
                    >
                      {product.status}
                    </span>
                  </div>
                  <div className={styles.productBody}>
                    <div className={styles.productCat}>{product.category}</div>
                    <h3 className={styles.productName}>{product.name}</h3>
                    <div className={styles.productMeta}>
                      <div>
                        <div className={styles.productSize}>{product.size}</div>
                        <div className={styles.productPrice}>{product.price}</div>
                      </div>
                      {product.href ? (
                        <Link
                          href={product.href}
                          className={styles.addBtn}
                          aria-label={`View ${product.name}`}
                        >
                          +
                        </Link>
                      ) : (
                        <button
                          type="button"
                          className={styles.addBtn}
                          aria-label={`${product.name} coming soon`}
                          disabled
                        >
                          +
                        </button>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
              {visibleProducts.length === 0 && (
                <p className={styles.catalogEmpty}>
                  No preview products in this category yet.{' '}
                  <Link href="/marketplace">Browse the live catalog</Link>.
                </p>
              )}
            </div>

            <p className={styles.catalogNote}>
              Only live product data should be displayed here. Plantain Flour is the current
              commercial focus; future categories remain clearly marked until they are actually
              launched.
            </p>
          </div>
        </section>

        <section className={styles.section} id="farmers">
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>For Farmers</div>
              <h2>Better market access starts at the farm.</h2>
              <p>
                DOVA helps organize supply from farmers and connect it to real demand through a
                structured marketplace and supply-chain workflow.
              </p>
            </Reveal>
            <div className={styles.audienceGrid}>
              <Reveal as="article" className={styles.audienceCard}>
                <h3>Join as a Farmer</h3>
                <p>
                  Build a clearer route from what you grow to the people and businesses looking to buy
                  food.
                </p>
                <div className={styles.benefits}>
                  {[
                    'Market access',
                    'Supplier verification',
                    'Aggregation and processing pathways',
                    'Digital records',
                    'Future farmer services',
                  ].map((benefit) => (
                    <div className={styles.benefit} key={benefit}>
                      <i aria-hidden="true">✓</i>
                      {benefit}
                    </div>
                  ))}
                </div>
                <Link href="/auth/supplier-register" className={cx(styles.btn, styles.outline)}>
                  Become a DOVA Supplier ↗
                </Link>
              </Reveal>
              <Reveal as="article" className={cx(styles.audienceCard, styles.darkCard)}>
                <h3>For Customers &amp; Businesses</h3>
                <p>
                  Source food through one connected platform — from browsing and ordering to available
                  fulfillment options.
                </p>
                <div className={styles.benefits}>
                  {[
                    'Browse products',
                    'Order and pay',
                    'Receive through available fulfillment',
                    'Repeat or source in bulk as the catalog grows',
                  ].map((benefit, i) => (
                    <div className={styles.benefit} key={benefit}>
                      <i aria-hidden="true">{String(i + 1).padStart(2, '0')}</i>
                      {benefit}
                    </div>
                  ))}
                </div>
                <Link href="/marketplace" className={cx(styles.btn, styles.gold)}>
                  Source With DOVA ↗
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        <section className={cx(styles.section, styles.dark)} id="ai">
          <div className={cx(styles.container, styles.aiGrid)}>
            <Reveal>
              <div className={styles.eyebrow}>DOVA AI</div>
              <h2>Technology that supports the agricultural network.</h2>
              <p className={styles.aiLead}>
                DOVA AI sits as a technology layer inside the wider ecosystem. Its agricultural role
                includes helping users explore crop questions and possible plant-health issues from
                images, while keeping the language appropriately cautious.
              </p>
              <div className={cx(styles.benefits, styles.aiBenefits)}>
                {[
                  { icon: '✦', label: 'Crop and farming questions' },
                  { icon: '⌕', label: 'Photo-based plant issue assistance' },
                  { icon: '⌁', label: 'DOVA product and ecosystem guidance' },
                ].map((item) => (
                  <div className={styles.benefit} key={item.label}>
                    <i aria-hidden="true">{item.icon}</i>
                    {item.label}
                  </div>
                ))}
              </div>
              <Link href="/chat" className={cx(styles.btn, styles.gold)}>
                Explore DOVA AI ↗
              </Link>
            </Reveal>
            <Reveal className={styles.aiDemo}>
              <div className={styles.aiScreen}>
                <div className={styles.aiTop}>
                  <strong>🌿 DOVA AI</strong>
                  <small>Agricultural Assistant</small>
                </div>
                <div className={styles.bubble}>
                  <b>You</b>
                  <br />
                  What could be affecting these leaves?
                </div>
                <div className={cx(styles.bubble, styles.bubbleAnswer)}>
                  <b>DOVA AI</b>
                  <br />
                  Upload a clear photo and I can help identify possible issues and suggest practical
                  next steps.
                </div>
                <div className={styles.aiActions}>
                  {['🌱 Crop Help', '📷 Scan Photo', '🌾 Farming Questions', '🧺 DOVA Products'].map(
                    (action) => (
                      <div className={styles.aiAction} key={action}>
                        {action}
                      </div>
                    ),
                  )}
                </div>
                <div className={cx(styles.bubble, styles.bubbleInput)}>Ask DOVA AI anything…</div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className={cx(styles.section, styles.light)}>
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>Business Model</div>
              <h2>Build value layers around the food network.</h2>
              <p>
                DOVA can create value through the transactions and services that support sourcing,
                processing, fulfillment and future network capabilities.
              </p>
            </Reveal>
            <div className={styles.valueGrid}>
              {VALUE_LAYERS.map((layer, i) => (
                <Reveal as="article" className={styles.valueCard} key={layer.title}>
                  <div className={styles.valueSymbol} aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <h3>{layer.title}</h3>
                  <p>{layer.text}</p>
                </Reveal>
              ))}
            </div>
            <Reveal className={styles.valueFlow}>
              <span>Customers</span>
              <b aria-hidden="true">→</b>
              <span>Transactions</span>
              <b aria-hidden="true">→</b>
              <span className={styles.valueFlowActive}>DOVA Platform</span>
              <b aria-hidden="true">→</b>
              <span>Services</span>
              <b aria-hidden="true">→</b>
              <span>Revenue</span>
            </Reveal>
          </div>
        </section>

        <section className={cx(styles.section, styles.light)}>
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>DOVA At A Glance</div>
              <h2>Focused enough to launch. Built enough to grow.</h2>
              <p>
                A concise view of where DOVA is starting today and the direction of the larger
                platform.
              </p>
            </Reveal>
            <div className={styles.glanceGrid}>
              {GLANCE.map((item) => (
                <Reveal as="article" className={styles.glanceCard} key={item.label}>
                  <div className={styles.glanceLabel}>{item.label}</div>
                  <strong>{item.value}</strong>
                  <p>{item.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section} id="roadmap">
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>Vision &amp; Roadmap</div>
              <h2>Start with flour. Build the infrastructure around it.</h2>
              <p>
                Current, next and future capabilities are separated so planned infrastructure is not
                presented as already operational.
              </p>
            </Reveal>
            <div className={styles.roadmapGrid}>
              {ROADMAP.map((item) => (
                <Reveal as="article" className={cx(styles.roadCard, item.modifier)} key={item.label}>
                  <div className={styles.roadLabel}>{item.label}</div>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={cx(styles.section, styles.light)} id="about">
          <div className={styles.container}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>About DOVA Chain</div>
              <h2>Products first. Network next. Infrastructure over time.</h2>
              <p>
                DOVA is an African food-supply-chain technology company building infrastructure that
                connects agricultural supply with real demand.
              </p>
            </Reveal>
            <div className={styles.aboutGrid}>
              <Reveal as="article" className={styles.aboutCard}>
                <strong>Mission</strong>
                <h3>Connect agricultural supply with dependable food access.</h3>
                <p>
                  DOVA&apos;s platform is designed to make sourcing, processing, marketplace
                  distribution and fulfillment more organized for farmers, customers and businesses.
                </p>
              </Reveal>
              <Reveal as="article" className={styles.aboutCard}>
                <strong>Vision</strong>
                <h3>Build a connected food network across Africa.</h3>
                <p>
                  DOVA starts with products, builds the network around them, and grows toward broader
                  food infrastructure without presenting future capabilities as current operations.
                </p>
              </Reveal>
            </div>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.container}>
            <Reveal className={styles.ctaInner}>
              <div className={styles.eyebrow}>Build With DOVA</div>
              <h2>From Farm to Table. On Time, Every Time.</h2>
              <p>
                Whether you grow food, buy it for your household or source it for a business, DOVA is
                building a more connected path through the food supply chain.
              </p>
              <div className={styles.ctaActions}>
                <Link href="/marketplace" className={cx(styles.btn, styles.gold)}>
                  Shop Products ↗
                </Link>
                <Link href="/auth/supplier-register" className={cx(styles.btn, styles.ghost)}>
                  Join as a Farmer ↗
                </Link>
                <Link href="/contact" className={cx(styles.btn, styles.ghost)}>
                  Contact DOVA ↗
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.brand}>
                <span className={styles.brandName}>DOVA</span>
                <span className={styles.brandSuffix}>CHAIN</span>
              </Link>
              <p>Building a technology-enabled food supply chain, starting with flour.</p>
            </div>
            <div>
              <div className={styles.footerTitle}>Platform</div>
              <div className={styles.footerLinks}>
                <Link href="/marketplace">Products</Link>
                <Link href="/bundles">Bundles</Link>
                <a href="#how">How It Works</a>
                <Link href="/chat">DOVA AI</Link>
                <a href="#about">About Us</a>
              </div>
            </div>
            <div>
              <div className={styles.footerTitle}>Community</div>
              <div className={styles.footerLinks}>
                <a href="#farmers">For Farmers</a>
                <Link href="/auth/login">Customer Login</Link>
                <Link href="/auth/register">Register</Link>
                <Link href="/feedback">Feedback</Link>
              </div>
            </div>
            <div>
              <div className={styles.footerTitle}>Contact</div>
              <div className={styles.footerLinks}>
                <a href="mailto:officialdovachain@gmail.com">officialdovachain@gmail.com</a>
                <a href="tel:+2349032696825">+234 903 269 6825</a>
                <span>Nigeria</span>
                <Link href="/contact">Contact Us</Link>
              </div>
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 DOVA Chain. All rights reserved.</span>
            <span>From Farm to Table. On Time, Every Time.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
