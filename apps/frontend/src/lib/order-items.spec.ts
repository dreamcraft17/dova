import { groupOrderItems } from './order-items';
import type { OrderItem, Product } from 'dova-shared';

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 'p1',
    supplierId: 's1',
    supplierName: 'Farm Co',
    name: 'Tomatoes',
    description: '',
    price: 500,
    stockQuantity: 100,
    categoryId: 'c1',
    categoryName: 'Vegetables',
    isActive: true,
    ...overrides,
  };
}

function orderItem(overrides: Partial<OrderItem> = {}): OrderItem {
  return {
    id: 'oi1',
    product: product(),
    quantity: 1,
    unitPrice: 500,
    subtotal: 500,
    supplierOrderStatus: 'pending',
    ...overrides,
  };
}

describe('groupOrderItems', () => {
  it('passes plain product items through untouched and keeps their order', () => {
    const items = [
      orderItem({ id: 'a', product: product({ id: 'p-a', name: 'Rice' }) }),
      orderItem({ id: 'b', product: product({ id: 'p-b', name: 'Beans' }) }),
    ];

    const result = groupOrderItems(items);

    expect(result).toEqual([
      { kind: 'product', item: items[0] },
      { kind: 'product', item: items[1] },
    ]);
  });

  it('folds items sharing a bundleId into one entry with summed subtotal', () => {
    const items = [
      orderItem({ id: 'a', bundleId: 'b1', bundleName: 'Starter Kit', bundleQuantity: 2, subtotal: 300 }),
      orderItem({ id: 'b', bundleId: 'b1', bundleName: 'Starter Kit', bundleQuantity: 2, subtotal: 200 }),
    ];

    const result = groupOrderItems(items);

    expect(result).toEqual([
      {
        kind: 'bundle',
        bundleId: 'b1',
        bundleName: 'Starter Kit',
        bundleQuantity: 2,
        subtotal: 500,
        components: items,
      },
    ]);
  });

  it('preserves overall order by first appearance when products and a bundle are interleaved', () => {
    const items = [
      orderItem({ id: 'a', product: product({ id: 'p-a', name: 'Rice' }) }),
      orderItem({ id: 'b', bundleId: 'b1', bundleName: 'Starter Kit', bundleQuantity: 1, subtotal: 300 }),
      orderItem({ id: 'c', product: product({ id: 'p-c', name: 'Beans' }) }),
      orderItem({ id: 'd', bundleId: 'b1', bundleName: 'Starter Kit', bundleQuantity: 1, subtotal: 150 }),
    ];

    const result = groupOrderItems(items);

    expect(result).toEqual([
      { kind: 'product', item: items[0] },
      {
        kind: 'bundle',
        bundleId: 'b1',
        bundleName: 'Starter Kit',
        bundleQuantity: 1,
        subtotal: 450,
        components: [items[1], items[3]],
      },
      { kind: 'product', item: items[2] },
    ]);
  });
});
