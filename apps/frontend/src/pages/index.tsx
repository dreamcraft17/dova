import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { FeaturedGridSkeleton } from '../components/Loading';
import { ProductCard } from '../components/ProductCard';
import type { ProductCardItem } from '../components/ProductCard';
import { api } from '../lib/api';
import type { Product } from 'dova-shared';

const HOW = [
  {
    icon: '🔍',
    title: 'Browse Products',
    text: 'Explore fresh agricultural products from verified farmers and trusted suppliers.',
  },
  {
    icon: '🛒',
    title: 'Place Your Order',
    text: 'Select your preferred products, add them to your cart, and complete purchase easily.',
  },
  {
    icon: '🚚',
    title: 'Receive Fresh Delivery',
    text: 'Order today before 6:00 PM and receive high-quality agricultural products delivered fresh to your location tomorrow.',
  },
] as const;

const TRUST = [
  {
    icon: '✓',
    title: 'Verified Suppliers',
    text: 'Every supplier is carefully verified to ensure authenticity and product reliability.',
  },
  {
    icon: '🌿',
    title: 'Quality Products',
    text: 'Fresh agricultural products sourced directly from trusted farmers.',
  },
  {
    icon: '🚚',
    title: 'Reliable Delivery',
    text: 'Efficient logistics ensure products arrive safely and on time.',
  },
  {
    icon: '🤝',
    title: 'Transparent Marketplace',
    text: 'Honest, transparent relationships between farmers and buyers.',
  },
] as const;

const FALLBACK_FEATURED = [
  {
    id: 'f1',
    name: 'Premium Rice',
    description: 'Premium-quality rice harvested from trusted farmers.',
    imageUrl: '/images/product1.jpg',
    price: 0,
    href: '/products',
  },
  {
    id: 'f2',
    name: 'Premium Palm Oil',
    description: 'High-quality palm oil produced by verified farmers.',
    imageUrl: '/images/product2.jpg',
    price: 0,
    href: '/products',
  },
  {
    id: 'f3',
    name: 'Organic Corn',
    description: 'Fresh and naturally grown corn harvested with care.',
    imageUrl: '/images/product3.jpg',
    price: 0,
    href: '/products',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState<ProductCardItem[]>(FALLBACK_FEATURED);
  const [featuredLoading, setFeaturedLoading] = useState(true);

  useEffect(() => {
    api<{ data: Product[] }>('/products?page=1&limit=3')
      .then((r) => {
        if (!r.data?.length) return;
        setFeatured(
          r.data.map((p) => ({
            id: p.id,
            name: p.name,
            description: p.description || 'Fresh produce from a verified DOVA supplier.',
            imageUrl: p.imageUrl || '/images/product1.jpg',
            price: p.price,
            href: `/products/${p.id}`,
          })),
        );
      })
      .catch(() => undefined)
      .finally(() => setFeaturedLoading(false));
  }, []);

  return (
    <Layout>
      <section className="hero">
        <div className="hero-text">
          <h1>Grow Agriculture</h1>
          <p className="hero-sub">Directly From Verified Suppliers</p>
          <p className="lead">
            Buy fresh agricultural products directly from trusted farmers and verified suppliers
            through DOVA&apos;s secure marketplace.
          </p>
          <div className="hero-actions">
            <Link href="/products" className="button">
              Shop Now
            </Link>
            <Link href="/auth/supplier-register" className="button secondary">
              Become a Supplier
            </Link>
          </div>
        </div>
        <div className="hero-image">
          <img src="/images/farmer.jpg" alt="Farmer in the field" />
        </div>
      </section>

      <section className="delivery-banner">
        <span className="delivery-banner-icon">🚚</span>
        <div>
          <strong>Order today, delivered tomorrow.</strong>
          <span> Place your order before 6:00 PM for next-day delivery.</span>
        </div>
      </section>

      <section className="trust-strip">
        <span>✓ Verified suppliers</span>
        <span>✓ Fair market pricing</span>
        <span>✓ Reliable delivery</span>
        <span>🚚 Next-day delivery</span>
      </section>

      <section className="section">
        <h2 className="section-title">How DOVA Works</h2>
        <p className="section-sub">
          Connecting farmers and buyers through a simple, trusted, and efficient process.
        </p>
        <div className="how-grid">
          {HOW.map((item) => (
            <div className="how-card" key={item.title}>
              <div className="how-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <h2 className="section-title">Featured Products</h2>
        <p className="section-sub">Discover fresh agricultural products from verified suppliers.</p>
        {featuredLoading ? (
          <FeaturedGridSkeleton />
        ) : (
        <div className="featured-grid">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} variant="featured" />
          ))}
        </div>
        )}
      </section>

      <section className="supplier-cta">
        <div className="supplier-cta-text">
          <h2>Become a DOVA Supplier</h2>
          <p>
            Join our growing network of verified farmers and connect your agricultural products with
            buyers through a trusted, transparent marketplace.
          </p>
          <Link href="/auth/supplier-register" className="button">
            Become a Supplier
          </Link>
        </div>
        <div className="supplier-cta-image">
          <img src="/images/supplier.jpg" alt="DOVA supplier" />
        </div>
      </section>

      <section className="section trust">
        <h2 className="section-title">Why Choose DOVA?</h2>
        <p className="section-sub" style={{ marginBottom: 12, color: '#444', fontWeight: 500 }}>
          Trusted by Farmers. Chosen by Buyers.
        </p>
        <p className="section-sub wide">
          We build trust through verified suppliers, transparent sourcing, and reliable delivery to
          ensure every transaction is safe and dependable.
        </p>
        <div className="trust-grid">
          {TRUST.map((item) => (
            <div className="trust-card" key={item.title}>
              <div className="trust-icon">{item.icon}</div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
