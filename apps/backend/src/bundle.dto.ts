import { ArrayMinSize, IsArray, IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUrl, Min, MinLength, ValidateNested } from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class BundleContentInputDto {
  @IsString() productId!: string;
  /** Same fractional-quantity precision as products (kg/L components). */
  @Transform(({ value }) => Number(value)) @IsNumber({ maxDecimalPlaces: 2 }) @Min(0.01) quantity!: number;
  @IsOptional() @Transform(({ value }) => Number(value)) @IsNumber() position?: number;
}

export class CreateBundleDto {
  @IsString() @MinLength(2) name!: string;
  @IsString() @MinLength(2) description!: string;
  @IsOptional() @IsString() categoryId?: string;
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  imageUrl?: string;
  @Transform(({ value }) => Number(value)) @IsNumber() @Min(1) bundlePrice!: number;
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  isFeatured?: boolean;
  /** At least two distinct products — a one-product "bundle" is just that product. */
  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => BundleContentInputDto)
  contents!: BundleContentInputDto[];
}

export class UpdateBundleDto extends CreateBundleDto {}

export class BundleActiveDto {
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  active!: boolean;
}

export class AddBundleToCartDto {
  @IsString() bundleId!: string;
  @Transform(({ value }) => Number(value)) @IsNumber() @Min(1) quantity!: number;
  @IsString() @IsIn(['morning', 'evening']) deliverySlot!: 'morning' | 'evening';
}
