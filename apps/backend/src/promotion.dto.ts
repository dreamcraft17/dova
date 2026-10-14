import { IsBoolean, IsOptional, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreatePromotionDto {
  @IsString() @MinLength(2) @MaxLength(120) title!: string;
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  imageUrl?: string;
  @IsOptional()
  @Transform(({ value }) => (value === '' || value == null ? undefined : value))
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  linkUrl?: string;
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  isActive?: boolean;
}

export class UpdatePromotionDto extends CreatePromotionDto {}

export class PromotionActiveDto {
  @Transform(({ value }) => value === true || value === 'true' || value === 1 || value === '1')
  @IsBoolean()
  active!: boolean;
}
