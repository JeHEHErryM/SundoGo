import { IsString } from 'class-validator';

export class CreateEmergencyContactDto {
  @IsString()
  name!: string;

  @IsString()
  phone!: string;

  @IsString()
  relationship!: string;
}
