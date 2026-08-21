const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80';

/** Unsplash photo IDs that no longer resolve — used to refresh stale DB rows. */
export const BROKEN_IMAGE_IDS = [
  '1553279768',
  '1610832958506',
  '1592924357388',
  '1598170845058',
  '1574323565832',
  '1537641319766',
  '1607623814075',
] as const;

/** Category fallbacks when a product has no explicit image mapping. */
export const CATEGORY_IMAGES: Record<string, string> = {
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  Fruits: 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80',
  Dairy: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80',
  Grains: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  Meat: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80',
  Seafood: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  Beverages: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=800&q=80',
  Pantry: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
};

/** Product-specific images (override category defaults). */
export const PRODUCT_IMAGES: Record<string, string> = {
  'Fresh Tomatoes': 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=800&q=80',
  'Organic Bananas': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&q=80',
  'Farm Milk': 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=800&q=80',
  'Premium Rice': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
  'Crisp Carrots': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80',
  'Avocado Hass': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&q=80',
  'Free Range Eggs': 'https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=800&q=80',
  'Whole Wheat Flour': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80',
  'Chicken Breast': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
  'Atlantic Salmon': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=800&q=80',
  'Palm Sugar': 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800&q=80',
  'Coconut Water': 'https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?w=800&q=80',
  'Red Onions': 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800&q=80',
  'Sweet Potatoes': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80',
  'Greek Yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800&q=80',
  'Arabica Coffee': 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80',
  'Fresh Spinach': 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800&q=80',
  'Mango Harum Manis': 'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80',
  'Black Pepper': 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=800&q=80',
  'Cooking Oil': 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
  'UAT Sample Greens': 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&q=80',
  'UAT Sample Grain Pack': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&q=80',
};

export function productImageUrl(name: string, categoryName?: string) {
  return PRODUCT_IMAGES[name] || (categoryName && CATEGORY_IMAGES[categoryName]) || DEFAULT_IMAGE;
}

export function isBrokenProductImageUrl(url?: string | null) {
  if (!url) return true;
  return BROKEN_IMAGE_IDS.some((id) => url.includes(id));
}

export function shouldRefreshCatalogImage(name: string, url?: string | null) {
  if (!(name in PRODUCT_IMAGES)) return false;
  return isBrokenProductImageUrl(url);
}
