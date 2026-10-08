import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order, Product } from 'dova-shared';
import { DatabaseService } from './database.service';
import { AppStateService } from './app-state.service';

@Injectable()
export class SupplierService {
  constructor(
    private readonly database: DatabaseService,
    private readonly state: AppStateService,
  ) {}

  async supplierFor(userId: string) {
    const stored = await this.database.findSupplierByUser(userId);
    const s = stored ?? this.state.suppliers.find((x) => x.userId === userId);
    if (!s || s.status !== 'approved') throw new ForbiddenException('Supplier approval required');
    return s;
  }

  async supplierStatus(userId: string) {
    const stored = await this.database.findSupplierByUser(userId);
    const s = stored ?? this.state.suppliers.find((x) => x.userId === userId);
    if (!s) throw new NotFoundException('Supplier application not found');
    return { id: s.id, businessName: s.businessName, status: s.status, rejectionReason: (s as any).rejectionReason, documentUrl: s.documentUrl };
  }

  async supplierProducts(userId: string) {
    const s = await this.supplierFor(userId);
    if (this.database.enabled) return (await this.database.listSupplierProducts(s.id)) ?? [];
    return this.state.products.filter((p) => p.supplierId === s.id);
  }

  private validateProduct(body: any) {
    if (
      !body.name ||
      !body.description ||
      Number(body.price) < 1000 ||
      !Number.isInteger(Number(body.quantity)) ||
      Number(body.quantity) < 1 ||
      !body.categoryId
    ) {
      throw new BadRequestException('Invalid product data');
    }
  }

  async addSupplierProduct(userId: string, body: any) {
    const s = await this.supplierFor(userId);
    this.validateProduct(body);
    const stored = await this.database.createSupplierProduct(s.id, body);
    if (stored) return stored;
    const category = this.state.categories.find((c) => c.id === body.categoryId);
    if (!category) throw new BadRequestException('Invalid category');
    const product: Product = {
      id: randomUUID(),
      supplierId: s.id,
      supplierName: s.businessName,
      name: body.name,
      description: body.description,
      price: Number(body.price),
      stockQuantity: Number(body.quantity),
      categoryId: category.id,
      categoryName: category.name,
      imageUrl: body.imageUrl,
      isActive: true,
    };
    this.state.products.unshift(product);
    return product;
  }

  async updateSupplierProduct(userId: string, productId: string, body: any) {
    const s = await this.supplierFor(userId);
    this.validateProduct(body);
    const stored = await this.database.updateSupplierProduct(s.id, productId, body);
    if (stored) return stored;
    const product = this.state.products.find((p) => p.id === productId && p.supplierId === s.id);
    if (!product) throw new NotFoundException('Product not found');
    const category = this.state.categories.find((c) => c.id === body.categoryId);
    if (!category) throw new BadRequestException('Invalid category');
    Object.assign(product, {
      name: body.name,
      description: body.description,
      price: Number(body.price),
      stockQuantity: Number(body.quantity),
      categoryId: category.id,
      categoryName: category.name,
      imageUrl: body.imageUrl ?? product.imageUrl,
      isActive: product.isActive,
    });
    return product;
  }

  async removeSupplierProduct(userId: string, productId: string) {
    const s = await this.supplierFor(userId);
    await this.database.deleteSupplierProduct(s.id, productId);
    const product = this.state.products.find((p) => p.id === productId && p.supplierId === s.id);
    if (!product && !this.database.enabled) throw new NotFoundException('Product not found');
    if (product) product.isActive = false;
    return { message: 'Product removed' };
  }

  async setSupplierProductActive(userId: string, productId: string) {
    const s = await this.supplierFor(userId);
    await this.database.setSupplierProductActive(s.id, productId, true);
    const product = this.state.products.find((p) => p.id === productId && p.supplierId === s.id);
    if (product) product.isActive = true;
    return { message: 'Product activated' };
  }

  async adjustSupplierStock(userId: string, productId: string, quantity: number, reason: 'restock' | 'damage') {
    const s = await this.supplierFor(userId);
    const stored = await this.database.adjustStock(s.id, productId, quantity, reason);
    if (stored !== undefined) return { stockQuantity: stored };
    const product = this.state.products.find((p) => p.id === productId && p.supplierId === s.id && p.isActive);
    if (!product) throw new NotFoundException('Product not found');
    const delta = reason === 'damage' ? -quantity : quantity;
    if (product.stockQuantity + delta < 0) throw new BadRequestException('Insufficient stock');
    product.stockQuantity += delta;
    const entry = {
      id: randomUUID(),
      productId,
      supplierId: s.id,
      quantity: delta,
      reason,
      stockAfter: product.stockQuantity,
      createdAt: new Date().toISOString(),
    };
    this.state.stockAdjustments.unshift(entry);
    return { stockQuantity: product.stockQuantity };
  }

  async supplierStockHistory(userId: string, productId: string) {
    const s = await this.supplierFor(userId);
    return (
      (await this.database.stockHistory(s.id, productId)) ??
      this.state.stockAdjustments.filter((x) => x.supplierId === s.id && x.productId === productId)
    );
  }

  async supplierOrders(userId: string) {
    const s = await this.supplierFor(userId);
    const stored = await this.database.supplierOrders(s.id);
    if (stored) return stored;
    return this.state.orders.flatMap((order) =>
      order.items
        .filter((item) => item.product.supplierId === s.id)
        .map((item) => ({
          orderId: order.id,
          orderNumber: order.orderNumber,
          customerName: this.state.users.find((u) => u.id === order.customerId)?.fullName || order.deliveryName,
          deliveryName: order.deliveryName,
          deliveryAddress: order.deliveryAddress,
          createdAt: order.createdAt,
          itemId: item.id,
          productName: item.product.name,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.subtotal,
          status: item.supplierOrderStatus,
        })),
    );
  }

  async updateSupplierOrderStatus(userId: string, itemId: string, status: string) {
    const s = await this.supplierFor(userId);
    if (!['processing', 'shipped', 'delivered'].includes(status)) throw new BadRequestException('Invalid status');
    const stored = await this.database.updateSupplierOrderStatus(s.id, itemId, status);
    if (stored !== undefined) {
      if (!stored) throw new BadRequestException('Invalid status transition');
      return { status };
    }
    const order = this.state.orders.find((o) => o.items.some((i) => i.id === itemId && i.product.supplierId === s.id));
    const item = order?.items.find((i) => i.id === itemId);
    if (!item || !order) throw new NotFoundException('Order item not found');
    const next: Record<string, string> = { pending: 'processing', paid: 'processing', processing: 'shipped', shipped: 'delivered' };
    if (next[item.supplierOrderStatus] !== status) throw new BadRequestException('Invalid status transition');
    item.supplierOrderStatus = status;
    if (order.items.every((i) => i.supplierOrderStatus === status)) order.status = status as Order['status'];
    return { status };
  }
}
