import type { OrderItem } from 'dova-shared';

export type GroupedOrderItem =
  | { kind: 'bundle'; bundleId: string; bundleName: string; bundleQuantity: number; subtotal: number; components: OrderItem[] }
  | { kind: 'product'; item: OrderItem };

/**
 * A bundle purchase is exploded into one OrderItem row per component product at checkout
 * (each sharing the same bundleId/bundleName/bundleQuantity). This folds those rows back
 * into one entry per bundle so order-history UIs can show "Bundle: X × N" instead of N
 * confusingly-separate component rows.
 */
export function groupOrderItems(items: OrderItem[]): GroupedOrderItem[] {
  const grouped: GroupedOrderItem[] = [];
  const bundleIndex = new Map<string, number>();

  for (const item of items) {
    if (!item.bundleId) {
      grouped.push({ kind: 'product', item });
      continue;
    }

    const existingIndex = bundleIndex.get(item.bundleId);
    if (existingIndex === undefined) {
      bundleIndex.set(item.bundleId, grouped.length);
      grouped.push({
        kind: 'bundle',
        bundleId: item.bundleId,
        bundleName: item.bundleName ?? item.product.name,
        bundleQuantity: item.bundleQuantity ?? 1,
        subtotal: item.subtotal,
        components: [item],
      });
      continue;
    }

    const entry = grouped[existingIndex];
    if (entry.kind === 'bundle') {
      entry.subtotal += item.subtotal;
      entry.components.push(item);
    }
  }

  return grouped;
}
