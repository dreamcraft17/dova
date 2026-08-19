import {
  formatPricePerUnit,
  formatQuantityWithUnit,
  productUnit,
  quantityFieldLabel,
  stockLimitMessage,
} from './product-units';

describe('productUnit', () => {
  it('uses litres for liquid products such as milk and water', () => {
    expect(productUnit('Farm Milk', 'Dairy')).toBe('L');
    expect(productUnit('Coconut Water', 'Beverages')).toBe('L');
    expect(productUnit('Cooking Oil', 'Pantry')).toBe('L');
  });

  it('keeps weight units for solids including coffee and yogurt', () => {
    expect(productUnit('Fresh Tomatoes', 'Vegetables')).toBe('kg');
    expect(productUnit('Arabica Coffee', 'Beverages')).toBe('kg');
    expect(productUnit('Greek Yogurt', 'Dairy')).toBe('kg');
    expect(productUnit('Free Range Eggs', 'Dairy')).toBe('kg');
  });
});

describe('formatting helpers', () => {
  it('formats price and stock messages with the correct unit', () => {
    expect(formatPricePerUnit('L')).toBe('/ L');
    expect(formatPricePerUnit('kg')).toBe('/ kg');
    expect(quantityFieldLabel('L')).toBe('Quantity (L)');
    expect(stockLimitMessage(20, 'Farm Milk', 'Dairy')).toBe('Only 20 L available in stock');
    expect(stockLimitMessage(20, 'Fresh Tomatoes', 'Vegetables')).toBe(
      'Only 20 kg available in stock',
    );
    expect(formatQuantityWithUnit(2.5, 'Farm Milk', 'Dairy')).toBe('2.50 L');
  });
});
