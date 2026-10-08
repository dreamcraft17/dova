import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import {
  Bundle,
  BundleContentWithProduct,
  BundleDetail,
  BundleListResponse,
  computeBundleAvailability,
  computeBundlePricing,
  Product,
} from 'dova-shared';
import { AppService } from './app.service';
import { DatabaseService } from './database.service';
import { AddBundleToCartDto, CreateBundleDto, UpdateBundleDto } from './bundle.dto';

type InMemoryBundle = Bundle & { contents: Array<{ id: string; productId: string; quantity: number; position: number }> };

const BUNDLE_AS_PRODUCT_CATEGORY = 'Bundle';

@Injectable()
export class BundleService {
  /** In-memory mode only (FR-010) — mirrors AppService's own in-memory-array pattern. */
  private bundles: InMemoryBundle[] = [];

  constructor(private readonly database: DatabaseService, private readonly appService: AppService) {}

  private bundleAsProduct(bundle: Pick<Bundle, 'id' | 'name' | 'description' | 'bundlePrice' | 'imageUrl' | 'categoryId' | 'categoryName'>, availableQuantity: number): Product {
    return {
      id: bundle.id,
      supplierId: '',
      supplierName: 'DOVA Bundle',
      name: bundle.name,
      description: bundle.description,
      price: bundle.bundlePrice,
      stockQuantity: availableQuantity,
      categoryId: bundle.categoryId || '',
      categoryName: bundle.categoryName || BUNDLE_AS_PRODUCT_CATEGORY,
      imageUrl: bundle.imageUrl,
      isActive: true,
    };
  }

  /** Best-effort product lookup for bundle contents in in-memory mode: a missing/inactive/OOS
   * component makes the bundle unavailable (via computeBundleAvailability) rather than throwing,
   * so admin/customer bundle reads never crash on a stale reference. */
  private async resolveProductLoose(productId: string): Promise<Product> {
    try {
      return await this.appService.product(productId);
    } catch {
      return {
        id: productId, supplierId: '', supplierName: '', name: 'Unavailable product', description: '',
        price: 0, stockQuantity: 0, categoryId: '', categoryName: '', isActive: false,
      };
    }
  }

  private async resolveProductStrict(productId: string): Promise<Product> {
    try {
      return await this.appService.product(productId);
    } catch {
      throw new BadRequestException(`Product ${productId} not found or inactive`);
    }
  }

  private async hydrateInMemoryDetail(record: InMemoryBundle): Promise<BundleDetail> {
    const contents: BundleContentWithProduct[] = [];
    for (const content of record.contents) {
      contents.push({ ...content, bundleId: record.id, product: await this.resolveProductLoose(content.productId) });
    }
    const { contents: _contents, ...bundle } = record;
    return {
      ...bundle,
      contents,
      computed: { ...computeBundlePricing(record.bundlePrice, contents), ...computeBundleAvailability(contents) },
    };
  }

