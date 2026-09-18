import type { CartItem } from 'dova-shared';

/**
 * Clamps and sanitizes user input for bundle quantity.
 * Bundles can only be purchased in integer units between 1 and max.
 */
export function clampBundleQuantity(input: unknown, max: number): number {
  const safeMax = Math.max(0, Math.floor(max));
  if (safeMax <= 0) return 0;
  const num = typeof input === 'number' ? input : parseInt(String(input), 10);
  if (isNaN(num) || num < 1) return 1;
  return Math.min(Math.floor(num), safeMax);
}

/**
 * Checks if a cart line item represents a curated bundle.
 */
export function isBundleCartItem(item: Pick<CartItem, 'bundleId'>): boolean {
  return Boolean(item.bundleId);
}

/**
 * Returns formatted price text for cart items.
 * Bundles show flat price without per-kg/L units.
 */
export function formatCartItemPrice(
  item: Pick<CartItem, 'bundleId' | 'product'>,
  formatUnit: (name: string, cat?: string) => string,
): string {
  const formattedPrice = `₦ ${item.product.price.toLocaleString('en-NG')}`;
  if (item.bundleId) {
    return `${formattedPrice} / bundle`;
  }
  const unit = formatUnit(item.product.name, item.product.categoryName);
  return `${formattedPrice} ${unit}`;
}

/**
 * Formats savings information for a bundle card or detail page.
 */
export function formatBundleSavings(
  savingsAmount: number,
  savingsPercentage: number,
): string | null {
  if (savingsAmount <= 0) return null;
  return `Save ₦ ${savingsAmount.toLocaleString('en-NG')} (${Math.round(savingsPercentage)}%)`;
}

/**
 * Validates admin bundle creation/editing input before submitting to the API.
 */
export interface BundleFormValidationInput {
  name: string;
  bundlePrice: number;
  contents: Array<{ productId: string; quantity: number; price?: number }>;
  individualTotal?: number;
}

export function validateBundleForm(
  input: BundleFormValidationInput,
): { isValid: boolean; error?: string } {
  if (!input.name || !input.name.trim()) {
    return { isValid: false, error: 'Bundle name is required.' };
  }
  if (!input.contents || input.contents.length < 2) {
    return { isValid: false, error: 'Add at least 2 products to this bundle.' };
  }
  const ids = input.contents.map((c) => c.productId);
  if (new Set(ids).size !== ids.length) {
    return { isValid: false, error: 'A bundle cannot contain duplicate products.' };
  }
  for (const c of input.contents) {
    if (!c.quantity || c.quantity <= 0 || isNaN(c.quantity)) {
      return { isValid: false, error: 'All product quantities must be greater than zero.' };
    }
  }
  const price = Number(input.bundlePrice);
  if (!price || price <= 0 || isNaN(price)) {
    return { isValid: false, error: 'Bundle price must be greater than zero.' };
  }
  if (input.individualTotal !== undefined && price >= input.individualTotal) {
    return { isValid: false, error: 'Bundle price must be less than the individual total of its contents.' };
  }
  return { isValid: true };
}
