import {
  clampBundleQuantity,
  formatBundleSavings,
  formatCartItemPrice,
  isBundleCartItem,
  validateBundleForm,
} from './bundles';
import type { CartItem, Product } from 'dova-shared';

describe('clampBundleQuantity', () => {
  it('clamps values below 1 to 1', () => {
    expect(clampBundleQuantity(0, 10)).toBe(1);
    expect(clampBundleQuantity(-5, 10)).toBe(1);
    expect(clampBundleQuantity('0', 10)).toBe(1);
  });

  it('clamps values above max to max', () => {
    expect(clampBundleQuantity(15, 10)).toBe(10);
    expect(clampBundleQuantity('99', 5)).toBe(5);
  });

  it('clamps non-integer or float numbers to integer floor', () => {
    expect(clampBundleQuantity(3.7, 10)).toBe(3);
  });

  it('returns 1 for NaN or invalid string input', () => {
    expect(clampBundleQuantity('abc', 10)).toBe(1);
    expect(clampBundleQuantity(NaN, 10)).toBe(1);
  });

  it('returns 0 when max is 0 (out of stock)', () => {
    expect(clampBundleQuantity(1, 0)).toBe(0);
    expect(clampBundleQuantity(5, 0)).toBe(0);
  });

  it('preserves valid numbers within range 1..max', () => {
    expect(clampBundleQuantity(1, 5)).toBe(1);
    expect(clampBundleQuantity(3, 5)).toBe(3);
    expect(clampBundleQuantity(5, 5)).toBe(5);
  });
});

describe('isBundleCartItem', () => {
  it('returns true when bundleId is defined', () => {
    expect(isBundleCartItem({ bundleId: 'b-1' } as CartItem)).toBe(true);
  });

  it('returns false when bundleId is undefined or empty', () => {
    expect(isBundleCartItem({ bundleId: undefined } as CartItem)).toBe(false);
    expect(isBundleCartItem({} as CartItem)).toBe(false);
  });
});

describe('formatCartItemPrice', () => {
  const dummyProduct: Product = {
    id: 'p1',
    supplierId: 's1',
    supplierName: 'Farm',
    name: 'Tomatoes',
    description: '',
    price: 1500,
    stockQuantity: 10,
    categoryId: 'c1',
    categoryName: 'Vegetables',
    isActive: true,
  };

  it('formats standard product item with unit', () => {
    const item = { product: dummyProduct, bundleId: undefined };
    const formatted = formatCartItemPrice(item, () => '/ kg');
    expect(formatted).toBe('₦ 1,500 / kg');
  });

  it('formats bundle item with / bundle suffix and no per-kg unit', () => {
    const bundleItem = {
      product: { ...dummyProduct, price: 5000, name: 'Family Bundle' },
      bundleId: 'bundle-1',
    };
    const formatted = formatCartItemPrice(bundleItem, () => '/ kg');
    expect(formatted).toBe('₦ 5,000 / bundle');
  });
});

describe('formatBundleSavings', () => {
  it('formats positive savings correctly with NGN locale', () => {
    expect(formatBundleSavings(2500, 20.4)).toBe('Save ₦ 2,500 (20%)');
  });

  it('returns null when savings is zero or negative', () => {
    expect(formatBundleSavings(0, 0)).toBeNull();
    expect(formatBundleSavings(-100, 0)).toBeNull();
  });
});

describe('validateBundleForm', () => {
  const validForm = {
    name: 'Fresh Veggie Pack',
    bundlePrice: 4000,
    individualTotal: 5000,
    contents: [
      { productId: 'p1', quantity: 2 },
      { productId: 'p2', quantity: 1 },
    ],
  };

  it('validates correct bundle form input', () => {
    expect(validateBundleForm(validForm)).toEqual({ isValid: true });
  });

  it('rejects empty or whitespace-only bundle name', () => {
    expect(validateBundleForm({ ...validForm, name: '' })).toEqual({
      isValid: false,
      error: 'Bundle name is required.',
    });
    expect(validateBundleForm({ ...validForm, name: '   ' })).toEqual({
      isValid: false,
      error: 'Bundle name is required.',
    });
  });

  it('rejects fewer than 2 products in contents', () => {
    expect(validateBundleForm({ ...validForm, contents: [{ productId: 'p1', quantity: 1 }] })).toEqual({
      isValid: false,
      error: 'Add at least 2 products to this bundle.',
    });
  });

  it('rejects duplicate products in contents', () => {
    expect(
      validateBundleForm({
        ...validForm,
        contents: [
          { productId: 'p1', quantity: 1 },
          { productId: 'p1', quantity: 2 },
        ],
      }),
    ).toEqual({
      isValid: false,
      error: 'A bundle cannot contain duplicate products.',
    });
  });

  it('rejects non-positive quantities', () => {
    expect(
      validateBundleForm({
        ...validForm,
        contents: [
          { productId: 'p1', quantity: 0 },
          { productId: 'p2', quantity: 1 },
        ],
      }),
    ).toEqual({
      isValid: false,
      error: 'All product quantities must be greater than zero.',
    });
  });

  it('rejects zero or negative bundle price', () => {
    expect(validateBundleForm({ ...validForm, bundlePrice: 0 })).toEqual({
      isValid: false,
      error: 'Bundle price must be greater than zero.',
    });
  });

  it('rejects bundle price greater than or equal to individual total', () => {
    expect(validateBundleForm({ ...validForm, bundlePrice: 5000, individualTotal: 5000 })).toEqual({
      isValid: false,
      error: 'Bundle price must be less than the individual total of its contents.',
    });
    expect(validateBundleForm({ ...validForm, bundlePrice: 6000, individualTotal: 5000 })).toEqual({
      isValid: false,
      error: 'Bundle price must be less than the individual total of its contents.',
    });
  });
});
