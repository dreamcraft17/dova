import { Controller, Body, Delete, Get, Param, Post, Put, Query, UnauthorizedException } from '@nestjs/common';
import { AppService } from './app.service';
import { CartAddDto, CartUpdateDto, CreateOrderDto } from './auth.dto';
import { CurrentUser, Public, Roles } from './auth.decorators';
import { StoredUser } from './database.service';

@Controller()
export class CatalogCartController {
  constructor(private readonly service: AppService) {}

  @Public()
  @Get('categories') categories() { return this.service.listCategories(); }

  @Public()
  @Get('products') products(@Query('search') search = '', @Query('categoryId') categoryId = '', @Query('page') page = '1', @Query('limit') limit = '50') {
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
}
