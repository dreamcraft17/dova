import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BundleService } from './bundle.service';
import { makeAppService } from './app.service.test-doubles';
import { CreateBundleDto } from './bundle.dto';

function setup() {
  const { service: appService, database } = makeAppService();
  const bundleService = new BundleService(database as never, appService);
  const [productA, productB] = appService.products;
  return { bundleService, appService, database, productA, productB };
}

function baseDto(productA: { id: string }, productB: { id: string }, overrides: Partial<CreateBundleDto> = {}): CreateBundleDto {
  return {
    name: 'Starter Bundle',
    description: 'Two staples bundled together',
    bundlePrice: 1,
    contents: [
      { productId: productA.id, quantity: 1 },
      { productId: productB.id, quantity: 1 },
    ],
    ...overrides,
  } as CreateBundleDto;
}

describe('BundleService (in-memory mode — database.enabled=false)', () => {
  it('rejects a bundle with duplicate products', async () => {
    const { bundleService, productA } = setup();
    const dto = baseDto(productA, productA, { bundlePrice: 1 });
    await expect(bundleService.createBundle('admin-1', dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects a bundle price at or above the individual total', async () => {
    const { bundleService, productA, productB } = setup();
    const individualTotal = productA.price + productB.price;
    const dto = baseDto(productA, productB, { bundlePrice: individualTotal });
    await expect(bundleService.createBundle('admin-1', dto)).rejects.toBeInstanceOf(BadRequestException);
  });

  it('creates a bundle and computes savings/availability', async () => {
    const { bundleService, productA, productB } = setup();
    const individualTotal = productA.price + productB.price;
    const bundlePrice = Number((individualTotal * 0.8).toFixed(2));
    const dto = baseDto(productA, productB, { bundlePrice });

    const detail = await bundleService.createBundle('admin-1', dto);

    expect(detail.status).toBe('active');
    expect(detail.contents).toHaveLength(2);
    expect(detail.computed.individualTotal).toBeCloseTo(individualTotal, 2);
    expect(detail.computed.savingsAmount).toBeCloseTo(individualTotal - bundlePrice, 2);
    expect(detail.computed.isOutOfStock).toBe(false);
    expect(detail.computed.availableQuantity).toBe(Math.min(
      Math.floor(productA.stockQuantity / 1),
      Math.floor(productB.stockQuantity / 1),
    ));
  });

  it('hides a bundle from customer listing once deactivated, but keeps it visible to admin', async () => {
    const { bundleService, productA, productB } = setup();
    const dto = baseDto(productA, productB, { bundlePrice: 1 });
    const created = await bundleService.createBundle('admin-1', dto);

    await bundleService.setBundleActive(created.id, false);

    await expect(bundleService.getCustomerBundle(created.id)).rejects.toBeInstanceOf(NotFoundException);
    const adminView = await bundleService.getAdminBundle(created.id);
    expect(adminView.status).toBe('inactive');
  });

  it('deleteBundle soft-deactivates rather than removing the bundle', async () => {
    const { bundleService, productA, productB } = setup();
    const created = await bundleService.createBundle('admin-1', baseDto(productA, productB, { bundlePrice: 1 }));

    const result = await bundleService.deleteBundle(created.id);

    expect(result).toEqual({ id: created.id, status: 'inactive' });
    const adminView = await bundleService.getAdminBundle(created.id);
    expect(adminView.status).toBe('inactive');
  });

  it('adds a bundle to the cart as one line and merges a repeat add', async () => {
    const { bundleService, appService, productA, productB } = setup();
    const created = await bundleService.createBundle('admin-1', baseDto(productA, productB, { bundlePrice: 1 }));

    await bundleService.addBundleToCart('user-1', { bundleId: created.id, quantity: 1, deliverySlot: 'morning' });
    const cartAfterFirstAdd = await appService.cart('user-1');
    expect(cartAfterFirstAdd.items).toHaveLength(1);
    expect(cartAfterFirstAdd.items[0].bundleId).toBe(created.id);
    expect(cartAfterFirstAdd.items[0].quantity).toBe(1);
    expect(cartAfterFirstAdd.items[0].bundleContents).toHaveLength(2);

    await bundleService.addBundleToCart('user-1', { bundleId: created.id, quantity: 2, deliverySlot: 'evening' });
    const cartAfterSecondAdd = await appService.cart('user-1');
    expect(cartAfterSecondAdd.items).toHaveLength(1);
    expect(cartAfterSecondAdd.items[0].quantity).toBe(3);
    expect(cartAfterSecondAdd.items[0].deliverySlot).toBe('evening');
  });

  it('rejects adding a bundle to cart beyond its available quantity', async () => {
    const { bundleService, productA, productB } = setup();
    const created = await bundleService.createBundle('admin-1', baseDto(productA, productB, { bundlePrice: 1 }));
    const detail = await bundleService.getCustomerBundle(created.id);

    await expect(
      bundleService.addBundleToCart('user-1', {
        bundleId: created.id,
        quantity: detail.computed.availableQuantity + 1,
        deliverySlot: 'morning',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
