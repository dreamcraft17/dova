import { Body, Controller, Delete, Get, Headers, Param, Post, Put, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { AppService } from './app.service';
import { CartAddDto, CartUpdateDto, CreateOrderDto, LoginDto, PaymentInitializeDto, RegisterDto, SupplierRegisterDto } from './auth.dto';

@Controller()
export class AppController {
  constructor(private readonly service: AppService) {}
  private auth(req: Request) { const token = req.cookies?.accessToken ?? req.headers.authorization?.replace('Bearer ', ''); return this.service.userFromToken(token); }
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
  @Post('cart/add') async add(@Req() req: Request, @Body() b: CartAddDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.addCart(u.id, b.productId, Number(b.quantity)); }
  @Put('cart/items/:id') async update(@Req() req: Request, @Param('id') id: string, @Body() b: CartUpdateDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.updateCart(u.id, id, Number(b.quantity)); }
  @Delete('cart/items/:id') async remove(@Req() req: Request, @Param('id') id: string) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.removeCart(u.id, id); }
  @Post('orders') async order(@Req() req: Request, @Body() body: CreateOrderDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return await this.service.createOrder(u.id, body); }
  @Get('orders') async orders(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return (await this.service.databaseOrders(u.id)) ?? this.service.orders.filter(o => o.customerId === u.id); }
  @Get('orders/:id') async orderDetail(@Req() req: Request, @Param('id') id: string) { const u = await this.auth(req); const o = (await this.service.databaseOrder(u.id, id)) ?? this.service.orders.find(x => x.id === id && x.customerId === u.id); if (!o) throw new UnauthorizedException(); return o; }
  @Post('payments/initialize') async initializePayment(@Req() req: Request, @Body() body: PaymentInitializeDto) { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return this.service.initializePayment(u.id, body.orderId, body.amount); }
  @Get('payments/verify') async verifyPayment(@Req() req: Request, @Query('reference') reference = '') { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return this.service.verifyPayment(u.id, reference); }
  @Post('payments/verify') async verifyPaymentPost(@Req() req: Request, @Query('reference') reference = '') { const u = await this.auth(req); this.service.requireRole(u, ['customer']); return this.service.verifyPayment(u.id, reference); }
  @Post('payments/webhook') webhook(@Headers('x-paystack-signature') signature: string | undefined, @Body() body: any) { return this.service.handlePaystackWebhook(signature, body); }
  @Post('suppliers/register') supplierRegister(@Body() b: SupplierRegisterDto) { const user = this.service.makeSupplierUser(b); return user; }
  @Get('suppliers/products') async supplierProducts(@Req() req: Request) { const u = await this.auth(req); const s = this.service.supplierFor(u.id); return this.service.products.filter(p => p.supplierId === s.id); }
  @Get('admin/dashboard') async admin(@Req() req: Request) { const u = await this.auth(req); this.service.requireRole(u, ['admin']); return { users: this.service.users.length, products: this.service.products.length, orders: this.service.orders.length, pendingSuppliers: this.service.suppliers.filter(s => s.status === 'pending').length }; }
  @Post('contact') contact(@Body() body: any) { if (!body.name || !body.email || !body.message) throw new UnauthorizedException('All fields are required'); return { message: 'Thanks, your message has been received.' }; }
}
