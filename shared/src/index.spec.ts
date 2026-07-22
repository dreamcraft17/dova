import { isValidEmail, isValidPassword, ORDER_STATUSES, ROLES } from './index';

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
});
