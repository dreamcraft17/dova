/** Demo / UAT marketplace catalog. Insert-only in production — never overwrite price or stock. */
export type SeedCatalogItem = { name: string; price: number; categoryName: string };

export const SEED_PRODUCT_CATALOG: SeedCatalogItem[] = [
  { name: 'Fresh Tomatoes', price: 25000, categoryName: 'Vegetables' },
  { name: 'Organic Bananas', price: 18000, categoryName: 'Fruits' },
  { name: 'Farm Milk', price: 22000, categoryName: 'Dairy' },
  { name: 'Premium Rice', price: 75000, categoryName: 'Grains' },
  { name: 'Crisp Carrots', price: 16000, categoryName: 'Vegetables' },
  { name: 'Avocado Hass', price: 30000, categoryName: 'Fruits' },
  { name: 'Free Range Eggs', price: 28000, categoryName: 'Dairy' },
  { name: 'Whole Wheat Flour', price: 42000, categoryName: 'Grains' },
  { name: 'Chicken Breast', price: 68000, categoryName: 'Meat' },
  { name: 'Atlantic Salmon', price: 125000, categoryName: 'Seafood' },
  { name: 'Palm Sugar', price: 24000, categoryName: 'Pantry' },
  { name: 'Coconut Water', price: 32000, categoryName: 'Beverages' },
  { name: 'Red Onions', price: 19000, categoryName: 'Vegetables' },
  { name: 'Sweet Potatoes', price: 23000, categoryName: 'Vegetables' },
  { name: 'Greek Yogurt', price: 36000, categoryName: 'Dairy' },
  { name: 'Arabica Coffee', price: 95000, categoryName: 'Beverages' },
  { name: 'Fresh Spinach', price: 17000, categoryName: 'Vegetables' },
  { name: 'Mango Harum Manis', price: 35000, categoryName: 'Fruits' },
  { name: 'Black Pepper', price: 27000, categoryName: 'Pantry' },
  { name: 'Cooking Oil', price: 58000, categoryName: 'Pantry' },
  { name: 'UAT Sample Greens', price: 1500, categoryName: 'Vegetables' },
  { name: 'UAT Sample Grain Pack', price: 2500, categoryName: 'Grains' },
];

export const SEED_CATALOG_SIZE = SEED_PRODUCT_CATALOG.length;
