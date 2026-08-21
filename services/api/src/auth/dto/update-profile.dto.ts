import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @MinLength(1)
  @IsOptional()
  firstName?: string;

  @IsString()
  @MinLength(1)
  @IsOptional()
  lastName?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  /** Profile photo as a data URL (resized client-side). Send null to remove. */
  @IsString()
  @MaxLength(1_500_000)
  @IsOptional()
  avatarUrl?: string | null;
}
