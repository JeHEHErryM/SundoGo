import { IsUrl } from 'class-validator';

export class SubmitVerificationDto {
  @IsUrl()
  idDocumentUrl!: string;

  @IsUrl()
  licenseUrl!: string;

  @IsUrl()
  vehicleRegistrationUrl!: string;
}
