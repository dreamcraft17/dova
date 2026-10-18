import { supplierShareRate } from './commission';

describe('supplierShareRate', () => {
  const original = process.env.DOVA_SUPPLIER_SHARE_RATE;
  afterEach(() => {
    if (original === undefined) delete process.env.DOVA_SUPPLIER_SHARE_RATE;
    else process.env.DOVA_SUPPLIER_SHARE_RATE = original;
  });

  it('defaults to 0.8 when unset', () => {
    delete process.env.DOVA_SUPPLIER_SHARE_RATE;
    expect(supplierShareRate()).toBe(0.8);
  });

  it('reads a valid configured rate', () => {
    process.env.DOVA_SUPPLIER_SHARE_RATE = '0.75';
    expect(supplierShareRate()).toBe(0.75);
  });

  it('falls back to 0.8 for out-of-range or non-numeric values', () => {
    for (const bad of ['0', '-0.2', '1.5', 'nope', '']) {
      process.env.DOVA_SUPPLIER_SHARE_RATE = bad;
      expect(supplierShareRate()).toBe(0.8);
    }
  });

  it('allows the boundary value 1', () => {
    process.env.DOVA_SUPPLIER_SHARE_RATE = '1';
    expect(supplierShareRate()).toBe(1);
  });
});
