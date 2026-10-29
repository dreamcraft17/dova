export type AdminAlertKey = 'suppliers' | 'products' | 'payouts';

export type AdminAlertCounts = Partial<Record<AdminAlertKey, number>>;

export type AdminAlert = { key: AdminAlertKey; label: string; count: number; href: string };

const ALERT_DEFS: Array<{ key: AdminAlertKey; href: string; singular: string; plural: string }> = [
  { key: 'suppliers', href: '/admin/suppliers', singular: 'supplier awaiting approval', plural: 'suppliers awaiting approval' },
  { key: 'products', href: '/admin/products', singular: 'product awaiting approval', plural: 'products awaiting approval' },
  { key: 'payouts', href: '/admin/finance', singular: 'payout awaiting review', plural: 'payouts awaiting review' },
];

/** Turns raw counts into the bell's entries; unknown (failed to load) and zero counts are left out. */
export function buildAdminAlerts(counts: AdminAlertCounts): AdminAlert[] {
  return ALERT_DEFS.flatMap((def) => {
    const count = counts[def.key];
    if (typeof count !== 'number' || !Number.isFinite(count) || count < 1) return [];
    const whole = Math.floor(count);
    return [{ key: def.key, href: def.href, count: whole, label: `${whole} ${whole === 1 ? def.singular : def.plural}` }];
  });
}

export function totalAdminAlerts(alerts: AdminAlert[]): number {
  return alerts.reduce((sum, alert) => sum + alert.count, 0);
}

export function countPendingProducts(products: Array<{ approvalStatus?: string }>): number {
  return products.filter((product) => product.approvalStatus === 'pending').length;
}

export function formatAlertBadge(total: number): string {
  return total > 9 ? '9+' : String(total);
}
