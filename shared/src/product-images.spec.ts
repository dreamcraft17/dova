import { isBrokenProductImageUrl, productImageUrl, publicCatalogImageUrl, shouldRefreshCatalogImage } from './product-images';

describe('productImageUrl', () => {
  it('returns product-specific images', () => {
    expect(productImageUrl('Farm Milk', 'Dairy')).toContain('1563636619');
    expect(productImageUrl('Fresh Tomatoes', 'Vegetables')).toContain('1546094096');
    expect(productImageUrl('Mango Harum Manis', 'Fruits')).toContain('1560807707');
  });

  it('falls back to category images', () => {
    expect(productImageUrl('Unknown Item', 'Seafood')).toContain('1519708227418');
  });
});

describe('shouldRefreshCatalogImage', () => {
  it('flags broken or missing catalog image URLs', () => {
    expect(shouldRefreshCatalogImage('Mango Harum Manis', null)).toBe(true);
    expect(
      shouldRefreshCatalogImage(
        'Mango Harum Manis',
        'https://images.unsplash.com/photo-1553279768-8650fa948098?w=800&q=80',
      ),
    ).toBe(true);
    expect(
      shouldRefreshCatalogImage(
        'Mango Harum Manis',
        'https://images.unsplash.com/photo-1560807707-8cc77767d783?w=800&q=80',
      ),
    ).toBe(false);
  });

  it('ignores non-catalog products', () => {
    expect(isBrokenProductImageUrl('https://example.com/custom.jpg')).toBe(false);
    expect(shouldRefreshCatalogImage('Custom Supplier Item', null)).toBe(false);
  });
});

describe('publicCatalogImageUrl', () => {
  it('does not send inline data URLs to catalog clients', () => {
    const data = 'data:image/jpeg;base64,/9j/xxxx';
    expect(publicCatalogImageUrl('Wheat Flour', 'Grains', data)).not.toMatch(/^data:/);
    expect(publicCatalogImageUrl('Farm Milk', 'Dairy', 'https://api.dova.dntech.id/uploads/milk.jpg')).toBe(
      'https://api.dova.dntech.id/uploads/milk.jpg',
    );
  });
});
