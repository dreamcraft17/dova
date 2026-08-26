import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Req, Res, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle, SkipThrottle } from '@nestjs/throttler';
import { Response } from 'express';
import { AppService } from './app.service';
import { CartAddDto, CartUpdateDto, ContactDto, CreateOrderDto, LoginDto, OrderStatusDto, PaymentInitializeDto, ProductDto, RefreshTokenDto, RegisterDto, StockDto, SupplierRegisterDto, SupplierRejectDto } from './auth.dto';
import { FeedbackPostDto, FeedbackStatusDto, FeedbackCommentDto, ChangelogDto } from './feedback.dto';
import { FeedbackService } from './feedback.service';
import { CurrentUser, OptionalAuth, Public, Roles } from './auth.decorators';
import { AuthenticatedRequest } from './auth.types';
import { StoredUser } from './database.service';

const imageUpload = FileInterceptor('image', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? callback(null, true)
      : callback(new BadRequestException('Image must be JPG, PNG, or WEBP'), false),
});

@Controller()
export class AppController {
  constructor(private readonly service: AppService, private readonly feedback: FeedbackService) {}

  private applyImage(b: ProductDto, file?: { mimetype: string; buffer: Buffer }) {
    if (file) b.imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return b;
  }

  private cookieOptions(maxAge: number) {
    const crossSite = process.env.COOKIE_SAMESITE === 'none' || process.env.CROSS_SITE_COOKIES === 'true';
    const secure = process.env.NODE_ENV === 'production' || crossSite;
    return { httpOnly: true, sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax', secure, maxAge };
  }

  private sessionCookieOptions() {
    const crossSite = process.env.COOKIE_SAMESITE === 'none' || process.env.CROSS_SITE_COOKIES === 'true';
    const secure = process.env.NODE_ENV === 'production' || crossSite;
    return { httpOnly: true, sameSite: (crossSite ? 'none' : 'lax') as 'none' | 'lax', secure };
  }

  private bearerToken(req: AuthenticatedRequest) {
    return req.headers.authorization?.replace(/^Bearer\s+/i, '');
  }

  @Public()
  @Get('health') health() { return { status: 'ok', service: 'dova-api' }; }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('auth/register') register(@Body() body: RegisterDto) { return this.service.register(body); }

  @Public()
  @Throttle({ auth: { limit: 10, ttl: 60_000 } })
  @Post('auth/login') async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) {
    const result = await this.service.login(body.email, body.password, Boolean(body.rememberMe));
    res.cookie('accessToken', result.accessToken, this.cookieOptions(900000));
    if (body.rememberMe) {
      res.cookie('refreshToken', result.refreshToken, this.cookieOptions(30 * 24 * 60 * 60 * 1000));
    } else {
      res.cookie('refreshToken', result.refreshToken, this.sessionCookieOptions());
    }
    return result;
  }

  @Public()
  @Post('auth/logout') async logout(@Req() req: AuthenticatedRequest, @Body() body: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const accessToken = req.cookies?.accessToken ?? this.bearerToken(req);
    const refreshToken = req.cookies?.refreshToken ?? body.refreshToken;
    await this.service.revoke(accessToken, refreshToken);
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    return { message: 'Logged out' };
  }

  @Public()
  @Throttle({ auth: { limit: 20, ttl: 60_000 } })
  @Post('auth/refresh') async refresh(@Req() req: AuthenticatedRequest, @Body() body: RefreshTokenDto, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.refreshToken ?? body.refreshToken;
    const result = await this.service.refresh(refreshToken);
    res.cookie('accessToken', result.accessToken, this.cookieOptions(900000));
    res.cookie('refreshToken', result.refreshToken, this.cookieOptions(604800000));
    return result;
  }

  @Get('auth/me') me(@CurrentUser() user: StoredUser) { return this.service.publicUser(user); }

  @Public()
  @Get('categories') categories() { return this.service.listCategories(); }

  @Public()
  @Get('products') products(@Query('search') search = '', @Query('categoryId') categoryId = '', @Query('page') page = '1', @Query('limit') limit = '20') {
    return this.service.listProducts(search, categoryId, Number(page), Number(limit));
  }

  @Public()
  @Get('products/:id') product(@Param('id') id: string) { return this.service.product(id); }

