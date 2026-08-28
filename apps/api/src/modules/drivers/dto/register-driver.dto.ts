import { IsOptional, IsString, IsUrl } from 'class-validator';

export class RegisterDriverDto {
  @IsOptional()
  @IsUrl()
  idDocumentUrl?: string;

  @IsOptional()
  @IsUrl()
  licenseDocumentUrl?: string;

  @IsOptional()
  @IsString()
  bio?: string;
}
