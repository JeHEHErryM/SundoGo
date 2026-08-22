import { IsString, IsOptional, MaxLength } from 'class-validator';

export class TriggerEmergencyAlertDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  message?: string;
}
