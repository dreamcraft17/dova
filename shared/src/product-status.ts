export const LOW_STOCK_THRESHOLD = 20;

export type ProductStatusTab = 'available' | 'low_stock' | 'hidden';

/** Single source of truth for which tab a product belongs in, shared by the
 * supplier and admin dashboards. A hidden product is always 'hidden'
 * regardless of stock; an active product with stock below the threshold
 * (including exactly 0 — out of stock, not yet restocked) is 'low_stock'. */
export function getProductTab(product: { isActive: boolean; stockQuantity: number }): ProductStatusTab {
  if (!product.isActive) return 'hidden';
  if (product.stockQuantity < LOW_STOCK_THRESHOLD) return 'low_stock';
  return 'available';
}
