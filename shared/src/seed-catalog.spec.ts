import { SEED_CATALOG_SIZE, SEED_PRODUCT_CATALOG } from './seed-catalog';

describe('SEED_PRODUCT_CATALOG', () => {
  it('includes 22 SKUs including Farm Milk and does not include live Wheat Flour', () => {
    expect(SEED_CATALOG_SIZE).toBe(22);
    expect(SEED_PRODUCT_CATALOG.some((item) => item.name === 'Farm Milk')).toBe(true);
    expect(SEED_PRODUCT_CATALOG.some((item) => item.name === 'Wheat Flour')).toBe(false);
    expect(SEED_PRODUCT_CATALOG.find((item) => item.name === 'Whole Wheat Flour')?.price).toBe(42000);
  });
});
