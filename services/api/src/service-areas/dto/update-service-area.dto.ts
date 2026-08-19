import { IsString, IsBoolean, IsOptional, IsNumber, IsObject, Min } from 'class-validator';
import { Prisma } from '@prisma/client';

export class UpdateServiceAreaDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsObject()
  @IsOptional()
  geofence?: Prisma.InputJsonValue;

  @IsNumber()
  @Min(0)
  @IsOptional()
  maxBookingRadiusKm?: number;
}
