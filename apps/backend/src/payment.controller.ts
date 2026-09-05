import { Body, Controller, Get, Headers, Post, Query, Req } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { PaymentInitializeDto } from './auth.dto';
import { CurrentUser, Public, Roles } from './auth.decorators';
import { AuthenticatedRequest } from './auth.types';
import { StoredUser } from './database.service';

@Controller()
export class PaymentController {
  constructor(private readonly service: AppService) {}

  @Public()
  @Get('payments/config') paymentConfig() { return this.service.paymentConfig(); }

  @Roles('customer')
  @Post('payments/initialize') initializePayment(@CurrentUser() user: StoredUser, @Body() body: PaymentInitializeDto) {
    return this.service.initializePayment(user.id, body.orderId, body.amount);
  }

  @Roles('customer')
  @Get('payments/verify') verifyPayment(@CurrentUser() user: StoredUser, @Query('reference') reference = '') {
    return this.service.verifyPayment(user.id, reference);
  }

  @Roles('customer')
  @Post('payments/verify') verifyPaymentPost(@CurrentUser() user: StoredUser, @Query('reference') reference = '') {
    return this.service.verifyPayment(user.id, reference);
  }

  @Public()
  @SkipThrottle()
  @Post('payments/webhook') webhook(@Req() req: AuthenticatedRequest, @Headers('x-paystack-signature') signature: string | undefined, @Body() body: unknown) {
    return this.service.handlePaystackWebhook(signature, body, req.rawBody);
  }
}
