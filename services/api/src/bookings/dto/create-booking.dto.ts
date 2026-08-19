import { IsNumber, IsString, IsOptional, Min, Max } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  pickupLat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  pickupLng!: number;

  @IsString()
  @IsOptional()
  pickupAddress?: string;

  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLat!: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLng!: number;

  @IsString()
  @IsOptional()
  destinationAddress?: string;

  @IsString()
  serviceAreaId!: string;
}
