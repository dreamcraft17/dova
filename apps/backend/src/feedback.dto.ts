import { IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class FeedbackPostDto {
  @IsString() @MinLength(3) title!: string;
  @IsString() @MinLength(10) description!: string;
  @IsOptional() @IsString() @MinLength(2) authorName?: string;
  @IsOptional() @IsString() authorEmail?: string;
}

export class FeedbackStatusDto {
  @IsIn(['open', 'planned', 'in_progress', 'done']) status!: 'open' | 'planned' | 'in_progress' | 'done';
}

export class FeedbackCommentDto {
  @IsString() @MinLength(2) body!: string;
  @IsOptional() @IsString() @MinLength(2) authorName?: string;
}

export class ChangelogDto {
  @IsString() @MinLength(3) title!: string;
  @IsString() @MinLength(10) summary!: string;
  @IsString() @MinLength(10) body!: string;
}
