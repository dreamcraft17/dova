import { ArrayMaxSize, ArrayMinSize, ArrayUnique, IsArray, IsBoolean, IsEmail, IsIn, IsInt, IsLatitude, IsLongitude, IsNumber, IsOptional, IsString, IsUrl, Length, Min, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class RegisterDto {
  @IsString() @MinLength(2) fullName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsString() @MinLength(8) confirmPassword!: string;
  @IsString() @Length(6, 6) code!: string;
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  rememberMe?: boolean;
}

export class SendRegistrationCodeDto {
  @IsEmail() email!: string;
  @IsOptional() @IsString() @MinLength(2) fullName?: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  rememberMe?: boolean;
}

export class RefreshTokenDto {
  @IsOptional() @IsString() refreshToken?: string;
}

export class VerifyOtpDto {
  @IsEmail() email!: string;
  @IsString() @Length(6, 6) code!: string;
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  rememberMe?: boolean;
}

export class ResendOtpDto {
  @IsEmail() email!: string;
}

export class ForgotPasswordDto {
  @IsEmail() email!: string;
}

export class ResetPasswordDto {
  @IsEmail() email!: string;
  @IsString() @Length(6, 6) code!: string;
  @IsString() @MinLength(8) password!: string;
  @IsString() @MinLength(8) confirmPassword!: string;
}

export class UpdateNotificationPreferencesDto {
  @IsOptional() @IsBoolean() newOrderAlerts?: boolean;
  @IsOptional() @IsBoolean() orderStatusUpdates?: boolean;
  @IsOptional() @IsBoolean() productApprovalUpdates?: boolean;
  @IsOptional() @IsBoolean() marketingUpdates?: boolean;
}

export class UpdatePayoutPreferencesDto {
  @IsString() @MinLength(2) bankName!: string;
  @IsString() @MinLength(2) accountName!: string;
  @IsString() @Length(10, 10) accountNumber!: string;
}

export class RequestAccountClosureDto {
  @IsString() @MinLength(8) currentPassword!: string;
  @IsOptional() @IsString() @MinLength(3) reason?: string;
}

export class SupplierRegisterDto {
  @IsString() @MinLength(2) businessName!: string;
  @IsOptional() @IsString() contactName?: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() documentUrl?: string;
}

export class CartAddDto {
  @IsString() productId!: string;
  /** Most products are sold by weight (kg/L) — quantity may be fractional, e.g. 1.5. 500g is the smallest pack size. */
  @Transform(({ value }) => Number(value)) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.5) quantity!: number;
  @IsString() @IsIn(['morning', 'evening']) deliverySlot!: 'morning' | 'evening';
}

export class CartUpdateDto {
  @IsOptional() @Transform(({ value }) => Number(value)) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.5) quantity?: number;
  @IsOptional() @IsString() @IsIn(['morning', 'evening']) deliverySlot?: 'morning' | 'evening';
}

export class CreateOrderDto {
  @IsString() @MinLength(2) deliveryName!: string;
  /** Required for delivery; pickup may send hub placeholder from the client. */
  @IsOptional() @IsString() @MinLength(5) deliveryAddress?: string;
  @IsOptional() @Transform(({ value }) => (value == null || value === '' ? undefined : String(value))) @IsLatitude() deliveryLatitude?: string;
  @IsOptional() @Transform(({ value }) => (value == null || value === '' ? undefined : String(value))) @IsLongitude() deliveryLongitude?: string;
  @IsString() @MinLength(7) deliveryPhone!: string;
  @IsOptional() @IsIn(['pickup', 'delivery']) fulfillmentType?: 'pickup' | 'delivery';
  @IsString() @MinLength(2) deliveryState!: string;
  /** Required for delivery; drives the zone-based delivery fee. Ignored for pickup. */
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsIn(['yenagoa', 'outside_yenagoa'])
  deliveryZone?: 'yenagoa' | 'outside_yenagoa';
}

export class ContactDto {
  @IsString() @MinLength(2) name!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(5) message!: string;
}

export class PaymentInitializeDto {
  @IsString() orderId!: string;
  @Transform(({ value }) => Number(value)) @IsNumber() @Min(0) amount!: number;
}

export class ProductDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @MinLength(2) description!: string;
  @Transform(({ value }) => Number(value)) @IsNumber() @Min(1000) price!: number;
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) quantity!: number;
  @IsString() categoryId!: string;
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  imageUrl?: string;
}

export class StockDto {
  @Transform(({ value }) => Number(value)) @IsInt() @Min(1) quantity!: number;
  @IsIn(['restock', 'damage']) reason!: 'restock' | 'damage';
}

export class OrderStatusDto {
  @IsIn(['processing', 'shipped', 'delivered']) status!: 'processing' | 'shipped' | 'delivered';
}

export class BulkProductActiveDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayUnique()
  @IsString({ each: true })
  ids!: string[];
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  active!: boolean;
}

export class SupplierRejectDto {
  @IsString() @MinLength(3) reason!: string;
}

export class AdminUpdateUserDto {
  @IsString() @MinLength(2) fullName!: string;
  @IsEmail() email!: string;
  @IsOptional() @IsString() phoneNumber?: string;
  @IsIn(['customer', 'supplier', 'admin']) role!: 'customer' | 'supplier' | 'admin';
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  isActive!: boolean;
}

export class AdminResetPasswordDto {
  @IsString() @MinLength(8) password!: string;
}

export class UpdateProfileDto {
  @IsString() @MinLength(2) fullName!: string;
  @IsOptional() @IsString() @MinLength(7) phoneNumber?: string;
}

export class ChangePasswordDto {
  @IsString() @MinLength(8) currentPassword!: string;
  @IsString() @MinLength(8) newPassword!: string;
  @IsString() @MinLength(8) confirmPassword!: string;
}