  private validateContents(dto: CreateBundleDto) {
    const ids = dto.contents.map((c) => c.productId);
    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException('A bundle cannot contain the same product twice');
    }
  }

  private async assertPriceBelowIndividualTotal(bundlePrice: number, contents: Array<{ quantity: number; product: Pick<Product, 'price'> }>) {
    const individualTotal = contents.reduce((sum, c) => sum + c.product.price * c.quantity, 0);
    if (bundlePrice >= individualTotal) {
      throw new BadRequestException('Bundle price must be less than the individual total of its contents');
    }
  }

  // ---- Customer ----

  async listCustomerBundles(search: string, categoryId: string, page: number, limit: number): Promise<BundleListResponse> {
    const stored = await this.database.listCustomerBundles(search, categoryId, page, limit);
    if (stored) return stored;
    const all = await Promise.all(
      this.bundles.filter((b) => b.status === 'active').map((b) => this.hydrateInMemoryDetail(b)),
    );
    const filtered = all.filter(
      (b) => (!search || b.name.toLowerCase().includes(search.toLowerCase())) && (!categoryId || b.categoryId === categoryId),
    );
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), pagination: { page, limit, total: filtered.length } };
  }

  async getCustomerBundle(id: string): Promise<BundleDetail> {
    const stored = await this.database.getCustomerBundle(id);
    if (stored) return stored;
    const record = this.bundles.find((b) => b.id === id && b.status === 'active');
    if (!record) throw new NotFoundException('Bundle not found');
    return this.hydrateInMemoryDetail(record);
  }

  async addBundleToCart(userId: string, dto: AddBundleToCartDto) {
    const detail = await this.getCustomerBundle(dto.bundleId);
    if (detail.computed.isOutOfStock) throw new BadRequestException('Bundle is currently out of stock');

    const cart = await this.appService.cart(userId);
    const existing = cart.items.find((item) => item.bundleId === dto.bundleId);
    const newQty = (existing?.quantity || 0) + dto.quantity;
    if (!Number.isFinite(dto.quantity) || dto.quantity < 1 || newQty > detail.computed.availableQuantity) {
      throw new BadRequestException(`Only ${detail.computed.availableQuantity} of "${detail.name}" are available`);
    }

    const productView = this.bundleAsProduct(detail, detail.computed.availableQuantity);
    const bundleContents = detail.contents.map((c) => ({ productId: c.productId, productName: c.product.name, quantity: c.quantity }));

    if (existing) {
      existing.quantity = newQty;
      existing.deliverySlot = dto.deliverySlot;
      existing.product = productView;
      existing.bundleContents = bundleContents;
    } else {
      cart.items.push({
        id: randomUUID(),
        product: productView,
        quantity: dto.quantity,
        subtotal: 0,
        deliverySlot: dto.deliverySlot,
        bundleId: dto.bundleId,
        bundleContents,
      });
    }
    this.appService.recalculate(cart);
    return this.appService.saveCart(userId, cart);
  }

  // ---- Admin ----

  async listAdminBundles(search: string, categoryId: string, status: string, page: number, limit: number): Promise<BundleListResponse> {
    const stored = await this.database.listAdminBundles(search, categoryId, status, page, limit);
    if (stored) return stored;
    const all = await Promise.all(this.bundles.map((b) => this.hydrateInMemoryDetail(b)));
    const filtered = all.filter(
      (b) =>
        (!search || b.name.toLowerCase().includes(search.toLowerCase())) &&
        (!categoryId || b.categoryId === categoryId) &&
        (!status || b.status === status),
    );
    const start = (page - 1) * limit;
    return { data: filtered.slice(start, start + limit), pagination: { page, limit, total: filtered.length } };
  }

  async getAdminBundle(id: string): Promise<BundleDetail> {
    const stored = await this.database.getAdminBundle(id);
    if (stored) return stored;
    const record = this.bundles.find((b) => b.id === id);
    if (!record) throw new NotFoundException('Bundle not found');
    return this.hydrateInMemoryDetail(record);
  }

  async createBundle(actorId: string, dto: CreateBundleDto): Promise<BundleDetail> {
    this.validateContents(dto);
    const resolvedContents = await Promise.all(
      dto.contents.map(async (c, index) => ({
        productId: c.productId,
        quantity: c.quantity,
        position: c.position ?? index,
        product: await this.resolveProductStrict(c.productId),
      })),
    );
    await this.assertPriceBelowIndividualTotal(dto.bundlePrice, resolvedContents);

    const id = await this.database.createBundle(actorId, dto);
    if (id) return this.getAdminBundle(id);

    const now = new Date().toISOString();
    const record: InMemoryBundle = {
      id: randomUUID(),
      name: dto.name,
      description: dto.description,
      categoryId: dto.categoryId,
      imageUrl: dto.imageUrl,
      bundlePrice: dto.bundlePrice,
      isFeatured: Boolean(dto.isFeatured),
      status: 'active',
      createdBy: actorId,
      createdAt: now,
      updatedAt: now,
      contents: resolvedContents.map((c) => ({ id: randomUUID(), productId: c.productId, quantity: c.quantity, position: c.position })),
    };
    this.bundles.push(record);
    return this.hydrateInMemoryDetail(record);
  }

  async updateBundle(id: string, dto: UpdateBundleDto): Promise<BundleDetail> {
    this.validateContents(dto);
    const resolvedContents = await Promise.all(
      dto.contents.map(async (c, index) => ({
        productId: c.productId,
        quantity: c.quantity,
        position: c.position ?? index,
        product: await this.resolveProductStrict(c.productId),
      })),
    );
    await this.assertPriceBelowIndividualTotal(dto.bundlePrice, resolvedContents);

    const updatedId = await this.database.updateBundle(id, dto);
    if (updatedId) return this.getAdminBundle(updatedId);

    const record = this.bundles.find((b) => b.id === id);
    if (!record) throw new NotFoundException('Bundle not found');
    record.name = dto.name;
    record.description = dto.description;
    record.categoryId = dto.categoryId;
    record.imageUrl = dto.imageUrl;
    record.bundlePrice = dto.bundlePrice;
    record.isFeatured = Boolean(dto.isFeatured);
    record.updatedAt = new Date().toISOString();
    record.contents = resolvedContents.map((c) => ({ id: randomUUID(), productId: c.productId, quantity: c.quantity, position: c.position }));
    return this.hydrateInMemoryDetail(record);
  }

  async setBundleActive(id: string, active: boolean): Promise<{ id: string; status: Bundle['status'] }> {
    const stored = await this.database.setBundleActive(id, active);
    if (stored) return stored;
    const record = this.bundles.find((b) => b.id === id);
    if (!record) throw new NotFoundException('Bundle not found');
    record.status = active ? 'active' : 'inactive';
    record.updatedAt = new Date().toISOString();
    return { id: record.id, status: record.status };
  }

  /** Deletion is always a safe deactivation — bundles may already be referenced by order history. */
  async deleteBundle(id: string): Promise<{ id: string; status: 'inactive' }> {
    await this.setBundleActive(id, false);
    return { id, status: 'inactive' };
  }
}
