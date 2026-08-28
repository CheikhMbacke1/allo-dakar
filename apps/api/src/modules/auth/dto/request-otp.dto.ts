import { IsPhoneNumber, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '@allo-dakar/shared';

export class RequestOtpDto {
  @IsPhoneNumber('SN', { message: 'Numéro de téléphone invalide (format sénégalais attendu)' })
  phone!: string;

  // Utilisé uniquement lors de la toute première inscription pour
  // déclarer l'intention (client ou chauffeur) ; ignoré si le compte existe déjà.
  @IsOptional()
  @IsEnum(UserRole)
  intendedRole?: UserRole;
}
