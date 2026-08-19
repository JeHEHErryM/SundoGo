import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateDriverDto {
  @IsString()
  firstName!: string;

  @IsString()
  lastName!: string;

  @IsString()
  phone!: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;
}
