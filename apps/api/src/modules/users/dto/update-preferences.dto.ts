import { IsArray, IsOptional, IsNumber, IsEnum, IsString } from 'class-validator';
import { VehicleType } from '@allo-dakar/shared';

export class UpdatePreferencesDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteCities?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  frequentDestinations?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredDays?: string[];

  @IsOptional()
  @IsNumber()
  maxBudget?: number;

  @IsOptional()
  @IsEnum(VehicleType)
  preferredVehicleType?: VehicleType;
}
