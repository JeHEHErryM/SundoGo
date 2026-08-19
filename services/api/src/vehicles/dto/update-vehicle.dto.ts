import { IsString, IsUrl, IsOptional } from 'class-validator';

export class UpdateVehicleDto {
  @IsString()
  @IsOptional()
  plateNumber?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsString()
  @IsOptional()
  color?: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
