import { IsPhoneNumber, IsString, Length, IsOptional } from 'class-validator';

export class VerifyOtpDto {
  @IsPhoneNumber('SN')
  phone!: string;

  @IsString()
  @Length(4, 6)
  code!: string;

  // Requis uniquement si c'est une première inscription (nouveau numéro)
  @IsOptional()
  @IsString()
  fullName?: string;
}
