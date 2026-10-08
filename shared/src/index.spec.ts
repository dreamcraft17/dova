import {
  cartBadgeCount,
  isValidEmail,
  isValidPassword,
  ORDER_STATUSES,
  passwordToggleState,
  ROLES,
  minOrderFor,
  minOrderMessage,
  minOrderShortfall,
  MIN_ORDER_PICKUP,
  MIN_ORDER_DELIVERY,
  type Cart,
} from './index';

describe('shared validation and constants', () => {
  it('validates email format', () => {
    expect(isValidEmail('user@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  it('enforces the eight-character password minimum', () => {
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
  });

  it('exposes the locked Week 1 role and order status values', () => {
    expect(ROLES).toEqual(['customer', 'supplier', 'admin']);
    expect(ORDER_STATUSES).toContain('pending');
    expect(ORDER_STATUSES).toContain('delivered');
  });

  it('enforces pickup and delivery minimum order values', () => {
    expect(MIN_ORDER_PICKUP).toBe(3000);
    expect(MIN_ORDER_DELIVERY).toBe(5000);
    expect(minOrderFor('pickup')).toBe(3000);
    expect(minOrderFor('delivery')).toBe(5000);
    expect(minOrderShortfall(2000, 'pickup')).toBe(1000);
    expect(minOrderShortfall(5000, 'delivery')).toBe(0);
    expect(minOrderMessage(2000, 'pickup')).toContain('1,000');
    expect(minOrderMessage(3000, 'pickup')).toBeUndefined();
    expect(minOrderMessage(4999, 'delivery')).toContain('1');
    expect(minOrderMessage(5000, 'delivery')).toBeUndefined();
  });

  it('counts cart badge by line items, not quantity (BUG-011)', () => {
    const cart: Cart = {
      items: [{
        id: '1',
        product: { id: 'p1', supplierId: 's1', supplierName: 'Farm', name: 'Tomatoes', description: '', price: 1000, stockQuantity: 10, categoryId: 'c1', categoryName: 'Vegetables', isActive: true },
        quantity: 5,
        subtotal: 5000,
        deliverySlot: 'morning',
      }],
      total: 5000,
    };
    expect(cartBadgeCount(cart)).toBe(1);
    expect(cartBadgeCount({ items: [], total: 0 })).toBe(0);
    expect(cartBadgeCount(null)).toBe(0);
  });

  it('maps password visibility to Eye when visible, EyeOff when hidden (BUG-010)', () => {
    expect(passwordToggleState(false)).toEqual({
      inputType: 'password',
      icon: 'eye-off',
      ariaLabel: 'Show password',
    });
    expect(passwordToggleState(true)).toEqual({
      inputType: 'text',
      icon: 'eye',
      ariaLabel: 'Hide password',
    });
  });

  it('UAT sample prices reach minimum order at 2 kg (BLOCKER)', () => {
    expect(1500 * 2).toBe(MIN_ORDER_PICKUP);
    expect(2500 * 2).toBe(MIN_ORDER_DELIVERY);
    expect(minOrderShortfall(1500 * 2, 'pickup')).toBe(0);
    expect(minOrderShortfall(2500 * 2, 'delivery')).toBe(0);
  });
});
