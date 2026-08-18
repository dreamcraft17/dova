import { productImageUrl } from './product-images';

describe('productImageUrl', () => {
  it('returns product-specific images', () => {
    expect(productImageUrl('Farm Milk', 'Dairy')).toContain('1563636619');
    expect(productImageUrl('Fresh Tomatoes', 'Vegetables')).toContain('1592924357388');
  });

  it('falls back to category images', () => {
    expect(productImageUrl('Unknown Item', 'Seafood')).toContain('1519708227418');
  });
});
