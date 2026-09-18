import Link from 'next/link';
import { ProductImage } from '../ProductImage';
import type { BundleSummary } from 'dova-shared';

export type BundleCardProps = {
  bundle: BundleSummary;
  variant?: 'featured' | 'grid';
};

export function BundleCard({ bundle, variant = 'grid' }: BundleCardProps) {
  const { id, name, description, imageUrl, bundlePrice, categoryName, isFeatured, computed } = bundle;
  const savingsPercentage = Math.round(computed.savingsPercentage);

  return (
    <Link
      href={`/bundles/${id}`}
      className={`product-card product-card--${variant}`}
      aria-label={`View ${name}`}
    >
      <div className="pc-image">
        <ProductImage name={name} imageUrl={imageUrl} categoryName={categoryName} />
        {savingsPercentage > 0 && (
          <span className="pc-savings-badge">Save {savingsPercentage}%</span>
        )}
        {isFeatured && <span className="pc-featured-badge">Featured</span>}
      </div>
      <div className="pc-body">
        {variant === 'grid' && <p className="pc-category">{categoryName || 'Bundle'}</p>}
        <h3 className="pc-title">{name}</h3>
        {variant === 'featured' && description && <p className="pc-desc">{description}</p>}
        <p className="pc-meta">
          <span>📍 Curated by DOVA</span>
          <span className="stars" aria-label="5 stars">★★★★★</span>
        </p>
        <div className="pc-price-wrap">
          <p className="pc-price">₦ {bundlePrice.toLocaleString('en-NG')}</p>
          {computed.savingsAmount > 0 && (
            <del className="pc-regular-price" aria-label={`Regular price ₦ ${computed.individualTotal.toLocaleString('en-NG')}`}>
              ₦ {computed.individualTotal.toLocaleString('en-NG')}
            </del>
          )}
        </div>
        {variant === 'grid' && (
          <p className={`pc-stock${computed.isOutOfStock ? ' out-of-stock' : ''}`}>
            {computed.isOutOfStock ? 'Out of stock' : `${computed.availableQuantity} bundle(s) available`}
          </p>
        )}
        {variant === 'featured' && <span className="button small pc-cta">View Details →</span>}
      </div>
    </Link>
  );
}
