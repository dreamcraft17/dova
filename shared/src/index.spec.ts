import { isValidEmail, isValidPassword, ORDER_STATUSES, ROLES, minOrderFor, minOrderMessage, minOrderShortfall, MIN_ORDER_PICKUP, MIN_ORDER_DELIVERY } from './index';

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
});
