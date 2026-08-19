import { IsString, IsUrl, IsOptional } from 'class-validator';

export class CreateVehicleDto {
  @IsString()
  plateNumber!: string;

  @IsString()
  model!: string;

  @IsString()
  color!: string;

  @IsUrl()
  @IsOptional()
  imageUrl?: string;
}
