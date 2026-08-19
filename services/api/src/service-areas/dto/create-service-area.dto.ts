import { IsString, IsBoolean, IsOptional, IsNumber, IsObject, Min } from 'class-validator';
import { Prisma } from '@prisma/client';

export class CreateServiceAreaDto {
  @IsString()
  name!: string;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;

  @IsObject()
  geofence!: Prisma.InputJsonValue;

  @IsNumber()
  @Min(0)
  maxBookingRadiusKm!: number;
}
