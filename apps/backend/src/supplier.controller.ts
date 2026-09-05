import { Body, Controller, Delete, Get, Param, Post, Put, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AppService } from './app.service';
import { OrderStatusDto, ProductDto, StockDto, SupplierRegisterDto } from './auth.dto';
import { CurrentUser, Public, Roles } from './auth.decorators';
import { StoredUser } from './database.service';
import { UploadStorageService } from './upload-storage.service';

const imageUpload = FileInterceptor('image', {
  limits: { fileSize: 5 * 1024 * 1024 },
});

const supplierDocUpload = FileInterceptor('verificationDocs', {
  limits: { fileSize: 5 * 1024 * 1024 },
});

@Controller()
export class SupplierController {
  constructor(
    private readonly service: AppService,
    private readonly uploads: UploadStorageService,
  ) {}

  private async applyProductImage(b: ProductDto, file?: { mimetype: string; buffer: Buffer }) {
    if (file) {
      b.imageUrl = await this.uploads.saveProductImage(file);
    } else if (b.imageUrl) {
      this.uploads.validateExternalImageUrl(b.imageUrl);
    }
    return b;
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('suppliers/register') @UseInterceptors(supplierDocUpload)
  async supplierRegister(@Body() b: SupplierRegisterDto, @UploadedFile() file?: { mimetype: string; buffer: Buffer }) {
    if (file) b.documentUrl = await this.uploads.saveSupplierDocument(file);
    return this.service.makeSupplierUser(b);
  }

  @Roles('supplier')
  @Get('suppliers/status') supplierStatus(@CurrentUser() user: StoredUser) { return this.service.supplierStatus(user.id); }

  @Roles('supplier')
  @Get('suppliers/products') supplierProducts(@CurrentUser() user: StoredUser) { return this.service.supplierProducts(user.id); }

  @Roles('supplier')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Post('suppliers/products') @UseInterceptors(imageUpload) async supplierProductCreate(@CurrentUser() user: StoredUser, @Body() b: ProductDto, @UploadedFile() file?: { mimetype: string; buffer: Buffer }) {
    return this.service.addSupplierProduct(user.id, await this.applyProductImage(b, file));
  }

  @Roles('supplier')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  @Put('suppliers/products/:id') @UseInterceptors(imageUpload) async supplierProductUpdate(@CurrentUser() user: StoredUser, @Param('id') id: string, @Body() b: ProductDto, @UploadedFile() file?: { mimetype: string; buffer: Buffer }) {
    return this.service.updateSupplierProduct(user.id, id, await this.applyProductImage(b, file));
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
}
