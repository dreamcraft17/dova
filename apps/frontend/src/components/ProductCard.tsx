import Link from 'next/link';
import { ProductImage } from './ProductImage';
import { formatPricePerUnitLabel, formatStockAvailableLabel, productUnitLabel } from 'dova-shared';

export type ProductCardItem = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  price: number;
  href: string;
  categoryName?: string;
  supplierName?: string;
  stockQuantity?: number;
  unitLabel?: string;
};

type ProductCardProps = {
  product: ProductCardItem;
  variant?: 'featured' | 'grid';
};

export function ProductCard({ product, variant = 'grid' }: ProductCardProps) {
  const { href, name, imageUrl, description, price, categoryName, supplierName, stockQuantity } =
    product;

  const unitLabel = productUnitLabel(name, categoryName, product.unitLabel);

  return (
    <Link
      href={href}
      className={`product-card product-card--${variant}`}
      aria-label={`View ${name}`}
    >
      <div className="pc-image">
        <ProductImage name={name} imageUrl={imageUrl} categoryName={categoryName} />
      </div>
      <div className="pc-body">
        {variant === 'grid' && categoryName && (
          <p className="pc-category">{categoryName}</p>
        )}
        <h3 className="pc-title">{name}</h3>
        {variant === 'featured' && description && (
          <p className="pc-desc">{description}</p>
        )}
        <p className="pc-meta">
          <span>📍 {variant === 'grid' ? (supplierName ?? 'Verified supplier') : 'Verified supplier'}</span>
          <span className="stars" aria-label="5 stars">★★★★★</span>
        </p>
        {price > 0 && (
          <p className="pc-price">
            ₦ {price.toLocaleString('en-NG')} {formatPricePerUnitLabel(unitLabel)}
          </p>
        )}
        {variant === 'grid' && stockQuantity !== undefined && (
          <p className="pc-stock">{formatStockAvailableLabel(stockQuantity, unitLabel)}</p>
        )}
        {variant === 'featured' && (
          <span className="button small pc-cta">View Details →</span>
        )}
      </div>
    </Link>
  );
}
