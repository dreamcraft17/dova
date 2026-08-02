import { BadRequestException, Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Req, Res, UnauthorizedException, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { CartAddDto, CartUpdateDto, ContactDto, CreateOrderDto, LoginDto, OrderStatusDto, PaymentInitializeDto, ProductDto, RegisterDto, StockDto, SupplierRegisterDto, SupplierRejectDto } from './auth.dto';

const imageUpload = FileInterceptor('image', {
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) =>
    ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)
      ? callback(null, true)
      : callback(new BadRequestException('Image must be JPG, PNG, or WEBP'), false),
});

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}
  private auth(req: Request) { const token = req.cookies?.accessToken ?? req.headers.authorization?.replace('Bearer ', ''); return this.service.userFromToken(token); }
  private applyImage(b: ProductDto, file?: any) {
    if (file) b.imageUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
    return b;
  }
  @Get('health') health() { return { status: 'ok', service: 'dova-api' }; }
  @Post('auth/register') register(@Body() body: RegisterDto) { return this.service.register(body); }
  @Post('auth/login') async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response) { const result = await this.service.login(body.email, body.password); res.cookie('accessToken', result.accessToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 900000 }); res.cookie('refreshToken', result.refreshToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 604800000 }); return result; }
  @Post('auth/logout') async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) { await this.service.revoke(req.cookies?.accessToken, req.cookies?.refreshToken); res.clearCookie('accessToken'); res.clearCookie('refreshToken'); return { message: 'Logged out' }; }
  @Post('auth/refresh') async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) { const result = await this.service.refresh(req.cookies?.refreshToken); res.cookie('accessToken', result.accessToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', maxAge: 900000 }); return result; }
  @Get('auth/me') async me(@Req() req: Request) { return this.service.publicUser(await this.auth(req)); }
  @Get('categories') categories() { return this.service.listCategories(); }
  @Get('products') products(@Query('search') search = '', @Query('categoryId') categoryId = '', @Query('page') page = '1', @Query('limit') limit = '20') { return this.service.listProducts(search, categoryId, Number(page), Number(limit)); }
  @Get('products/:id') product(@Param('id') id: string) { return this.service.product(id); }
  @Get('cart') async cart(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.cart(u.id); }
  @Post('cart/add') async add(@Req() req: Request, @Body() b: CartAddDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.addCart(u.id, b.productId, Number(b.quantity), b.deliverySlot); }
  @Put('cart/items/:id') async update(@Req() req: Request, @Param('id') id: string, @Body() b: CartUpdateDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.updateCart(u.id, id, b.quantity, b.deliverySlot); }
  @Delete('cart/items/:id') async remove(@Req() req: Request, @Param('id') id: string) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.removeCart(u.id, id); }
  @Post('orders') async order(@Req() req: Request, @Body() body: CreateOrderDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.createOrder(u.id, body); }
  @Get('orders') async orders(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return (await this.service.databaseOrders(u.id)) ?? this.service.orders.filter(o => o.customerId === u.id); }
  @Get('orders/:id') async orderDetail(@Req() req: Request, @Param('id') id: string) { const u = await this.auth(req); const o = (await this.service.databaseOrder(u.id, id)) ?? this.service.orders.find(x => x.id === id && x.customerId === u.id); if (!o) throw new UnauthorizedException(); return o; }
  @Post('payments/initialize') async initializePayment(@Req() req: Request, @Body() body: PaymentInitializeDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return this.service.initializePayment(u.id, body.orderId, body.amount); }
  @Get('payments/verify') async verifyPayment(@Req() req: Request, @Query('reference') reference = '') { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return this.service.verifyPayment(u.id, reference); }
  @Post('payments/verify') async verifyPaymentPost(@Req() req: Request, @Query('reference') reference = '') { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return this.service.verifyPayment(u.id, reference); }
  @Post('payments/webhook') webhook(@Req() req: Request, @Headers('x-paystack-signature') signature: string | undefined, @Body() body: any) { return this.service.handlePaystackWebhook(signature, body, (req as Request & { rawBody?: Buffer }).rawBody); }
  @Post('suppliers/register') @UseInterceptors(FileInterceptor('verificationDocs', { limits: { fileSize: 5 * 1024 * 1024 }, fileFilter: (_req, file, callback) => ['application/pdf', 'image/jpeg', 'image/png'].includes(file.mimetype) ? callback(null, true) : callback(new BadRequestException('Document must be PDF, JPG, or PNG'), false) })) supplierRegister(@Body() b: SupplierRegisterDto, @UploadedFile() file?: any) { if (file) b.documentUrl = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`; return this.service.makeSupplierUser(b); }
  @Get('suppliers/status') async supplierStatus(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['supplier']); return this.service.supplierStatus(u.id); }
  @Get('suppliers/products') async supplierProducts(@Req() req: Request) { const u = await this.auth(req); return this.service.supplierProducts(u.id); }
  @Post('suppliers/products') @UseInterceptors(imageUpload) async supplierProductCreate(@Req() req: Request, @Body() b: ProductDto, @UploadedFile() file?: any) { const u = await this.auth(req); return this.service.addSupplierProduct(u.id, this.applyImage(b, file)); }
  @Put('suppliers/products/:id') @UseInterceptors(imageUpload) async supplierProductUpdate(@Req() req: Request, @Param('id') id: string, @Body() b: ProductDto, @UploadedFile() file?: any) { const u = await this.auth(req); return this.service.updateSupplierProduct(u.id, id, this.applyImage(b, file)); }
  @Delete('suppliers/products/:id') async supplierProductDelete(@Req() req: Request, @Param('id') id: string) { const u = await this.auth(req); return this.service.removeSupplierProduct(u.id, id); }
  @Put('suppliers/products/:id/stock') async supplierStock(@Req() req: Request, @Param('id') id: string, @Body() b: StockDto) { const u = await this.auth(req); return this.service.adjustSupplierStock(u.id, id, b.quantity, b.reason); }
  @Get('suppliers/products/:id/stock-history') async supplierStockHistory(@Req() req: Request, @Param('id') id: string) { const u = await this.auth(req); return this.service.supplierStockHistory(u.id, id); }
  @Get('suppliers/orders') async supplierOrders(@Req() req: Request) { const u = await this.auth(req); return this.service.supplierOrders(u.id); }
  @Put('suppliers/orders/:itemId/status') async supplierOrderStatus(@Req() req: Request, @Param('itemId') itemId: string, @Body() b: OrderStatusDto) { const u = await this.auth(req); return this.service.updateSupplierOrderStatus(u.id, itemId, b.status); }
  @Get('admin/dashboard') async admin(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.adminDashboard(); }
  @Get('admin/suppliers/pending') async pendingSuppliers(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.pendingSuppliers(); }
  @Post('admin/suppliers/:id/approve') async approveSupplier(@Req() req: Request, @Param('id') id: string) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.approveSupplier(id); }
  @Post('admin/suppliers/:id/reject') async rejectSupplier(@Req() req: Request, @Param('id') id: string, @Body() b: SupplierRejectDto) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.rejectSupplier(id, b.reason); }
  @Get('admin/users') async adminUsers(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.adminUsers(); }
  @Put('admin/users/:id/active') async userActive(@Req() req: Request, @Param('id') id: string, @Body('active') active: boolean) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.setUserActive(id, Boolean(active)); }
  @Get('admin/products') async adminProducts(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.adminProducts(); }
  @Put('admin/products/:id/active') async productActive(@Req() req: Request, @Param('id') id: string, @Body('active') active: boolean) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.setProductActive(id, Boolean(active)); }
  @Get('admin/orders') async adminOrders(@Req() req: Request, @Query('status') status = '', @Query('search') search = '') { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.adminOrders(status, search); }
  @Get('admin/contacts') async adminContacts(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return this.service.listContacts(); }
  @Post('contact') contact(@Body() body: ContactDto) { return this.service.submitContact(body); }
  @Get('feedback/sso') async feedlogSso(@Req() req: Request, @Query('return_to') returnTo = '/', @Res() res: Response) {
    const u = await this.auth(req);
    const url = this.service.buildFeedlogSsoRedirect(u, returnTo);
    return res.redirect(302, url);
  }
  @Get('feedback/config') feedlogConfig() {
    const enabled = Boolean(this.service.feedlogBaseUrl());
    return { enabled, sso: Boolean(process.env.FEEDLOG_SSO_SECRET?.trim()) };
  }
}
