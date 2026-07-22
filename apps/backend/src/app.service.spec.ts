import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

function makeService() {
  const database = {
    enabled: false,
    insertUser: jest.fn(),
    saveSession: jest.fn(),
    hasSession: jest.fn().mockResolvedValue(true),
    revokeSession: jest.fn(),
    categories: jest.fn().mockResolvedValue(undefined),
    listProducts: jest.fn().mockResolvedValue(undefined),
    findProduct: jest.fn().mockResolvedValue(undefined),
    getCart: jest.fn().mockResolvedValue(undefined),
    saveCart: jest.fn(),
    createOrderFromCart: jest.fn().mockResolvedValue(undefined),
    listOrders: jest.fn().mockResolvedValue(undefined),
    findOrder: jest.fn().mockResolvedValue(undefined),
    markOrderPaid: jest.fn(),
    setOrderPaymentReference: jest.fn(),
    logPayment: jest.fn(),
  };
  const redis = { enabled: false, set: jest.fn(), get: jest.fn(), del: jest.fn() };
  const service = new AppService(new JwtService({ secret: 'unit-test-secret' }), database as never, redis as never);
  return { service, database, redis };
}

describe('AppService', () => {
  describe('registration and authentication', () => {
    it('registers a customer with a hashed password and customer role', async () => {
      const { service, database } = makeService();
      const user = await service.register({ fullName: 'Jane Doe', email: 'JANE@example.com', password: 'password123', confirmPassword: 'password123' });

      expect(user).toMatchObject({ email: 'jane@example.com', fullName: 'Jane Doe', role: 'customer', isActive: true });
      expect(user).not.toHaveProperty('passwordHash');
      expect(database.insertUser).toHaveBeenCalledTimes(1);
    });

    it.each([
      { email: 'bad', password: 'password123', confirmPassword: 'password123' },
      { fullName: 'Jane', email: 'jane@example.com', password: 'short', confirmPassword: 'short' },
      { fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'different' },
    ])('rejects invalid registration data', async (body) => {
      const { service, database } = makeService();
      await expect(service.register(body)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects duplicate emails case-insensitively', async () => {
      const { service } = makeService();
      await service.register({ fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      await expect(service.register({ fullName: 'Other', email: 'JANE@example.com', password: 'password123', confirmPassword: 'password123' })).rejects.toThrow('Email already registered');
    });

    it('issues access and refresh tokens for valid credentials', async () => {
      const { service, database } = makeService();
      await service.register({ fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      const result = await service.login('JANE@example.com', 'password123');

      expect(result.user.email).toBe('jane@example.com');
      expect(result.accessToken.split('.')).toHaveLength(3);
      expect(result.refreshToken.split('.')).toHaveLength(3);
      expect(database.saveSession).toHaveBeenCalledTimes(2);
    });

    it('uses a generic error for invalid credentials', async () => {
      const { service } = makeService();
      await expect(service.login('missing@example.com', 'password123')).rejects.toEqual(expect.objectContaining({ message: 'Invalid credentials' }));
    });

    it('refreshes a valid refresh token and rejects revoked access', async () => {
      const { service, database } = makeService();
      await service.register({ fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      const session = await service.login('jane@example.com', 'password123');
      const refreshed = await service.refresh(session.refreshToken);
      expect(refreshed.user.id).toBe(session.user.id);
      await service.revoke(session.accessToken, session.refreshToken);
      await expect(service.userFromToken(session.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(database.revokeSession).toHaveBeenCalledWith(session.accessToken);
      expect(database.revokeSession).toHaveBeenCalledWith(session.refreshToken);
    });
  });

  describe('authorization and cart/order behavior', () => {
    it('seeds at least 20 products and paginates the public catalog', async () => {
      const { service } = makeService();
      const page = await service.listProducts('', '', 2, 12);
      expect(page.pagination.total).toBeGreaterThanOrEqual(20);
      expect(page.data).toHaveLength(8);
    });

    it('enforces role restrictions', () => {
      const { service } = makeService();
      const customer = service.users.find(user => user.role === 'customer');
      expect(customer).toBeUndefined();
      expect(() => service.requireRole(service.users[0], ['customer'])).toThrow(ForbiddenException);
      expect(() => service.requireRole(service.users[0], ['admin'])).not.toThrow();
    });

    it('adds a product to cart and calculates totals', async () => {
      const { service } = makeService();
      const product = service.products[0];
      const cart = await service.addCart('customer-id', product.id, 2);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].subtotal).toBe(product.price * 2);
      expect(cart.total).toBe(product.price * 2);
    });

    it('rejects quantities above stock', async () => {
      const { service } = makeService();
      const product = service.products[0];
      await expect(service.addCart('customer-id', product.id, product.stockQuantity + 1)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates an order and clears the customer cart', async () => {
      const { service } = makeService();
      const customerId = 'customer-id';
      const product = service.products[0];
      await service.addCart(customerId, product.id, 2);
      const order = await service.createOrder(customerId, { deliveryName: 'Jane Doe', deliveryAddress: 'Jakarta', deliveryPhone: '+62000000000' });

      expect(order.status).toBe('pending');
      expect(order.items[0].quantity).toBe(2);
      await expect(service.cart(customerId)).resolves.toEqual({ items: [], total: 0 });
      expect(product.stockQuantity).toBe(18);
    });

    it('initializes and verifies a mock payment for a pending order', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;
      try {
        const { service } = makeService();
        const customerId = 'payment-customer';
        await service.addCart(customerId, service.products[0].id, 1);
        const order = await service.createOrder(customerId, { deliveryName: 'Jane', deliveryAddress: 'Jakarta', deliveryPhone: '0812345678' });
        const payment = await service.initializePayment(customerId, order.id, order.totalAmount);
        expect(payment.mode).toBe('mock');
        const verified = await service.verifyPayment(customerId, payment.reference);
        expect(verified).toMatchObject({ orderId: order.id, status: 'paid' });
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('accepts a mock payment webhook without requiring a secret', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;
      try {
        const { service } = makeService();
        await expect(service.handlePaystackWebhook(undefined, { event: 'charge.success' })).resolves.toMatchObject({ received: true, mode: 'mock' });
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });
  });
});
