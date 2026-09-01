/**
 * AppService unit tests — auth, cart, orders, payments, admin, supplier, FeedLog SSO.
 * @author Dozer (@dreamraft17) - Software Engineer
 */
import { JwtService } from '@nestjs/jwt';
import { BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { createHmac } from 'crypto';
import * as bcrypt from 'bcryptjs';
import { AppService } from './app.service';
import { hashOtp } from './otp.util';
import { PaystackService } from './paystack.service';

jest.mock('./otp.util', () => ({
  ...jest.requireActual('./otp.util'),
  generateOtpCode: jest.fn(() => '123456'),
}));

const SLOT = 'morning' as const;

function addToCart(service: AppService, userId: string, productId: string, quantity: number, deliverySlot: 'morning' | 'evening' = SLOT) {
  return service.addCart(userId, productId, quantity, deliverySlot);
}

function makeService() {
  const database = {
    enabled: false,
    insertUser: jest.fn(),
    updatePendingUser: jest.fn(),
    saveUserOtp: jest.fn(),
    updateOtpResend: jest.fn(),
    verifyUserEmail: jest.fn(),
    saveUserPasswordReset: jest.fn(),
    updatePasswordResetResend: jest.fn(),
    clearPasswordReset: jest.fn(),
    revokeAllUserSessions: jest.fn(),
    userOrderCount: jest.fn().mockResolvedValue(0),
    userSupplierOrderCount: jest.fn().mockResolvedValue(0),
    deleteUser: jest.fn().mockResolvedValue('deleted'),
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
    adminUserById: jest.fn().mockResolvedValue(undefined),
    updateUserProfile: jest.fn(),
    updateSelfProfile: jest.fn(),
    updateUserPassword: jest.fn(),
    setUserActive: jest.fn(),
    adminProducts: jest.fn().mockResolvedValue(undefined),
    setProductActive: jest.fn(),
    adminOrders: jest.fn().mockResolvedValue(undefined),
    insertContactSubmission: jest.fn().mockResolvedValue(undefined),
    listContactSubmissions: jest.fn().mockResolvedValue(undefined),
  };
  const redis = { enabled: false, set: jest.fn(), get: jest.fn(), del: jest.fn() };
  const notifications = {
    verificationOtp: jest.fn().mockResolvedValue({ sent: true }),
    passwordResetOtp: jest.fn().mockResolvedValue({ sent: true }),
    supplierStatus: jest.fn().mockResolvedValue({ sent: true }),
    contactMessage: jest.fn().mockResolvedValue({ sent: true }),
  };
  const service = new AppService(new JwtService({ secret: 'unit-test-secret' }), database as never, redis as never, new PaystackService(), notifications as never);
  return { service, database, redis, notifications };
}

async function registerAndVerify(
  service: AppService,
  body: { fullName: string; email: string; password: string; confirmPassword: string },
) {
  await service.sendRegistrationCode(body.email, body.fullName);
  return service.register({ ...body, code: '123456' });
}

function makeServiceWithNotifications(notifications: { contactMessage: jest.Mock }) {
  const database = {
    enabled: false,
    insertContactSubmission: jest.fn().mockResolvedValue(undefined),
  };
  const redis = { enabled: false, set: jest.fn(), get: jest.fn(), del: jest.fn() };
  const service = new AppService(
    new JwtService({ secret: 'unit-test-secret' }),
    database as never,
    redis as never,
    new PaystackService(),
    notifications as never,
  );
  return { service };
}

describe('AppService', () => {
  describe('registration and authentication', () => {
    it('registers a verified customer after inline OTP', async () => {
      const { service, database, notifications } = makeService();
      await service.sendRegistrationCode('JANE@example.com', 'Jane Doe');
      const result = await service.register({
        fullName: 'Jane Doe',
        email: 'JANE@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        code: '123456',
      });

      expect(result.user.email).toBe('jane@example.com');
      expect(result.user.emailVerifiedAt).toBeDefined();
      expect(result.message).toBe('Account created successfully.');
      const stored = service.users.find((entry) => entry.email === 'jane@example.com');
      expect(stored).toMatchObject({ fullName: 'Jane Doe', role: 'customer', isActive: true });
      expect(stored?.emailVerifiedAt).toBeDefined();
      expect(database.insertUser).toHaveBeenCalledTimes(1);
      expect(database.verifyUserEmail).toHaveBeenCalledTimes(1);
      expect(notifications.verificationOtp).toHaveBeenCalledWith('jane@example.com', '123456', 'Jane Doe');
    });

    it('stores registration password as bcrypt hash, not plaintext', async () => {
      const { service, database } = makeService();
      await service.sendRegistrationCode('secure@example.com', 'Secure User');
      await service.register({
        fullName: 'Secure User',
        email: 'secure@example.com',
        password: 'password123',
        confirmPassword: 'password123',
        code: '123456',
      });

      expect(database.insertUser).toHaveBeenCalledTimes(1);
      const stored = database.insertUser.mock.calls[0][0] as { passwordHash: string };
      expect(stored.passwordHash).not.toBe('password123');
      expect(stored.passwordHash).toMatch(/^\$2[aby]\$/);
      expect(bcrypt.compareSync('password123', stored.passwordHash)).toBe(true);
    });

    it('does not expose password material in register API response', async () => {
      const { service } = makeService();
      const result = await registerAndVerify(service, {
        fullName: 'Jane Doe',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });

      expect(result).not.toHaveProperty('password');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.user).not.toHaveProperty('passwordHash');
      expect(JSON.stringify(result)).not.toContain('password123');
    });

    it('requires a registration verification code before creating an account', async () => {
      const { service } = makeService();
      await expect(
        service.register({
          fullName: 'Jane Doe',
          email: 'jane@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          code: '123456',
        }),
      ).rejects.toThrow('Request a verification code');
    });

    it.each([
      { email: 'bad', password: 'password123', confirmPassword: 'password123' },
      { fullName: 'Jane', email: 'jane@example.com', password: 'short', confirmPassword: 'short' },
      { fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'different' },
    ])('rejects invalid registration data', async (body) => {
      const { service } = makeService();
      const payload = { fullName: 'Jane', ...body, code: '123456' };
      if (payload.email && /^\S+@\S+\.\S+$/.test(payload.email)) {
        await service.sendRegistrationCode(payload.email, payload.fullName);
      }
      await expect(service.register(payload)).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects duplicate emails case-insensitively', async () => {
      const { service } = makeService();
      await registerAndVerify(service, { fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      await expect(
        service.register({
          fullName: 'Other',
          email: 'JANE@example.com',
          password: 'password123',
          confirmPassword: 'password123',
          code: '123456',
        }),
      ).rejects.toThrow('Email already registered');
    });

    it('issues access and refresh tokens after OTP verification', async () => {
      const { service, database } = makeService();
      await registerAndVerify(service, { fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      const result = await service.login('JANE@example.com', 'password123');

      expect(result.user.email).toBe('jane@example.com');
      expect(result.accessToken.split('.')).toHaveLength(3);
      expect(result.refreshToken.split('.')).toHaveLength(3);
      expect(database.saveSession).toHaveBeenCalled();
    });

    it('allows login for legacy unverified accounts', async () => {
      const { service } = makeService();
      const legacy = (service as unknown as { makeUser: AppService['makeUser'] }).makeUser(
        'legacy@example.com',
        'Legacy User',
        'customer',
        'password123',
        { active: true, emailVerified: false },
      );
      service.users.push(legacy);
      const result = await service.login('legacy@example.com', 'password123');
      expect(result.user.email).toBe('legacy@example.com');
      expect(result.user.emailVerifiedAt).toBeUndefined();
    });

    it('blocks checkout until email is verified', async () => {
      const { service } = makeService();
      const legacy = (service as unknown as { makeUser: AppService['makeUser'] }).makeUser(
        'checkout@example.com',
        'Jane',
        'customer',
        'password123',
        { active: true, emailVerified: false },
      );
      service.users.push(legacy);
      const product = service.products[0];
      await addToCart(service, legacy.id, product.id, 2);
      await expect(
        service.createOrder(legacy.id, {
          deliveryName: 'Jane',
          deliveryAddress: 'Lagos',
          deliveryPhone: '0812345678',
          fulfillmentType: 'delivery',
        }),
      ).rejects.toEqual(
        expect.objectContaining({ message: 'Verify your email in Profile before placing an order.' }),
      );
    });

    it('verifies OTP and activates legacy accounts', async () => {
      const { service, database } = makeService();
      const legacy = (service as unknown as { makeUser: AppService['makeUser'] }).makeUser(
        'jane@example.com',
        'Jane',
        'customer',
        'password123',
        { active: true, emailVerified: false },
      );
      legacy.otpHash = hashOtp('123456');
      legacy.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
      service.users.push(legacy);
      const result = await service.verifyOtp('jane@example.com', '123456');
      expect(result.user.email).toBe('jane@example.com');
      expect(result.user.isActive).toBe(true);
      expect(database.verifyUserEmail).toHaveBeenCalledTimes(1);
    });

    it('sends password reset code for verified customers', async () => {
      const { service, database, notifications } = makeService();
      await registerAndVerify(service, { fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      const result = await service.forgotPassword('jane@example.com');
      expect(result.message).toContain('password reset code');
      expect(notifications.passwordResetOtp).toHaveBeenCalledWith('jane@example.com', '123456', 'Jane');
      expect(database.updatePasswordResetResend).toHaveBeenCalled();
    });

    it('returns generic message for unknown email without sending', async () => {
      const { service, notifications } = makeService();
      const result = await service.forgotPassword('missing@example.com');
      expect(result.message).toContain('password reset code');
      expect(notifications.passwordResetOtp).not.toHaveBeenCalled();
    });

    it('resets password with a valid code and revokes sessions', async () => {
      const { service, database } = makeService();
      await registerAndVerify(service, { fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      await service.forgotPassword('jane@example.com');
      const result = await service.resetPassword('jane@example.com', '123456', 'newpassword99', 'newpassword99');
      expect(result.message).toContain('Password updated');
      expect(database.updateUserPassword).toHaveBeenCalled();
      expect(database.clearPasswordReset).toHaveBeenCalled();
      expect(database.revokeAllUserSessions).toHaveBeenCalled();
      await expect(service.login('jane@example.com', 'password123')).rejects.toBeInstanceOf(UnauthorizedException);
      const login = await service.login('jane@example.com', 'newpassword99');
      expect(login.user.email).toBe('jane@example.com');
    });

    it('rejects admin self-service password reset', async () => {
      const { service, notifications } = makeService();
      const result = await service.forgotPassword('admin@dova.local');
      expect(result.message).toContain('password reset code');
      expect(notifications.passwordResetOtp).not.toHaveBeenCalled();
    });

    it('updates profile name and phone for signed-in users', async () => {
      const { service, database } = makeService();
      const session = await registerAndVerify(service, {
        fullName: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      const updated = await service.updateProfile(session.user.id, {
        fullName: 'Jane Updated',
        phoneNumber: '+2348012345678',
      });
      expect(updated.fullName).toBe('Jane Updated');
      expect(updated.phoneNumber).toBe('+2348012345678');
      expect(database.updateSelfProfile).toHaveBeenCalledWith(session.user.id, {
        fullName: 'Jane Updated',
        phoneNumber: '+2348012345678',
      });
    });

    it('rejects invalid profile phone numbers', async () => {
      const { service } = makeService();
      const session = await registerAndVerify(service, {
        fullName: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      await expect(
        service.updateProfile(session.user.id, { fullName: 'Jane', phoneNumber: '123' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });

    it('changes password when current password is correct', async () => {
      const { service, database } = makeService();
      const session = await registerAndVerify(service, {
        fullName: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      const result = await service.changePassword(
        session.user.id,
        'password123',
        'newpassword99',
        'newpassword99',
      );
      expect(result.message).toContain('Password updated');
      expect(database.updateUserPassword).toHaveBeenCalled();
      expect(database.revokeAllUserSessions).toHaveBeenCalled();
      await expect(service.login('jane@example.com', 'password123')).rejects.toBeInstanceOf(UnauthorizedException);
      const login = await service.login('jane@example.com', 'newpassword99');
      expect(login.user.email).toBe('jane@example.com');
    });

    it('rejects change password with wrong current password', async () => {
      const { service } = makeService();
      const session = await registerAndVerify(service, {
        fullName: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
        confirmPassword: 'password123',
      });
      await expect(
        service.changePassword(session.user.id, 'wrongpass', 'newpassword99', 'newpassword99'),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('rejects admin in-app password change', async () => {
      const { service } = makeService();
      await expect(
        service.changePassword(service.users[0].id, 'admin1234', 'newpassword99', 'newpassword99'),
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('uses a generic error for invalid credentials', async () => {
      const { service } = makeService();
      await expect(service.login('missing@example.com', 'password123')).rejects.toEqual(expect.objectContaining({ message: 'Invalid credentials' }));
    });

    it('refreshes a valid refresh token and rejects revoked access', async () => {
      const { service, database } = makeService();
      const session = await registerAndVerify(service, { fullName: 'Jane', email: 'jane@example.com', password: 'password123', confirmPassword: 'password123' });
      const refreshed = await service.refresh(session.refreshToken);
      expect(refreshed.user.id).toBe(session.user.id);
      await service.revoke(session.accessToken, session.refreshToken);
      await expect(service.userFromToken(session.accessToken)).rejects.toBeInstanceOf(UnauthorizedException);
      expect(database.revokeSession).toHaveBeenCalledWith(session.accessToken);
      expect(database.revokeSession).toHaveBeenCalledWith(session.refreshToken);
    });
  });

  describe('authorization and cart/order behavior', () => {
    it('seeds at least 22 catalog products and paginates the public catalog', async () => {
      const { service } = makeService();
      const page = await service.listProducts('', '', 2, 12);
      expect(page.pagination.total).toBeGreaterThanOrEqual(22);
      expect(page.data).toHaveLength(10);
    });

    it('seeds UAT sample products for minimum-order testing (BLOCKER)', () => {
      const { service } = makeService();
      const greens = service.products.find((product) => product.name === 'UAT Sample Greens');
      const grain = service.products.find((product) => product.name === 'UAT Sample Grain Pack');
      expect(greens?.price).toBe(1500);
      expect(greens?.categoryName).toBe('Vegetables');
      expect(grain?.price).toBe(2500);
      expect(grain?.categoryName).toBe('Grains');
    });

    it('assigns meat products to the Meat category (BUG-001)', () => {
      const { service } = makeService();
      const chicken = service.products.find((product) => product.name === 'Chicken Breast');
      const salmon = service.products.find((product) => product.name === 'Atlantic Salmon');
      expect(chicken?.categoryName).toBe('Meat');
      expect(salmon?.categoryName).toBe('Seafood');
      const vegetables = service.products.filter((product) => product.categoryName === 'Vegetables');
      expect(vegetables.some((product) => product.name === 'Chicken Breast')).toBe(false);
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

    it('rejects add to cart without a delivery slot (BUG-CART-004)', async () => {
      const { service } = makeService();
      const product = service.products[0];
      await expect(
        service.addCart('slot-missing-customer', product.id, 1, '' as 'morning'),
      ).rejects.toThrow('Please select a delivery slot');
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

    it('still stores the contact submission when the notification email fails', async () => {
      const notifications = { contactMessage: jest.fn().mockRejectedValue(new Error('Resend is down')) };
      const { service } = makeServiceWithNotifications(notifications);
      const result = await service.submitContact({
        name: 'Ada',
        email: 'ada@example.com',
        message: 'Hello DOVA team, I have a question.',
      });
      expect(result.message).toMatch(/thank you/i);
      expect(service.contacts[0]).toMatchObject({ name: 'Ada', email: 'ada@example.com' });
      expect(notifications.contactMessage).toHaveBeenCalled();
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

    it('returns pending status when Paystack reports an ongoing transaction', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_verify';
      let fetchSpy: jest.SpyInstance | undefined;
      try {
        const { service } = makeService();
        const customerId = 'pending-payment-customer';
        await addToCart(service, customerId, service.products[0].id, 1);
        const order = await service.createOrder(customerId, { deliveryName: 'Jane', deliveryAddress: 'Lagos', deliveryPhone: '0812345678' });
        const reference = 'DOVA-PENDING-001';
        service.payments.set(reference, { orderId: order.id, status: 'pending' });
        order.paymentReference = reference;
        fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue(
          new Response(JSON.stringify({
            status: true,
            data: {
              status: 'ongoing',
              reference,
              amount: Math.round(order.totalAmount * 100),
              currency: 'NGN',
            },
          }), { status: 200 }),
        );

        const result = await service.verifyPayment(customerId, reference);
        expect(result).toMatchObject({ status: 'pending', paymentStatus: 'ongoing' });
        expect(order.status).toBe('pending');
      } finally {
        fetchSpy?.mockRestore();
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY; else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('is idempotent when verifying an already paid order', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;
      try {
        const { service } = makeService();
        const customerId = 'paid-twice-customer';
        await addToCart(service, customerId, service.products[0].id, 1);
        const order = await service.createOrder(customerId, { deliveryName: 'Jane', deliveryAddress: 'Lagos', deliveryPhone: '0812345678' });
        const payment = await service.initializePayment(customerId, order.id, order.totalAmount);
        await service.verifyPayment(customerId, payment.reference);
        const again = await service.verifyPayment(customerId, payment.reference);
        expect(again).toMatchObject({ status: 'paid', alreadyPaid: true });
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

    it('reuses a pending payment reference loaded from the database', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      delete process.env.PAYSTACK_SECRET_KEY;
      try {
        const { service, database } = makeService();
        database.enabled = true;
        const pendingRef = 'DOVA-TEST-REF-001';
        database.findOrder = jest.fn().mockResolvedValue({
          id: 'order-db-1',
          orderNumber: 'DOVA-DB1',
          customerId: 'db-payment-customer',
          status: 'pending',
          totalAmount: 25000,
          deliveryName: 'Jane',
          deliveryAddress: 'Lagos',
          deliveryPhone: '0812345678',
          paymentReference: pendingRef,
          items: [],
          createdAt: new Date().toISOString(),
        });
        const first = await service.initializePayment('db-payment-customer', 'order-db-1', 25000);
        service.payments.clear();
        const second = await service.initializePayment('db-payment-customer', 'order-db-1', 25000);
        expect(first.reference).toBe(pendingRef);
        expect(second.reference).toBe(pendingRef);
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

    it('returns not found for invalid product id format', async () => {
      const { service } = makeService();
      await expect(service.product('not-a-uuid')).rejects.toThrow('Product not found');
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
      const remaining = await service.supplierProducts(supplier.id);
      const hidden = remaining.find((item) => item.id === product.id);
      expect(hidden).toBeDefined();
      expect(hidden!.isActive).toBe(false);
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

    it('returns only the logged-in supplier products when database mode is enabled', async () => {
      const { service, database } = makeService();
      database.enabled = true;
      database.findSupplierByUser = jest.fn().mockResolvedValue({ id: 'supplier-b', userId: 'user-b', businessName: 'Farm B', status: 'approved' });
      database.listSupplierProducts = jest.fn().mockResolvedValue([{ id: 'p1', supplierId: 'supplier-b', supplierName: 'Farm B', name: 'My Beans', description: 'x', price: 1000, stockQuantity: 5, categoryId: 'c1', categoryName: 'Pantry', isActive: true }]);
      service.products.push({
        id: 'other',
        supplierId: 'supplier-a',
        supplierName: 'Farm A',
        name: 'Tomatoes',
        description: 'x',
        price: 1000,
        stockQuantity: 5,
        categoryId: 'c1',
        categoryName: 'Vegetables',
        isActive: true,
      });
      const products = await service.supplierProducts('user-b');
      expect(products).toHaveLength(1);
      expect(products[0].name).toBe('My Beans');
      expect(database.listSupplierProducts).toHaveBeenCalledWith('supplier-b');
    });
  });

  describe('cart removal and empty checkout', () => {
    it('rejects add to cart when quantity exceeds available stock', async () => {
      const { service } = makeService();
      const customerId = 'stock-limit-customer';
      const product = service.products[0];
      await expect(addToCart(service, customerId, product.id, product.stockQuantity + 1)).rejects.toThrow(
        `Only ${product.stockQuantity} kg available in stock`,
      );
    });

    it('rejects cumulative cart quantity above available stock', async () => {
      const { service } = makeService();
      const customerId = 'stock-merge-customer';
      const product = service.products[0];
      await addToCart(service, customerId, product.id, product.stockQuantity - 1);
      await expect(addToCart(service, customerId, product.id, 2)).rejects.toThrow(
        `Only ${product.stockQuantity} kg available in stock`,
      );
    });

    it('removes a cart item and recalculates totals', async () => {
      const { service } = makeService();
      const customerId = 'remove-cart-customer';
      const product = service.products[0];
      const cart = await addToCart(service, customerId, product.id, 2);
      expect(cart.items).toHaveLength(1);

      const updated = await service.removeCart(customerId, cart.items[0].id);
      expect(updated.items).toHaveLength(0);
      expect(updated.total).toBe(0);
    });

    it('rejects checkout when the cart is empty', async () => {
      const { service } = makeService();
      await expect(
        service.createOrder('empty-cart-customer', {
          deliveryName: 'Jane',
          deliveryAddress: 'Lagos',
          deliveryPhone: '0812345678',
        }),
      ).rejects.toThrow('Cart is empty');
    });

    it('rejects checkout with missing delivery details', async () => {
      const { service } = makeService();
      const customerId = 'missing-details-customer';
      await addToCart(service, customerId, service.products[0].id, 1);
      await expect(
        service.createOrder(customerId, { deliveryName: '', deliveryPhone: '', fulfillmentType: 'delivery' }),
      ).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('admin operations', () => {
    it('returns dashboard stats including pending suppliers', async () => {
      const { service } = makeService();
      await service.makeSupplierUser({ businessName: 'Pending Farm', email: 'pending@farms.test', password: 'password123' });
      const stats = await service.adminDashboard();
      expect(stats.users).toBeGreaterThanOrEqual(3);
      expect(stats.products).toBeGreaterThanOrEqual(20);
      expect(stats.pendingSuppliers).toBeGreaterThanOrEqual(1);
    });

    it('lists admin users without password hashes', async () => {
      const { service } = makeService();
      const users = await service.adminUsers();
      expect(users.length).toBeGreaterThanOrEqual(2);
      users.forEach(user => expect(user).not.toHaveProperty('passwordHash'));
    });

    it('deactivates and reactivates a user', async () => {
      const { service } = makeService();
      await registerAndVerify(service, { fullName: 'Temp User', email: 'temp@example.com', password: 'password123', confirmPassword: 'password123' });
      const user = service.users.find((entry) => entry.email === 'temp@example.com')!;
      const deactivated = await service.setUserActive(user.id, false);
      expect(deactivated).toEqual({ id: user.id, isActive: false });
      const reactivated = await service.setUserActive(user.id, true);
      expect(reactivated).toEqual({ id: user.id, isActive: true });
    });

    it('returns admin user detail with order count', async () => {
      const { service } = makeService();
      await registerAndVerify(service, { fullName: 'Detail User', email: 'detail@example.com', password: 'password123', confirmPassword: 'password123' });
      const user = service.users.find((entry) => entry.email === 'detail@example.com')!;
      const detail = await service.adminUser(user.id);
      expect(detail.email).toBe('detail@example.com');
      expect(detail.orderCount).toBe(0);
      expect(detail.supplierOrderCount).toBe(0);
      expect(detail.canDelete).toBe(true);
      expect(detail).not.toHaveProperty('passwordHash');
    });

    it('updates user profile and role from admin', async () => {
      const { service, database } = makeService();
      await registerAndVerify(service, { fullName: 'Edit Me', email: 'edit@example.com', password: 'password123', confirmPassword: 'password123' });
      const user = service.users.find((entry) => entry.email === 'edit@example.com')!;
      const updated = await service.updateAdminUser(
        user.id,
        { fullName: 'Edited Name', email: 'edited@example.com', phoneNumber: '+2348012345678', role: 'supplier', isActive: true },
        'other-admin-id',
      );
      expect(updated.fullName).toBe('Edited Name');
      expect(updated.email).toBe('edited@example.com');
      expect(updated.role).toBe('supplier');
      expect(database.updateUserProfile).toHaveBeenCalled();
    });

    it('blocks admins from changing their own role or deactivating themselves', async () => {
      const { service } = makeService();
      const admin = service.users.find((entry) => entry.email === 'admin@dova.local')!;
      await expect(
        service.updateAdminUser(admin.id, { fullName: admin.fullName, email: admin.email, role: 'customer', isActive: true }, admin.id),
      ).rejects.toThrow('You cannot change your own role');
      await expect(
        service.updateAdminUser(admin.id, { fullName: admin.fullName, email: admin.email, role: 'admin', isActive: false }, admin.id),
      ).rejects.toThrow('You cannot deactivate your own account');
    });

    it('resets a user password from admin', async () => {
      const { service, database } = makeService();
      await registerAndVerify(service, { fullName: 'Reset Me', email: 'reset@example.com', password: 'password123', confirmPassword: 'password123' });
      const user = service.users.find((entry) => entry.email === 'reset@example.com')!;
      const oldHash = user.passwordHash;
      const result = await service.adminResetPassword(user.id, 'newpassword99');
      expect(result.message).toContain('Password updated');
      expect(user.passwordHash).not.toBe(oldHash);
      expect(database.updateUserPassword).toHaveBeenCalled();
    });

    it('deletes a user without order history', async () => {
      const { service, database } = makeService();
      await registerAndVerify(service, { fullName: 'Delete Me', email: 'delete@example.com', password: 'password123', confirmPassword: 'password123' });
      const user = service.users.find((entry) => entry.email === 'delete@example.com')!;
      const result = await service.deleteAdminUser(user.id, 'other-admin-id');
      expect(result.message).toContain('deleted');
      expect(service.users.some((entry) => entry.id === user.id)).toBe(false);
      expect(database.deleteUser).toHaveBeenCalledWith(user.id);
    });

    it('deletes a user with customer order history', async () => {
      const { service, database } = makeService();
      const session = await registerAndVerify(service, { fullName: 'Customer', email: 'customer-orders@example.com', password: 'password123', confirmPassword: 'password123' });
      await addToCart(service, session.user.id, service.products[0].id, 2);
      await service.createOrder(session.user.id, {
        deliveryName: 'Customer',
        deliveryAddress: 'Lagos',
        deliveryPhone: '0812345678',
        fulfillmentType: 'delivery',
      });
      database.userOrderCount.mockResolvedValueOnce(1);
      const result = await service.deleteAdminUser(session.user.id, 'other-admin-id');
      expect(result.message).toContain('deleted');
      expect(service.users.some((entry) => entry.id === session.user.id)).toBe(false);
    });

    it('blocks admins from deleting themselves', async () => {
      const { service } = makeService();
      const admin = service.users.find((entry) => entry.email === 'admin@dova.local')!;
      await expect(service.deleteAdminUser(admin.id, admin.id)).rejects.toThrow('your own account');
    });

    it('deactivates a product from the admin catalog', async () => {
      const { service } = makeService();
      const product = service.products[0];
      const result = await service.setProductActive(product.id, false);
      expect(result).toEqual({ id: product.id, isActive: false });
      expect(product.isActive).toBe(false);
    });

    it('filters admin orders by status and search term', async () => {
      const { service } = makeService();
      const customerId = 'admin-order-customer';
      await addToCart(service, customerId, service.products[0].id, 1);
      const order = await service.createOrder(customerId, {
        deliveryName: 'Admin Buyer',
        deliveryAddress: 'Lagos',
        deliveryPhone: '0812345678',
      });

      const pending = await service.adminOrders('pending');
      expect(pending.some(o => o.id === order.id)).toBe(true);

      const bySearch = await service.adminOrders('', order.orderNumber.slice(0, 6));
      expect(bySearch.some(o => o.id === order.id)).toBe(true);

      const noMatch = await service.adminOrders('delivered');
      expect(noMatch.some(o => o.id === order.id)).toBe(false);
    });

    it('rejects a pending supplier with reason and deactivates the user', async () => {
      const notifications = {
        supplierStatus: jest.fn().mockResolvedValue({ sent: false }),
        verificationOtp: jest.fn().mockResolvedValue({ sent: true }),
      };
      const { service } = makeService();
      (service as any).notifications = notifications;
      const application = await service.makeSupplierUser({
        businessName: 'Rejected Farm',
        email: 'rejected@farms.test',
        password: 'password123',
      });
      const result = await service.rejectSupplier(application.id, 'Incomplete documents');
      expect(result).toEqual({ id: application.id, status: 'rejected', reason: 'Incomplete documents' });
      const supplier = service.suppliers.find(s => s.id === application.id);
      expect(supplier?.status).toBe('rejected');
      expect(supplier?.rejectionReason).toBe('Incomplete documents');
      const user = service.users.find(u => u.email === 'rejected@farms.test');
      expect(user?.isActive).toBe(false);
      expect(notifications.supplierStatus).toHaveBeenCalledWith(
        'rejected@farms.test',
        'Rejected Farm',
        'rejected',
        'Incomplete documents',
      );
    });
  });

  describe('Paystack webhook security', () => {
    function paystackSignature(payload: string, secret: string) {
      return createHmac('sha512', secret).update(payload).digest('hex');
    }

    it('rejects webhooks without a signature when Paystack secret is set', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_webhook';
      try {
        const { service } = makeService();
        await expect(service.handlePaystackWebhook(undefined, { event: 'charge.success' })).rejects.toBeInstanceOf(UnauthorizedException);
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
        else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('rejects webhooks with an invalid signature', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_webhook';
      try {
        const { service } = makeService();
        const body = { event: 'charge.success', data: { reference: 'DOVA-REF-123' } };
        const rawBody = Buffer.from(JSON.stringify(body));
        await expect(service.handlePaystackWebhook('invalid-signature', body, rawBody)).rejects.toThrow('Invalid Paystack signature');
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
        else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('accepts a valid Paystack webhook and marks the order paid', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_webhook';
      try {
        const { service } = makeService();
        const customerId = 'webhook-customer';
        await addToCart(service, customerId, service.products[0].id, 1);
        const order = await service.createOrder(customerId, {
          deliveryName: 'Webhook Buyer',
          deliveryAddress: 'Lagos',
          deliveryPhone: '0812345678',
        });
        const reference = `DOVA-WEBHOOK-${order.id.slice(0, 8)}`;
        const amountSubunit = Math.round(order.totalAmount * 100);
        service.payments.set(reference, { orderId: order.id, status: 'pending' });
        order.paymentReference = reference;
        const body = {
          event: 'charge.success',
          data: { status: 'success', reference, amount: amountSubunit, currency: 'NGN' },
        };
        const rawBody = Buffer.from(JSON.stringify(body));
        const signature = paystackSignature(rawBody.toString('utf8'), 'sk_test_webhook');
        const result = await service.handlePaystackWebhook(signature, body, rawBody);
        expect(result).toMatchObject({ received: true, fulfilled: true });
        expect(order.status).toBe('paid');
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
        else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('ignores charge.success webhooks with mismatched amount', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_webhook';
      try {
        const { service } = makeService();
        const customerId = 'webhook-customer-2';
        await addToCart(service, customerId, service.products[0].id, 1);
        const order = await service.createOrder(customerId, {
          deliveryName: 'Webhook Buyer',
          deliveryAddress: 'Lagos',
          deliveryPhone: '0812345678',
        });
        const reference = `DOVA-WEBHOOK-BAD-${order.id.slice(0, 8)}`;
        service.payments.set(reference, { orderId: order.id, status: 'pending' });
        order.paymentReference = reference;
        const body = {
          event: 'charge.success',
          data: { status: 'success', reference, amount: 100, currency: 'NGN' },
        };
        const rawBody = Buffer.from(JSON.stringify(body));
        const signature = paystackSignature(rawBody.toString('utf8'), 'sk_test_webhook');
        const result = await service.handlePaystackWebhook(signature, body, rawBody);
        expect(result).toMatchObject({ received: true, ignored: true });
        expect(order.status).toBe('pending');
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
        else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });

    it('ignores non-charge.success webhook events', async () => {
      const previousKey = process.env.PAYSTACK_SECRET_KEY;
      process.env.PAYSTACK_SECRET_KEY = 'sk_test_webhook';
      try {
        const { service } = makeService();
        const body = { event: 'transfer.success', data: {} };
        const rawBody = Buffer.from(JSON.stringify(body));
        const signature = paystackSignature(rawBody.toString('utf8'), 'sk_test_webhook');
        await expect(service.handlePaystackWebhook(signature, body, rawBody)).resolves.toEqual({ received: true, ignored: true });
      } finally {
        if (previousKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
        else process.env.PAYSTACK_SECRET_KEY = previousKey;
      }
    });
  });
});
