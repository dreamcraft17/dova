import Head from 'next/head';
import Link from 'next/link';
import { Fragment, useEffect, useRef, useState } from 'react';
import type { ElementType, ReactNode } from 'react';
import { ArrowRight, Carrot, Citrus, Leaf, Wheat } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { DovaAiHelpTrigger, DovaAiHelpWidget } from '../components/DovaAiHelpWidget';
import { WhatsAppCommunity } from '../components/WhatsAppCommunity';
import DovaChainNavbar from '../components/DovaChainNavbar';
import { fraunces, manrope } from '../lib/fonts';
import styles from '../styles/home-v3.module.css';

const cx = (...names: (string | false | undefined)[]) => names.filter(Boolean).join(' ');

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [showToTop, setShowToTop] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? (y / max) * 100 : 0);
      setShowToTop(y > 700);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return { progress, showToTop };
}

function AnimatedStat({ value, label }: { value: number | string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [display, setDisplay] = useState<number | string>(typeof value === 'number' ? 0 : value);

  useEffect(() => {
    if (typeof value !== 'number') return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') {
      setDisplay(value);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        const start = performance.now();
        const duration = 1200;
        const tick = (t: number) => {
          const k = Math.min((t - start) / duration, 1);
          setDisplay(Math.round(value * (1 - Math.pow(1 - k, 3))));
          if (k < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div className={styles.stat} ref={ref}>
      <div className={styles.statNum}>{display}</div>
      <p>{label}</p>
    </div>
  );
}

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

const MARQUEE_ITEMS = [
  'Grains',
  'Fresh Vegetables',
  'Fresh Fruits',
  'Tubers & Roots',
  'Verified Farmers',
  'Farm to Business',
  'Processing',
  'Packaging',
  'Delivery',
  'Food Supply Chain',
];

const STATS: { value: number | string; label: string }[] = [
  { value: 8, label: 'Connected stages from farm to fulfillment' },
  { value: 4, label: 'Core product categories at launch' },
  { value: 1, label: 'Platform for farmers, businesses and customers' },
  { value: 'Africa', label: 'The scale we are building toward' },
];

const FAQ_ITEMS = [
  {
    q: 'What is DOVA Chain?',
    a: 'DOVA Chain is a digital farm-to-business marketplace and food supply chain platform connecting verified farmers and food producers with businesses and consumers.',
  },
  {
    q: 'Who can use the marketplace?',
    a: 'Households buying quality food, businesses sourcing in repeat or bulk volumes, and farmers or producers looking for dependable market access.',
  },
  {
    q: 'How does ordering work?',
    a: 'Browse the catalog, add products to your cart and complete your order. Product availability always reflects the live DOVA catalog.',
  },
  {
    q: 'How can farmers join the network?',
    a: 'Farmers and food producers can use the Join the DOVA Network button to get started. DOVA works with verified suppliers to keep quality dependable.',
  },
  {
    q: 'Where does DOVA operate?',
    a: 'DOVA is based in Nigeria and is building a wider network with the ambition to grow across Africa.',
  },
];

const LEGAL_ITEMS = [
  {
    id: 'terms',
    title: 'Terms & Conditions',
    heading: 'Use of DOVA Chain.',
    text: "By using this website or placing an order, you agree to use the platform lawfully and provide accurate information. Product descriptions, prices, availability, delivery estimates and promotions may change. Orders are subject to confirmation and availability. Nothing on this website is intended to remove or limit any consumer right that cannot lawfully be excluded under applicable Nigerian law.",
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    heading: 'Personal information.',
    text: 'DOVA Chain may collect information needed to provide the service, such as name, phone number, delivery address, account details, order information and support communications. Information should be used for legitimate business purposes such as account management, order fulfilment, customer support, security and service improvement, subject to applicable data-protection requirements.',
  },
  {
    id: 'returns',
    title: 'Returns & Refunds',
    heading: 'Order issues.',
    text: 'If an item arrives damaged, incorrect, incomplete or otherwise does not match the agreed order, contact DOVA promptly with your order details and supporting information. Refunds, replacements or other remedies will depend on the circumstances, the applicable product policy and applicable consumer-protection law.',
  },
  {
    id: 'delivery',
    title: 'Delivery Policy',
    heading: 'Delivery.',
    text: 'Delivery availability, fees and estimated times are shown or communicated for an order where applicable. Estimates are not guarantees and may be affected by location, traffic, weather, supplier availability or other operational circumstances.',
  },
  {
    id: 'cookies',
    title: 'Cookie Notice',
    heading: 'Cookies and similar technologies.',
    text: 'DOVA Chain may use necessary technologies to operate the website, remember preferences, maintain sessions, improve security and understand site usage. Where consent is required, appropriate choices should be provided.',
  },
  {
    id: 'suppliers',
    title: 'Supplier & Marketplace Notice',
    heading: 'Marketplace information.',
    text: 'Product availability and supplier information may change as the network develops. Suppliers are responsible for the accuracy of information they provide and for meeting applicable requirements for the products they offer.',
  },
];

const FEATURE_POINTS = [
  {
    title: 'Marketplace launch',
    text: 'A clear starting point for customers, farmers and businesses.',
  },
  {
    title: 'Growing catalog',
    text: 'Food and agricultural categories can expand as supply develops.',
  },
  {
    title: 'Infrastructure around food',
    text: 'Sourcing, processing, packaging, marketplace and fulfillment form the larger system.',
  },
];

/** Featured products are a fixed set of food categories, not live catalog items. */
type FeaturedFilter = 'all' | 'staples' | 'produce';

type FeaturedCategory = {
  id: string;
  filterGroup: Exclude<FeaturedFilter, 'all'>;
  badge: string;
  badgeSolid?: boolean;
  icon: ElementType;
  title: string;
  description: string;
  image: string;
  cta: string;
};

const FEATURED_CATEGORIES: FeaturedCategory[] = [
  {
    id: 'grains',
    filterGroup: 'staples',
    badge: 'Grains',
    badgeSolid: true,
    icon: Wheat,
    title: 'Grains',
    description: 'High-quality grains sourced from trusted farmers.',
    image: '/images/featured/grains.jpg',
    cta: 'Shop Grains',
  },
  {
    id: 'vegetables',
    filterGroup: 'produce',
    badge: 'Vegetables',
    icon: Leaf,
    title: 'Fresh Vegetables',
    description: 'Fresh, nutritious vegetables carefully selected for quality and freshness.',
    image: '/images/featured/vegetables.jpg',
    cta: 'Shop Vegetables',
  },
  {
    id: 'fruits',
    filterGroup: 'produce',
    badge: 'Fruits',
    icon: Citrus,
    title: 'Fresh Fruits',
    description: 'Naturally fresh fruits delivered with great taste and quality.',
    image: '/images/featured/fruits.jpg',
    cta: 'Shop Fruits',
  },
  {
    id: 'tubers',
    filterGroup: 'staples',
    badge: 'Root Crops',
    icon: Carrot,
    title: 'Tubers & Roots',
    description: 'Quality yams, potatoes, cassava, and other farm-fresh root crops.',
    image: '/images/featured/tubers.jpg',
    cta: 'Shop Tubers',
  },
];

const FEATURED_CHIPS: { id: FeaturedFilter; label: string }[] = [
  { id: 'all', label: 'Featured' },
  { id: 'all', label: 'Food Products' },
  { id: 'produce', label: 'Fresh Produce' },
  { id: 'staples', label: 'Staples' },
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
    label: 'Launch',
    value: 'DOVA Marketplace',
    text: 'Launching with a broader food and agricultural marketplace focus.',
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
    title: 'Marketplace launch',
    text: 'Customers, farmers, products, sourcing, marketplace access and available fulfillment.',
    modifier: undefined,
  },
  {
    label: 'Next',
    title: 'Supply expansion',
    text: 'More farmers, more food categories, aggregation and stronger business supply.',
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
  const { user, logout } = useAuth();
  const { count } = useCart();
  const [featuredFilter, setFeaturedFilter] = useState<FeaturedFilter>('all');
  const [aiOpen, setAiOpen] = useState(false);
  const { progress, showToTop } = useScrollProgress();

  // Admin and supplier accounts don't shop, matching the cart rules in Layout.
  const canShop = !user || user.role === 'customer';
  const dashboard =
    user?.role === 'admin' ? '/admin' : user?.role === 'supplier' ? '/supplier' : '/customer/profile';

  return (
    <div className={cx(styles.page, fraunces.variable, manrope.variable)}>
      <Head>
        <title>DOVA Chain — Food Supply Chain &amp; Agricultural Marketplace</title>
        <meta
          name="description"
          content="DOVA Chain connects trusted farmers with consumers and businesses through a technology-enabled food supply chain and agricultural marketplace."
        />
        <meta name="theme-color" content="#031F17" />
      </Head>

      <div className={styles.scrollProgress} style={{ width: `${progress}%` }} />
      <button
        type="button"
        className={cx(styles.toTop, showToTop && styles.toTopShow)}
        aria-label="Back to top"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      >
        ↑
      </button>

      <DovaChainNavbar
        user={user ? { fullName: user.fullName } : null}
        cartCount={count}
        canShop={canShop}
        dashboardHref={dashboard}
        onLogout={() => {
          void logout();
        }}
      />

      <main>
        <section className={styles.hero}>
          <div className={cx(styles.container, styles.heroGrid)}>
            <Reveal className={styles.heroCopy}>
              <div className={styles.eyebrow}>African Food Supply Chain</div>
              <h1>
                Building a better <em>food supply chain.</em>
              </h1>
              <p style={{ color: '#fff' }}>
                DOVA Chain connects trusted agricultural supply with consumers and businesses
                through sourcing, quality verification, marketplace access and reliable
                fulfillment.
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
                Now launching the DOVA marketplace · Built to grow across food and agriculture
              </div>
            </Reveal>

            <Reveal
              className={styles.heroVisual}
              aria-label="DOVA Chain agricultural marketplace visual"
            >
              <div className={styles.heroPhoto}>
                <img
                  src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=1400&q=82"
                  alt="Fresh agricultural produce at a market"
                />
              </div>
              <div className={styles.productOrbit}>
                <div className={styles.orbitPack} aria-hidden="true">
                  <img src="/images/logo.svg" alt="" className={styles.orbitPackLogo} />
                </div>
                <small>DOVA Chain Marketplace</small>
                <strong>Food &amp; Agricultural Products</strong>
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

        <div className={styles.marquee} aria-hidden="true">
          <div className={styles.marqueeTrack}>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <Fragment key={`${item}-${i}`}>
                <span>{item}</span>
                <i>✦</i>
              </Fragment>
            ))}
          </div>
        </div>

        <section className={cx(styles.stats, styles.deep)} aria-label="DOVA at a glance">
          <div className={cx(styles.container, styles.statsGrid)}>
            {STATS.map((stat) => (
              <AnimatedStat key={stat.label} value={stat.value} label={stat.label} />
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
          <div className={cx(styles.container, styles.platformFeature)}>
            <Reveal className={styles.platformArt} aria-label="DOVA Chain marketplace visual">
              <div className={styles.platformPanel} aria-hidden="true">
                <div className={styles.platformPanelInner}>
                  <img src="/images/logo.svg" alt="" className={styles.platformPanelLogo} />
                  <strong>
                    DOVA
                    <br />
                    CHAIN
                  </strong>
                  <span>AGRICULTURAL MARKETPLACE</span>
                </div>
              </div>
            </Reveal>
            <Reveal className={styles.featureCopy}>
              <div className={styles.eyebrow}>DOVA Marketplace</div>
              <h2>Launching the marketplace. Building for more.</h2>
              <p>
                DOVA is launching as a connected agricultural marketplace and supply-chain platform.
                The goal is to make it easier to discover, source, move and access quality food
                products while building the infrastructure to support a wider network.
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

        <section className={styles.fpSection} id="marketplace" aria-labelledby="fp-heading">
          <div className={styles.container}>
            <div className={styles.fpChips} role="group" aria-label="Product categories">
              {FEATURED_CHIPS.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  className={cx(styles.fpChip, featuredFilter === chip.id && styles.fpChipActive)}
                  aria-pressed={featuredFilter === chip.id}
                  onClick={() => setFeaturedFilter(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
            </div>

            <div className={styles.fpHead}>
              <div>
                <h2 id="fp-heading">Featured Products</h2>
                <p>Fresh food from trusted farmers, delivered to you.</p>
              </div>
              <Link href="/marketplace" className={styles.fpAll}>
                View all products
              </Link>
            </div>

            <div className={styles.fpGrid}>
              {FEATURED_CATEGORIES.map((category) => {
                const CategoryIcon = category.icon;
                if (featuredFilter !== 'all' && featuredFilter !== category.filterGroup) return null;
                return (
                  <article className={styles.fpCard} key={category.id}>
                    <Link className={styles.fpMedia} href="/marketplace" tabIndex={-1} aria-hidden="true">
                      <img src={category.image} alt="" />
                      <span className={cx(styles.fpBadge, category.badgeSolid && styles.fpBadgeSolid)}>
                        <CategoryIcon aria-hidden="true" />
                        {category.badge}
                      </span>
                    </Link>
                    <div className={styles.fpBody}>
                      <h3 className={styles.fpTitle}>{category.title}</h3>
                      <p className={styles.fpDesc}>{category.description}</p>
                      <Link href="/marketplace" className={styles.fpBtn}>
                        {category.cta}
                        <ArrowRight aria-hidden="true" />
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className={cx(styles.section, styles.farmersSection)} id="farmers">
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
              <DovaAiHelpTrigger onClick={() => setAiOpen(true)} />
            </Reveal>
            <Reveal className={styles.aiDemo}>
              <div className={styles.aiScreen}>
                <div className={styles.aiTop}>
                  <strong> DOVA AI</strong>
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

        <section className={cx(styles.section, styles.light, styles.businessSection)}>
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

        <section className={cx(styles.section, styles.light, styles.glanceSection)}>
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
              <h2>Launch the marketplace. Build the infrastructure around it.</h2>
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

        <section className={cx(styles.section, styles.light)} id="faq">
          <div className={cx(styles.container, styles.faqWrap)}>
            <Reveal className={styles.sectionHead}>
              <div className={styles.eyebrow}>Questions</div>
              <h2>
                Everything you need to know about <em>DOVA</em>.
              </h2>
              <p>Straight answers about how the marketplace and food supply chain work.</p>
            </Reveal>
            <Reveal className={styles.faqList}>
              {FAQ_ITEMS.map((item, i) => (
                <details key={item.q} open={i === 0}>
                  <summary>{item.q}</summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>

        <section className={styles.cta}>
          <div className={styles.container}>
            <Reveal className={styles.ctaInner}>
              <div className={styles.eyebrow}>Build With DOVA</div>
              <h2>Connecting farm, marketplace and customer.</h2>
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
                <img src="/images/logo.svg" alt="" className={styles.brandLogo} />
                <span className={styles.brandName}>DOVA</span>
                <span className={styles.brandSuffix}>CHAIN</span>
              </Link>
              <p>
                Connecting agricultural supply with real demand through a modern marketplace and
                food supply chain.
              </p>
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
              <div className={styles.footerTitle}>Support</div>
              <div className={styles.footerLinks}>
                <a href="mailto:officialdovachain@gmail.com">officialdovachain@gmail.com</a>
                <a href="tel:+2349032696825">+234 903 269 6825</a>
                <span>Nigeria</span>
                <Link href="/contact">Contact Us</Link>
              </div>
            </div>
            <div>
              <div className={styles.footerTitle}>Legal</div>
              <div className={styles.footerLinks}>
                <Link href="/terms-of-service">Terms &amp; Conditions</Link>
                <Link href="/privacy-policy">Privacy Policy</Link>
                <Link href="/terms-of-service#cancellation-refunds-returns">Returns &amp; Refunds</Link>
                <Link href="/terms-of-service#delivery">Delivery Policy</Link>
                <Link href="/privacy-policy#cookies">Cookie Notice</Link>
              </div>
            </div>
          </div>
          <div className={styles.legalArea} id="legal">
            <div className={styles.legalTitle}>Legal &amp; Customer Information</div>
            <div className={styles.legalGrid}>
              {LEGAL_ITEMS.map((item) => (
                <details key={item.id} id={item.id}>
                  <summary>{item.title}</summary>
                  <div className={styles.legalCopy}>
                    <strong>{item.heading}</strong> {item.text}
                  </div>
                </details>
              ))}
            </div>
            <div className={styles.legalLinks}>
              {LEGAL_ITEMS.map((item) => (
                <a href={`#${item.id}`} key={item.id}>
                  {item.title}
                </a>
              ))}
            </div>
            <div className={styles.legalNote}>
              Legal information on this website is provided for general customer information and
              should be reviewed against DOVA Chain&apos;s actual operating policies and applicable
              Nigerian requirements before launch. Where a dedicated policy page exists, that page
              should take precedence over this summary.
            </div>
          </div>
          <div className={styles.footerBottom}>
            <span>© 2026 DOVA Chain. All rights reserved.</span>
            <span>Connecting farm, marketplace and customer.</span>
          </div>
        </div>
      </footer>
      <DovaAiHelpWidget open={aiOpen} onClose={() => setAiOpen(false)} />
      <WhatsAppCommunity />
    </div>
  );
}