  @Roles('customer')
  @Get('cart') cart(@CurrentUser() user: StoredUser) { return this.service.cart(user.id); }

  @Roles('customer')
  @Post('cart/add') add(@CurrentUser() user: StoredUser, @Body() b: CartAddDto) {
    return this.service.addCart(user.id, b.productId, Number(b.quantity), b.deliverySlot);
  }

  @Roles('customer')
  @Put('cart/items/:id') update(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() b: CartUpdateDto) {
    return this.service.updateCart(user.id, id, b.quantity, b.deliverySlot);
  }

  @Roles('customer')
  @Delete('cart/items/:id') remove(@CurrentUser() user: StoredUser, @Param('id') id: string) {
    return this.service.removeCart(user.id, id);
  }

  @Roles('customer')
  @Post('orders') order(@CurrentUser() user: StoredUser, @Body() body: CreateOrderDto) {
    return this.service.createOrder(user.id, body);
  }

  @Roles('customer')
  @Get('orders') async orders(@CurrentUser() user: StoredUser) {
    return (await this.service.databaseOrders(user.id)) ?? this.service.orders.filter(o => o.customerId === user.id);
  }

  @Roles('customer')
  @Get('orders/:id') async orderDetail(@CurrentUser() user: StoredUser, @Param('id') id: string) {
    const o = (await this.service.databaseOrder(user.id, id)) ?? this.service.orders.find(x => x.id === id && x.customerId === user.id);
    if (!o) throw new UnauthorizedException();
    return o;
  }

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

