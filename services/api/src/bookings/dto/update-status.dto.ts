import { IsEnum, IsOptional, IsString } from 'class-validator';
import { BookingStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;

  @IsString()
  @IsOptional()
  reason?: string;
}
