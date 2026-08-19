import { IsNumber, IsOptional } from 'class-validator';

export class AddLocationDto {
  @IsNumber()
  lat!: number;

  @IsNumber()
  lng!: number;

  @IsNumber()
  @IsOptional()
  speed?: number;
}