  @Public()
  @Post('suppliers/register') @UseInterceptors(FileInterceptor('verificationDocs', { limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, callback) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype) ? callback(null, true) : callback(new BadRequestException('Document must be PDF, JPG, or PNG'), false) }))
  supplierRegister(@Body() b: SupplierRegisterDto, @UploadedFile() file?: { mimetype: string; buffer: Buffer }) {
    if (file) b.documentUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return this.service.makeSupplierUser(b);
  }

  @Roles('supplier')
  @Get('suppliers/status') supplierStatus(@CurrentUser() user: StoredUser) { return this.service.supplierStatus(user.id); }

  @Roles('supplier')
  @Get('suppliers/products') supplierProducts(@CurrentUser() user: StoredUser) { return this.service.supplierProducts(user.id); }

  @Roles('supplier')
  @Post('suppliers/products') @UseInterceptors(imageUpload) supplierProductCreate(@CurrentUser() user: StoredUser, @Body() b: ProductDto, @UploadedFile() file?: { mimetype: string; buffer: Buffer }) {
    return this.service.addSupplierProduct(user.id, this.applyImage(b, file));
  }

  @Roles('supplier')
  @Put('suppliers/products/:id') @UseInterceptors(imageUpload) supplierProductUpdate(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() b: ProductDto, @UploadedFile() file?: { mimetype: string; buffer: Buffer }) {
    return this.service.updateSupplierProduct(user.id, id, this.applyImage(b, file));
  }

  @Roles('supplier')
  @Delete('suppliers/products/:id') supplierProductDelete(@CurrentUser() user: StoredUser, @Param('id') id: string) {
    return this.service.removeSupplierProduct(user.id, id);
  }

  @Roles('supplier')
  @Put('suppliers/products/:id/activate') supplierProductActivate(@CurrentUser() user: StoredUser, @Param('id') id: string) {
    return this.service.setSupplierProductActive(user.id, id);
  }

  @Roles('supplier')
  @Put('suppliers/products/:id/stock') supplierStock(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() b: StockDto) {
    return this.service.adjustSupplierStock(user.id, id, b.quantity, b.reason);
  }

  @Roles('supplier')
  @Get('suppliers/products/:id/stock-history') supplierStockHistory(@CurrentUser() user: StoredUser, @Param('id') id: string) {
    return this.service.supplierStockHistory(user.id, id);
  }

  @Roles('supplier')
  @Get('suppliers/orders') supplierOrders(@CurrentUser() user: StoredUser) { return this.service.supplierOrders(user.id); }

  @Roles('supplier')
  @Put('suppliers/orders/:itemId/status') supplierOrderStatus(@CurrentUser() user: StoredUser, @Param('itemId') itemId: string, @Body() b: OrderStatusDto) {
    return this.service.updateSupplierOrderStatus(user.id, itemId, b.status);
  }

  @Roles('admin')
  @Get('admin/dashboard') admin() { return this.service.adminDashboard(); }

  @Roles('admin')
  @Get('admin/suppliers/pending') pendingSuppliers() { return this.service.pendingSuppliers(); }

  @Roles('admin')
  @Post('admin/suppliers/:id/approve') approveSupplier(@Param('id') id: string) { return this.service.approveSupplier(id); }

  @Roles('admin')
  @Post('admin/suppliers/:id/reject') rejectSupplier(@Param('id') id: string, @Body() b: SupplierRejectDto) {
    return this.service.rejectSupplier(id, b.reason);
  }

  @Roles('admin')
  @Get('admin/users') adminUsers() { return this.service.adminUsers(); }

  @Roles('admin')
  @Put('admin/users/:id/active') userActive(@Param('id') id: string, @Body('active') active: boolean) {
    return this.service.setUserActive(id, Boolean(active));
  }

  @Roles('admin')
  @Get('admin/products') adminProducts() { return this.service.adminProducts(); }

  @Roles('admin')
  @Put('admin/products/:id/active') productActive(@Param('id') id: string, @Body('active') active: boolean) {
    return this.service.setProductActive(id, Boolean(active));
  }

  @Roles('admin')
  @Get('admin/orders') adminOrders(@Query('status') status = '', @Query('search') search = '') {
    return this.service.adminOrders(status, search);
  }

  @Roles('admin')
  @Get('admin/contacts') adminContacts() { return this.service.listContacts(); }

  @Public()
  @Post('contact') contact(@Body() body: ContactDto) { return this.service.submitContact(body); }

  @Public()
  @Get('feedback/posts') listFeedback(@Query('sort') sort: 'votes' | 'new' = 'votes', @Query('search') search = '') {
    return this.feedback.list(sort, search);
  }

  @Public()
  @Get('feedback/posts/:id') getFeedback(@Param('id') id: string) { return this.feedback.find(id); }

  @Public()
  @Get('feedback/roadmap') feedbackRoadmap() { return this.feedback.roadmap(); }

  @OptionalAuth()
  @Post('feedback/posts') createFeedback(@CurrentUser() user: StoredUser | undefined, @Body() body: FeedbackPostDto) {
    return this.feedback.create(body, user);
  }

  @Post('feedback/posts/:id/vote') voteFeedback(@CurrentUser() user: StoredUser, @Param('id') id: string) {
    return this.feedback.vote(id, user);
  }

  @Roles('admin')
  @Put('feedback/posts/:id/status') feedbackStatus(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() body: FeedbackStatusDto) {
    this.feedback.assertAdmin(user);
    return this.feedback.setStatus(id, body.status);
  }

  @Public()
  @Get('feedback/posts/:id/comments') feedbackComments(@Param('id') id: string) { return this.feedback.listComments(id); }

  @OptionalAuth()
  @Post('feedback/posts/:id/comments') addFeedbackComment(@CurrentUser() user: StoredUser | undefined, @Param('id') id: string, @Body() body: FeedbackCommentDto) {
    return this.feedback.addComment(id, body, user, false);
  }

  @Roles('admin')
  @Post('feedback/posts/:id/official-reply') officialReply(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() body: FeedbackCommentDto) {
    this.feedback.assertAdmin(user);
    return this.feedback.addComment(id, body, user, true);
  }

  @Public()
  @Get('feedback/changelog') listChangelog() { return this.feedback.listChangelogs(); }

  @Public()
  @Get('feedback/changelog/:slug') getChangelog(@Param('slug') slug: string) { return this.feedback.getChangelog(slug); }

  @Roles('admin')
  @Post('feedback/changelog') createChangelog(@CurrentUser() user: StoredUser, @Body() body: ChangelogDto) {
    this.feedback.assertAdmin(user);
    return this.feedback.createChangelog(body);
  }

  @Public()
  @Get('feedback/config') feedbackConfig() {
    return { enabled: true, native: true, features: ['board', 'votes', 'comments', 'roadmap', 'changelog', 'admin'] };
  }
}
