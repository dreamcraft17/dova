import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';

const SLOT = 'morning' as const;

function addToCart(service: AppService, userId: string, productId: string, quantity: number, deliverySlot: 'morning' | 'evening' = SLOT) {
  return service.addCart(userId, productId, quantity, deliverySlot);
}

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
    recordPurchaseStock: jest.fn(),
    listOrders: jest.fn().mockResolvedValue(undefined),
    findOrder: jest.fn().mockResolvedValue(undefined),
    findOrderByPaymentReference: jest.fn().mockResolvedValue(undefined),
    markOrderPaid: jest.fn(),
    setOrderPaymentReference: jest.fn(),
    logPayment: jest.fn(),
    findSupplierByUser: jest.fn().mockResolvedValue(undefined),
    findSupplierById: jest.fn().mockResolvedValue(undefined),
    insertSupplierProfile: jest.fn(),
    listSupplierProducts: jest.fn().mockResolvedValue(undefined),
    createSupplierProduct: jest.fn().mockResolvedValue(undefined),
    updateSupplierProduct: jest.fn().mockResolvedValue(undefined),
    deleteSupplierProduct: jest.fn(),
    adjustStock: jest.fn().mockResolvedValue(undefined),
    stockHistory: jest.fn().mockResolvedValue(undefined),
    supplierOrders: jest.fn().mockResolvedValue(undefined),
    updateSupplierOrderStatus: jest.fn().mockResolvedValue(undefined),
    adminDashboard: jest.fn().mockResolvedValue(undefined),
    pendingSuppliers: jest.fn().mockResolvedValue(undefined),
    setSupplierStatus: jest.fn(),
    adminUsers: jest.fn().mockResolvedValue(undefined),
    setUserActive: jest.fn(),
    adminProducts: jest.fn().mockResolvedValue(undefined),
    setProductActive: jest.fn(),
    adminOrders: jest.fn().mockResolvedValue(undefined),
    insertContactSubmission: jest.fn().mockResolvedValue(undefined),
    listContactSubmissions: jest.fn().mockResolvedValue(undefined),
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
      const cart = await addToCart(service, 'customer-id', product.id, 2);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].subtotal).toBe(product.price * 2);
      expect(cart.items[0].deliverySlot).toBe('morning');
      expect(cart.total).toBe(product.price * 2);
    });

    it('stores and updates delivery slot on cart items', async () => {
      const { service } = makeService();
      const product = service.products[0];
      const cart = await addToCart(service, 'slot-customer', product.id, 1, 'evening');
      expect(cart.items[0].deliverySlot).toBe('evening');

      const merged = await addToCart(service, 'slot-customer', product.id, 1, 'morning');
      expect(merged.items).toHaveLength(1);
      expect(merged.items[0].deliverySlot).toBe('morning');

      const itemId = merged.items[0].id;
      const updated = await service.updateCart('slot-customer', itemId, 3, 'evening');
      expect(updated.items[0].quantity).toBe(3);
      expect(updated.items[0].deliverySlot).toBe('evening');
    });

    it('rejects invalid cart quantity updates', async () => {
      const { service } = makeService();
      const product = service.products[0];
      const cart = await addToCart(service, 'qty-customer', product.id, 1);
      await expect(service.updateCart('qty-customer', cart.items[0].id, 0)).rejects.toBeInstanceOf(BadRequestException);
      await expect(service.updateCart('qty-customer', 'missing-item', 1)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('rejects quantities above stock', async () => {
      const { service } = makeService();
      const product = service.products[0];
      await expect(addToCart(service, 'customer-id', product.id, product.stockQuantity + 1)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('creates an order and clears the customer cart', async () => {
      const { service } = makeService();
      const customerId = 'customer-id';
      const product = service.products[0];
      await addToCart(service, customerId, product.id, 2);
      const order = await service.createOrder(customerId, { deliveryName: 'Jane Doe', deliveryAddress: 'Jakarta', deliveryPhone: '+62000000000', fulfillmentType: 'delivery' });

      expect(order.status).toBe('pending');
      expect(order.fulfillmentType).toBe('delivery');
      expect(order.items[0].quantity).toBe(2);
      await expect(service.cart(customerId)).resolves.toEqual({ items: [], total: 0 });
      expect(product.stockQuantity).toBe(18);
      expect(service.stockAdjustments).toEqual(expect.arrayContaining([expect.objectContaining({ productId: product.id, quantity: -2, reason: 'purchase', orderId: order.id })]));
    });

    it('rejects checkout below the delivery minimum order value', async () => {
      const { service } = makeService();
      const customerId = 'min-order-customer';
      service.products[0].price = 1000;
      await addToCart(service, customerId, service.products[0].id, 1);
      await expect(
        service.createOrder(customerId, {
          deliveryName: 'Jane',
          deliveryAddress: 'Lagos',
          deliveryPhone: '0812345678',
          fulfillmentType: 'delivery',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('allows pickup checkout at the pickup minimum and rejects below it', async () => {
      const { service } = makeService();
      const customerId = 'pickup-min-customer';
      service.products[0].price = 3000;
      await addToCart(service, customerId, service.products[0].id, 1);
      const order = await service.createOrder(customerId, {
        deliveryName: 'Jane',
        deliveryPhone: '0812345678',
        fulfillmentType: 'pickup',
      });
      expect(order.fulfillmentType).toBe('pickup');
      expect(order.deliveryAddress).toBe('Pickup at DOVA hub');

      service.products[1].price = 2000;
      await addToCart(service, 'pickup-below-min', service.products[1].id, 1);
      await expect(
        service.createOrder('pickup-below-min', {
          deliveryName: 'Jane',
          deliveryPhone: '0812345678',
          fulfillmentType: 'pickup',
        }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('stores contact form submissions', async () => {
      const { service } = makeService();
      const result = await service.submitContact({
        name: 'Ada',
        email: 'ada@example.com',
        message: 'Hello DOVA team, I have a question.',
      });
      expect(result.message).toMatch(/thank you/i);
      expect(service.contacts[0]).toMatchObject({ name: 'Ada', email: 'ada@example.com' });
    });

    it('initializes and verifies a mock payment for a pending order', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;
      try {
        const { service } = makeService();
        const customerId = 'payment-customer';
        await addToCart(service, customerId, service.products[0].id, 1);
        const order = await service.createOrder(customerId, { deliveryName: 'Jane', deliveryAddress: 'Jakarta', deliveryPhone: '0812345678' });
        const payment = await service.initializePayment(customerId, order.id, order.totalAmount);
        expect(payment.mode).toBe('mock');
        const verified = await service.verifyPayment(customerId, payment.reference);
        expect(verified).toMatchObject({ orderId: order.id, status: 'paid' });
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('reuses a pending mock payment reference instead of creating duplicates', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;
      try {
        const { service } = makeService();
        const customerId = 'idempotent-payment-customer';
        await addToCart(service, customerId, service.products[0].id, 1);
        const order = await service.createOrder(customerId, { deliveryName: 'Jane', deliveryAddress: 'Jakarta', deliveryPhone: '0812345678' });
        const first = await service.initializePayment(customerId, order.id, order.totalAmount);
        const second = await service.initializePayment(customerId, order.id, order.totalAmount);
        expect(second.reference).toBe(first.reference);
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('accepts a mock payment webhook without requiring a secret', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;
      try {
        const { service } = makeService();
        await expect(service.handlePaystackWebhook(undefined, { event: 'charge.success' }, Buffer.from('{"event":"charge.success"}'))).resolves.toMatchObject({ received: true, mode: 'mock' });
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('supports supplier product CRUD and stock adjustments', async () => {
      const { service } = makeService();
      const supplier = service.users.find(user => user.role === 'supplier')!;
      const product = await service.addSupplierProduct(supplier.id, { name: 'Test Greens', description: 'Fresh greens', price: 12000, quantity: 5, categoryId: service.categories[0].id });
      expect(product.stockQuantity).toBe(5);
      await service.adjustSupplierStock(supplier.id, product.id, 3, 'restock');
      expect((await service.product(product.id)).stockQuantity).toBe(8);
      const updated = await service.updateSupplierProduct(supplier.id, product.id, { name: 'Updated Greens', description: 'Better greens', price: 14000, quantity: 8, categoryId: service.categories[0].id });
      expect(updated.name).toBe('Updated Greens');
      await service.removeSupplierProduct(supplier.id, product.id);
      await expect(service.product(product.id)).rejects.toThrow('Product not found');
    });

    it('enforces supplier order fulfillment transitions', async () => {
      const { service } = makeService();
      const supplier = service.users.find(user => user.role === 'supplier')!;
      const customer = service.users.find(user => user.role === 'admin')!;
      const product = service.products[0];
      await addToCart(service, customer.id, product.id, 1);
      const order = await service.createOrder(customer.id, { deliveryName: 'Buyer', deliveryAddress: 'Jakarta', deliveryPhone: '0812345678' });
      const item = order.items[0];
      await expect(service.updateSupplierOrderStatus(supplier.id, item.id, 'shipped')).rejects.toThrow('Invalid status transition');
      await service.updateSupplierOrderStatus(supplier.id, item.id, 'processing');
      await service.updateSupplierOrderStatus(supplier.id, item.id, 'shipped');
      await service.updateSupplierOrderStatus(supplier.id, item.id, 'delivered');
      expect(order.status).toBe('delivered');
    });

    it('supports supplier approval and rejects duplicate supplier emails', async () => {
      const { service } = makeService();
      const application = await service.makeSupplierUser({ businessName: 'New Farms', contactName: 'Nina', email: 'nina@farms.test', password: 'password123' });
      expect(application.status).toBe('pending');
      await service.approveSupplier(application.id);
      expect(service.suppliers.find(s => s.id === application.id)?.status).toBe('approved');
      await expect(service.makeSupplierUser({ businessName: 'Duplicate', email: 'nina@farms.test', password: 'password123' })).rejects.toThrow('Email already registered');
    });
  });
});
