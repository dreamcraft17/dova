import { allocateBundlePrice, computeBundleAvailability, computeBundlePricing } from './index';

const product = (price: number, stockQuantity = 100, isActive = true) => ({ price, stockQuantity, isActive });

describe('computeBundlePricing', () => {
  it('computes individual total, savings amount, and percentage', () => {
    const result = computeBundlePricing(150, [
      { quantity: 2, product: product(50) },
      { quantity: 1, product: product(100) },
    ]);
    expect(result.individualTotal).toBe(200);
    expect(result.savingsAmount).toBe(50);
    expect(result.savingsPercentage).toBe(25);
  });

  it('clamps negative savings to zero', () => {
    const result = computeBundlePricing(500, [{ quantity: 1, product: product(100) }]);
    expect(result.savingsAmount).toBe(0);
  });
});

describe('computeBundleAvailability', () => {
  it('is the floor(stock/quantity) minimum across components', () => {
    const result = computeBundleAvailability([
      { quantity: 2, product: product(50, 9) },
      { quantity: 1, product: product(30, 20) },
    ]);
    expect(result.availableQuantity).toBe(4);
    expect(result.isOutOfStock).toBe(false);
  });

  it('is unavailable when any component is inactive', () => {
    const result = computeBundleAvailability([
      { quantity: 1, product: product(10, 50, false) },
      { quantity: 1, product: product(10, 50) },
    ]);
    expect(result.availableQuantity).toBe(0);
    expect(result.isOutOfStock).toBe(true);
  });

  it('is unavailable when any component has zero stock', () => {
    const result = computeBundleAvailability([{ quantity: 1, product: product(10, 0) }]);
    expect(result.isOutOfStock).toBe(true);
  });

  it('is unavailable for an empty bundle', () => {
    expect(computeBundleAvailability([]).isOutOfStock).toBe(true);
  });
});

describe('allocateBundlePrice', () => {
  it('allocates price proportional to each component share and sums exactly to the total charge', () => {
    const contents = [
      { productId: 'p1', quantity: 1, product: product(150) },
      { productId: 'p2', quantity: 1, product: product(50) },
    ];
    const allocations = allocateBundlePrice(160, 1, contents);

    const sum = allocations.reduce((total, a) => total + a.subtotal, 0);
    expect(sum).toBe(160);
    // p1 is 75% of the individual total (150/200), so it should get ~75% of the bundle price.
    expect(allocations[0].subtotal).toBeCloseTo(120, 2);
    expect(allocations[1].subtotal).toBeCloseTo(40, 2);
  });

  it('scales totalQuantity by bundleQuantity and charges bundlePrice per bundle unit', () => {
    const contents = [{ productId: 'p1', quantity: 2, product: product(10) }];
    const allocations = allocateBundlePrice(15, 3, contents);
    expect(allocations[0].totalQuantity).toBe(6);
    expect(allocations[0].subtotal).toBe(45);
  });

  it('reconciles rounding by having the last component absorb the remainder', () => {
    const contents = [
      { productId: 'p1', quantity: 1, product: product(1) },
      { productId: 'p2', quantity: 1, product: product(1) },
      { productId: 'p3', quantity: 1, product: product(1) },
    ];
    const allocations = allocateBundlePrice(10, 1, contents);
    const sum = allocations.reduce((total, a) => total + a.subtotal, 0);
    expect(sum).toBe(10);
  });
});
