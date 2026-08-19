import { IsEnum } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class RecordPaymentDto {
  @IsEnum(PaymentMethod)
  method!: PaymentMethod;
}
