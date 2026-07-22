import { IsEmail, IsInt, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString() @MinLength(2) fullName!: string;
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
  @IsString() @MinLength(8) confirmPassword!: string;
}

export class LoginDto {
  @IsEmail() email!: string;
  @IsString() @MinLength(8) password!: string;
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
  @IsInt() @Min(1) quantity!: number;
}

export class CartUpdateDto {
  @IsInt() @Min(1) quantity!: number;
}

export class CreateOrderDto {
  @IsString() @MinLength(2) deliveryName!: string;
  @IsString() @MinLength(5) deliveryAddress!: string;
  @IsString() @MinLength(7) deliveryPhone!: string;
}

export class PaymentInitializeDto {
  @IsString() orderId!: string;
  @IsNumber() @Min(0) amount!: number;
}
