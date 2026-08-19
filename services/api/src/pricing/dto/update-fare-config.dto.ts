import { IsNumber, Min } from 'class-validator';

export class UpdateFareConfigDto {
  @IsNumber()
  @Min(0)
  baseFare!: number;

  @IsNumber()
  @Min(0)
  perKmRate!: number;

  @IsNumber()
  @Min(0)
  platformFee!: number;
}
