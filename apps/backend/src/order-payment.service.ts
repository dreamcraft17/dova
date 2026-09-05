import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Order } from 'dova-shared';
import { DatabaseService } from './database.service';
import { PaystackService } from './paystack.service';
import { AppStateService, PaymentRecord } from './app-state.service';
import { AuthService } from './auth.service';

@Injectable()
export class OrderPaymentService {
  constructor(
    private readonly database: DatabaseService,
    private readonly paystack: PaystackService,
    private readonly state: AppStateService,
    private readonly auth: AuthService,
  ) {}

  paymentConfig() {
    return this.paystack.paymentConfig();
  }

  async initializePayment(userId: string, orderId: string, amount?: number) {
    const order =
      (await this.database.findOrder(userId, orderId)) ??
      this.state.orders.find((item) => item.id === orderId && item.customerId === userId);
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'pending') throw new BadRequestException('Order is not payable');
    if (amount !== undefined && Number(amount) !== order.totalAmount) throw new BadRequestException('Payment amount mismatch');

    if (order.paymentReference && order.status === 'pending') {
      let existing = this.state.payments.get(order.paymentReference);
      if (!existing) {
        existing = { orderId: order.id, status: 'pending' };
        this.state.payments.set(order.paymentReference, existing);
      }
      if (existing.status === 'pending') {
        if (!this.paystack.enabled()) {
          return {
            authorization_url: `/checkout/verify?reference=${encodeURIComponent(order.paymentReference)}`,
            reference: order.paymentReference,
            mode: 'mock',
          };
        }
        if (existing.authorization_url) {
          return {
            authorization_url: existing.authorization_url,
            reference: order.paymentReference,
            mode: this.paystack.isTestMode() ? 'paystack_test' : 'paystack',
          };
        }
      }
    }

    const reference = `DOVA-${order.orderNumber}-${randomUUID().slice(0, 8)}`;
    this.state.payments.set(reference, { orderId: order.id, status: 'pending' });
    order.paymentReference = reference;
    await this.database.setOrderPaymentReference(order.id, reference);
    await this.database.logPayment(order.id, reference, order.totalAmount, 'initiated');

    if (!this.paystack.enabled()) {
      return {
        authorization_url: `/checkout/verify?reference=${encodeURIComponent(reference)}`,
        reference,
        mode: 'mock',
      };
    }

    const customer = await this.auth.findUser(userId, true);
    if (!customer?.email) throw new BadRequestException('Customer email is required for Paystack checkout');
    const initialized = await this.paystack.initializeTransaction({
      email: customer.email,
      amountMajor: order.totalAmount,
      reference,
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: customer.fullName,
    });
    this.state.payments.set(reference, { orderId: order.id, status: 'pending', authorization_url: initialized.authorization_url });
    return {
      authorization_url: initialized.authorization_url,
      reference: initialized.reference,
      mode: this.paystack.isTestMode() ? 'paystack_test' : 'paystack',
    };
  }

  async verifyPayment(userId: string, reference: string) {
    const payment = this.state.payments.get(reference);
    const storedOrders = await this.database.listOrders(userId);
    const order = payment
      ? ((await this.database.findOrder(userId, payment.orderId)) ??
        this.state.orders.find((item) => item.id === payment.orderId && item.customerId === userId))
      : (storedOrders?.find((item) => item.paymentReference === reference) ??
        this.state.orders.find((item) => item.paymentReference === reference && item.customerId === userId));
    if (!order) throw new NotFoundException('Payment reference not found');
    if (order.customerId !== userId) throw new NotFoundException('Payment reference not found');

    if (order.status === 'paid') {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'paid' as const,
        alreadyPaid: true,
      };
    }

    const expected = {
      reference,
      amountSubunit: this.paystack.amountToSubunit(order.totalAmount),
      currency: this.paystack.currency(),
    };

    if (!this.paystack.enabled()) {
      return this.fulfillPaidOrder(order, reference, payment, undefined);
    }

    const verified = await this.paystack.verifyTransaction(reference);
    const response = verified.raw;

    if (verified.ok && verified.data && this.paystack.isSuccessfulCharge(verified.data, expected)) {
      return this.fulfillPaidOrder(order, reference, payment, response);
    }

    if (verified.ok && verified.data && this.paystack.isPendingStatus(verified.data.status)) {
      await this.database.logPayment(order.id, reference, order.totalAmount, verified.data.status, response);
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'pending' as const,
        paymentStatus: verified.data.status,
        message: this.paystack.pendingStatusMessage(verified.data.status),
      };
    }

    const failureMessage = verified.ok && verified.data
      ? this.paystack.failedStatusMessage(verified.data)
      : 'Payment verification failed';
    await this.database.logPayment(order.id, reference, order.totalAmount, 'failed', response);
    throw new BadRequestException(failureMessage);
  }

  private async fulfillPaidOrder(
    order: Order,
    reference: string,
    payment: PaymentRecord | undefined,
    response: unknown,
  ) {
    if (order.status === 'paid') {
      return {
        orderId: order.id,
        orderNumber: order.orderNumber,
        status: 'paid' as const,
        alreadyPaid: true,
      };
    }

    order.status = 'paid';
    order.paymentVerifiedAt = new Date().toISOString();
    await this.database.markOrderPaid(order.id, reference);
    await this.database.logPayment(order.id, reference, order.totalAmount, 'success', response);
    if (payment) payment.status = 'success';
    return { orderId: order.id, orderNumber: order.orderNumber, status: 'paid' as const };
  }

  async handlePaystackWebhook(signature: string | undefined, body: any, rawBody?: Buffer) {
    if (!this.paystack.enabled()) return { received: true, mode: 'mock' };
    const payload = rawBody?.toString('utf8') ?? JSON.stringify(body);
    if (!this.paystack.verifyWebhookSignature(signature, payload)) {
      throw new UnauthorizedException('Invalid Paystack signature');
    }
    if (body.event !== 'charge.success') return { received: true, ignored: true };

    const charge = this.paystack.chargeFromWebhookData(body.data);
    const reference = charge?.reference;
    if (!reference) throw new BadRequestException('Missing payment reference');

    const payment = this.state.payments.get(reference);
    const order = payment
      ? (this.state.orders.find((item) => item.id === payment.orderId) ?? (await this.database.findOrderByPaymentReference(reference)))
      : (this.state.orders.find((item) => item.paymentReference === reference) ?? (await this.database.findOrderByPaymentReference(reference)));
    if (!order) throw new NotFoundException('Order not found');
    if (order.status === 'paid') return { received: true, duplicate: true };

    const expected = {
      reference,
      amountSubunit: this.paystack.amountToSubunit(order.totalAmount),
      currency: this.paystack.currency(),
    };
    if (!charge || !this.paystack.isSuccessfulCharge(charge, expected)) {
      await this.database.logPayment(order.id, reference, order.totalAmount, 'webhook_rejected', body.data);
      return { received: true, ignored: true };
    }

    await this.fulfillPaidOrder(order, reference, payment, body.data);
    return { received: true, fulfilled: true };
  }
}
