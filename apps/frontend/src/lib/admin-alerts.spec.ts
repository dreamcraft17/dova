import { buildAdminAlerts, countPendingProducts, formatAlertBadge, totalAdminAlerts } from './admin-alerts';

describe('buildAdminAlerts', () => {
  it('lists only sources that have something waiting, in a fixed order', () => {
    const alerts = buildAdminAlerts({ payouts: 2, suppliers: 1, products: 0 });
    expect(alerts.map((a) => a.key)).toEqual(['suppliers', 'payouts']);
    expect(alerts.map((a) => a.href)).toEqual(['/admin/suppliers', '/admin/finance']);
  });

  it('pluralises the label by count', () => {
    expect(buildAdminAlerts({ products: 1 })[0].label).toBe('1 product awaiting approval');
    expect(buildAdminAlerts({ products: 3 })[0].label).toBe('3 products awaiting approval');
  });

  it.each([undefined, 0, -1, NaN, Infinity])('ignores an unusable count (%s)', (count) => {
    expect(buildAdminAlerts({ suppliers: count })).toEqual([]);
  });

  it('returns nothing when every count is unknown', () => {
    expect(buildAdminAlerts({})).toEqual([]);
  });
});

describe('totalAdminAlerts / formatAlertBadge', () => {
  it('sums the counts across sources', () => {
    expect(totalAdminAlerts(buildAdminAlerts({ suppliers: 2, products: 1, payouts: 4 }))).toBe(7);
    expect(totalAdminAlerts([])).toBe(0);
  });

  it.each([
    [1, '1'],
    [9, '9'],
    [10, '9+'],
    [250, '9+'],
  ])('shows %d as %s', (total, text) => {
    expect(formatAlertBadge(total)).toBe(text);
  });
});

describe('countPendingProducts', () => {
  it('counts only products whose approval is pending', () => {
    expect(
      countPendingProducts([{ approvalStatus: 'pending' }, { approvalStatus: 'approved' }, { approvalStatus: 'rejected' }, {}, { approvalStatus: 'pending' }]),
    ).toBe(2);
  });
});
