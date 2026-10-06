import Link from 'next/link';
import { ProductImage } from '../ProductImage';
import { formatQuantityWithUnit } from 'dova-shared';
import type { BundleContentWithProduct } from 'dova-shared';

export type BundleContentsProps = {
  contents: BundleContentWithProduct[];
};

export function BundleContents({ contents }: BundleContentsProps) {
  if (!contents || contents.length === 0) {
    return (
      <div className="bundle-contents">
        <h3>What&apos;s included</h3>
        <p className="bundle-contents-empty">No products listed in this bundle.</p>
      </div>
    );
  }

  return (
    <div className="bundle-contents">
      <h3>What&apos;s included ({contents.length} items)</h3>
      <ul className="bundle-contents-list">
        {contents.map((c) => {
          const formattedQty = formatQuantityWithUnit(
            c.quantity,
            c.product.name,
            c.product.categoryName,
          );
          return (
            <li key={c.id || c.productId} className="bundle-contents-item">
              <ProductImage
                className="bundle-contents-thumb"
                name={c.product.name}
                imageUrl={c.product.imageUrl}
                categoryName={c.product.categoryName}
              />
              <div className="bundle-contents-info">
                {c.productId ? (
                  <Link href={`/products/${c.productId}`} className="bundle-contents-link">
                    {c.product.name}
                  </Link>
                ) : (
                  <span className="bundle-contents-name">{c.product.name}</span>
                )}
                <span className="bundle-contents-qty muted">× {formattedQty}</span>
              </div>
              <span className="bundle-contents-price muted">
                ₦ {(c.product.price * c.quantity).toLocaleString('en-NG')}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
