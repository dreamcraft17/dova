import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Cart, stockLimitMessage } from 'dova-shared';
import { DatabaseService } from './database.service';
import { RedisService } from './redis.service';
import { AppStateService } from './app-state.service';
import { CatalogService } from './catalog.service';

@Injectable()
export class CartService {
  constructor(
    private readonly database: DatabaseService,
    private readonly redis: RedisService,
    private readonly state: AppStateService,
    private readonly catalog: CatalogService,
  ) {}

  private cartKey(userId: string) {
    return `dova:cart:${userId}`;
  }

  async cart(userId: string): Promise<Cart> {
    const stored = await this.database.getCart(userId);
    if (stored) {
      this.state.carts.set(userId, stored);
      return stored;
    }
    const existing = this.state.carts.get(userId);
    if (existing) return existing;
    if (this.redis.enabled) {
      const cached = await this.redis.get(this.cartKey(userId));
      if (cached) {
        const cart = JSON.parse(cached) as Cart;
        this.state.carts.set(userId, cart);
        return cart;
      }
    }
    return { items: [], total: 0 };
  }

  async saveCart(userId: string, cart: Cart) {
    this.state.carts.set(userId, cart);
    await this.database.saveCart(userId, cart);
    if (this.redis.enabled) await this.redis.set(this.cartKey(userId), JSON.stringify(cart), 604800);
    return cart;
  }

  recalculate(cart: Cart) {
    cart.items.forEach((i) => (i.subtotal = i.quantity * i.product.price));
    cart.total = cart.items.reduce((sum, i) => sum + i.subtotal, 0);
  }

  async addCart(userId: string, productId: string, quantity: number, deliverySlot: 'morning' | 'evening') {
    if (!deliverySlot) throw new BadRequestException('Please select a delivery slot');
    const p = await this.catalog.product(productId);
    const cart = await this.cart(userId);
    const existing = cart.items.find((i) => i.product.id === productId);
    const newQty = (existing?.quantity || 0) + quantity;
    if (!Number.isFinite(quantity) || quantity < 1 || newQty > p.stockQuantity) {
      throw new BadRequestException(stockLimitMessage(p.stockQuantity, p.name, p.categoryName));
    }
    if (existing) {
      existing.quantity = newQty;
      existing.deliverySlot = deliverySlot;
    } else {
      cart.items.push({ id: randomUUID(), product: p, quantity, subtotal: 0, deliverySlot });
    }
    this.recalculate(cart);
    return this.saveCart(userId, cart);
  }

  async updateCart(userId: string, itemId: string, quantity?: number, deliverySlot?: 'morning' | 'evening') {
    const cart = await this.cart(userId);
    const item = cart.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException('Cart item not found');
    if (quantity !== undefined) {
      if (quantity < 1 || quantity > item.product.stockQuantity) throw new BadRequestException('Invalid quantity');
      item.quantity = quantity;
    }
    if (deliverySlot !== undefined) {
      item.deliverySlot = deliverySlot;
    }
    this.recalculate(cart);
    return this.saveCart(userId, cart);
  }

  async removeCart(userId: string, itemId: string) {
    const cart = await this.cart(userId);
    cart.items = cart.items.filter((i) => i.id !== itemId);
    this.recalculate(cart);
    return this.saveCart(userId, cart);
  }
}
