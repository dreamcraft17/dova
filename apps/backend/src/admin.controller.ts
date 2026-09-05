import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { AdminResetPasswordDto, AdminUpdateUserDto, SupplierRejectDto } from './auth.dto';
import { CurrentUser, Roles } from './auth.decorators';
import { StoredUser } from './database.service';

@Controller()
export class AdminController {
  constructor(private readonly service: AppService) {}

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
  @Get('admin/users/:id') adminUser(@Param('id') id: string) { return this.service.adminUser(id); }

  @Roles('admin')
  @Put('admin/users/:id') updateAdminUser(@Param('id') id: string, @Body() body: AdminUpdateUserDto, @CurrentUser() actor: StoredUser) {
    return this.service.updateAdminUser(id, body, actor.id);
  }

  @Roles('admin')
  @Post('admin/users/:id/reset-password') adminResetPassword(@Param('id') id: string, @Body() body: AdminResetPasswordDto) {
    return this.service.adminResetPassword(id, body.password);
  }

  @Roles('admin')
  @Put('admin/users/:id/active') userActive(@Param('id') id: string, @Body('active') active: boolean, @CurrentUser() actor: StoredUser) {
    return this.service.setUserActive(id, Boolean(active), actor.id);
  }

  @Roles('admin')
  @Delete('admin/users/:id') deleteAdminUser(@Param('id') id: string, @CurrentUser() actor: StoredUser) {
    return this.service.deleteAdminUser(id, actor.id);
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
}
