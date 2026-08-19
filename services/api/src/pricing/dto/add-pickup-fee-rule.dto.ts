import { IsNumber, Min } from 'class-validator';

export class AddPickupFeeRuleDto {
  @IsNumber()
  @Min(0)
  minDistanceKm!: number;

  @IsNumber()
  @Min(0)
  maxDistanceKm!: number;

  @IsNumber()
  @Min(0)
  fee!: number;
}
