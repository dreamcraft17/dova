export type ProductUnit = 'kg' | 'L';

const LIQUID_NAME_PATTERN =
  /\b(milk|water|juice|drink|soda|wine|beer|\boil\b|vinegar|syrup)\b/i;
const SOLID_NAME_PATTERN =
  /\b(coffee|tea|egg|yogurt|flour|rice|pepper|sugar|chicken|salmon|banana|tomato|carrot|avocado|spinach|onion|potato|mango|beans|breast|wheat)\b/i;

/** Resolve display/stock unit from product name and category. */
export function productUnit(name: string, categoryName?: string): ProductUnit {
  const n = name.trim();
  if (SOLID_NAME_PATTERN.test(n)) return 'kg';
  if (LIQUID_NAME_PATTERN.test(n)) return 'L';
  if (categoryName === 'Beverages' && /\b(water|juice|drink)\b/i.test(n)) return 'L';
  return 'kg';
}

export function formatPricePerUnit(unit: ProductUnit): string {
  return unit === 'L' ? '/ L' : '/ kg';
}

export function quantityFieldLabel(unit: ProductUnit): string {
  return unit === 'L' ? 'Quantity (L)' : 'Quantity (kg)';
}

export function formatStockInUnit(quantity: number, unit: ProductUnit): string {
  return `${quantity} ${unit} in stock`;
}

export function formatStockAvailable(quantity: number, name: string, categoryName?: string): string {
  const unit = productUnit(name, categoryName);
  return `${quantity} ${unit} available`;
}

export function stockLimitMessage(quantity: number, name: string, categoryName?: string): string {
  const unit = productUnit(name, categoryName);
  return `Only ${quantity} ${unit} available in stock`;
}

export function formatQuantityWithUnit(
  quantity: number,
  name: string,
  categoryName?: string,
): string {
  const unit = productUnit(name, categoryName);
  const value = Number.isInteger(quantity) ? quantity : quantity.toFixed(2);
  return `${value} ${unit}`;
}
