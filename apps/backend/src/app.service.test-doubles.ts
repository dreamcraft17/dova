import { JwtService } from '@nestjs/jwt';
import { AppService } from './app.service';
import { PaystackService } from './paystack.service';

export function makeDatabaseDoubles(overrides: Record<string, unknown> = {}) {
  return {
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
    ...overrides,
  };
}

export function makeNotificationDoubles() {
  return {
    verificationOtp: jest.fn().mockResolvedValue({ sent: true }),
    passwordResetOtp: jest.fn().mockResolvedValue({ sent: true }),
    supplierStatus: jest.fn().mockResolvedValue({ sent: true }),
    contactMessage: jest.fn().mockResolvedValue({ sent: true }),
  };
}

export function makeAppService(overrides?: {
  database?: Record<string, unknown>;
  notifications?: Partial<ReturnType<typeof makeNotificationDoubles>>;
}) {
  const database = makeDatabaseDoubles(overrides?.database);
  const redis = { enabled: false, set: jest.fn(), get: jest.fn(), del: jest.fn() };
  const notifications = { ...makeNotificationDoubles(), ...overrides?.notifications };
  const service = new AppService(
    new JwtService({ secret: 'unit-test-secret' }),
    database as never,
    redis as never,
    new PaystackService(),
    notifications as never,
  );
  return { service, database, redis, notifications };
}
