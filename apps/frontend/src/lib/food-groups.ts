/**
 * DOVA launches as a general food marketplace, not around a single product. The homepage
 * therefore never hardcodes products: it groups whatever the backend returns into a small,
 * stable set of shopper-facing groups, so new categories and products show up on the
 * homepage without the layout being redesigned.
 */
export type FoodGroupId = 'staples' | 'grains' | 'flours' | 'produce' | 'farm' | 'other' | 'bundles';

export const FOOD_GROUPS: { id: FoodGroupId; label: string }[] = [
  { id: 'staples', label: 'Staples' },
  { id: 'grains', label: 'Grains' },
  { id: 'flours', label: 'Flours' },
  { id: 'produce', label: 'Fresh Produce' },
  { id: 'farm', label: 'Farm Products' },
  { id: 'other', label: 'Other Food Products' },
  { id: 'bundles', label: 'Bundles' },
];

/** First match wins, so the more specific groups are listed before the broader ones. */
const RULES: [FoodGroupId, RegExp][] = [
  ['flours', /\b(flour|flours|milled|meal|semolina|garri|fufu)\b/],
  ['grains', /\b(grain|grains|rice|maize|corn|millet|sorghum|wheat|cereal|bean|beans|cowpea)\b/],
  [
    'staples',
    /\b(staple|staples|pantry|tuber|tubers|root|roots|yam|cassava|potato|potatoes|plantain|oil|sugar|salt|spice|spices|pepper)\b/,
  ],
  ['produce', /\b(produce|vegetable|vegetables|fruit|fruits|fresh|green|greens|herb|herbs|leaf|leaves)\b/],
  [
    'farm',
    /\b(farm|dairy|milk|egg|eggs|meat|poultry|chicken|beef|goat|fish|seafood|livestock|honey|yogurt|yoghurt|cheese)\b/,
  ],
];

/**
 * Buckets a live catalog entry into one of the general food groups. Unrecognized categories
 * fall into "Other Food Products" rather than being hidden, so nothing silently disappears
 * from the homepage when a new category is created in the backend.
 */
export function foodGroupOf(categoryName?: string, productName?: string): FoodGroupId {
  const text = `${categoryName ?? ''} ${productName ?? ''}`.toLowerCase();
  for (const [id, pattern] of RULES) {
    if (pattern.test(text)) return id;
  }
  return 'other';
}
