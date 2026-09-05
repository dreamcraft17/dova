import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { FulfillmentType, Order, minOrderMessage } from 'dova-shared';
import { DatabaseService } from './database.service';
import { AppStateService } from './app-state.service';
import { AuthService } from './auth.service';
import { CartService } from './cart.service';

@Injectable()
export class OrderService {
  constructor(
    private readonly database: DatabaseService,
    private readonly state: AppStateService,
    private readonly auth: AuthService,
    private readonly cart: CartService,
  ) {}

  async databaseOrders(userId: string) {
    return this.database.listOrders(userId);
  }

  async databaseOrder(userId: string, orderId: string) {
    return this.database.findOrder(userId, orderId);
  }

  async createOrder(userId: string, body: any) {
    const customer = await this.auth.findUser(userId, true);
    if (customer && !customer.emailVerifiedAt) {
      throw new BadRequestException('Verify your email in Profile before placing an order.');
    }
    if (this.database.enabled) {
      try {
        const stored = await this.database.createOrderFromCart(userId, body);
        if (stored) {
          await this.database.recordPurchaseStock(stored.id);
          return stored;
        }
      } catch (error) {
        if (error instanceof BadRequestException) throw error;
        const message = error instanceof Error ? error.message : 'Unable to create order';
        if (/duplicate key|unique constraint/i.test(message)) {
          throw new BadRequestException('Unable to create order. Please refresh your cart and try again.');
        }
        throw new BadRequestException(message);
      }
    }
    const cart = await this.cart.cart(userId);
    if (!cart.items.length) throw new BadRequestException('Cart is empty');
    const fulfillmentType: FulfillmentType = body.fulfillmentType === 'pickup' ? 'pickup' : 'delivery';
    if (!body.deliveryName || !body.deliveryPhone) throw new BadRequestException('Delivery details are required');
    if (fulfillmentType === 'delivery' && (!body.deliveryAddress || String(body.deliveryAddress).length < 5)) {
      throw new BadRequestException('Delivery address is required');
    }
    const shortfallMsg = minOrderMessage(cart.total, fulfillmentType);
    if (shortfallMsg) throw new BadRequestException(shortfallMsg);
    const deliveryAddress =
      fulfillmentType === 'pickup' ? body.deliveryAddress || 'Pickup at DOVA hub' : body.deliveryAddress;
    cart.items.forEach((i) => {
      const p = this.state.products.find((item) => item.id === i.product.id);
      if (p) {
        p.stockQuantity -= i.quantity;
        this.state.stockAdjustments.unshift({
          id: randomUUID(),
          orderId: undefined,
          productId: p.id,
          supplierId: p.supplierId,
          quantity: -i.quantity,
          reason: 'purchase',
          stockAfter: p.stockQuantity,
          createdAt: new Date().toISOString(),
        });
      }
    });
    const order: Order = {
      id: randomUUID(),
      orderNumber: `DOVA-${Date.now().toString(36).toUpperCase()}`,
      customerId: userId,
      status: 'pending',
      totalAmount: cart.total,
      deliveryName: body.deliveryName,
      deliveryAddress,
      deliveryPhone: body.deliveryPhone,
      fulfillmentType,
      items: cart.items.map((i) => ({
        id: randomUUID(),
        product: i.product,
        quantity: i.quantity,
        unitPrice: i.product.price,
        subtotal: i.subtotal,
        supplierOrderStatus: 'pending',
      })),
      createdAt: new Date().toISOString(),
    };
    this.state.orders.unshift(order);
    this.state.stockAdjustments
      .filter(
        (entry) =>
          entry.reason === 'purchase' &&
          !entry.orderId &&
          order.items.some((item) => item.product.id === entry.productId),
      )
      .forEach((entry) => {
        entry.orderId = order.id;
      });
    await this.cart.saveCart(userId, { items: [], total: 0 });
    return order;
  }
}
