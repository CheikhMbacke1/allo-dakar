import { IsString, IsInt, IsOptional, IsEnum, IsArray, Min, Max } from 'class-validator';
import { VehicleType } from '@allo-dakar/shared';

export class CreateVehicleDto {
  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() model?: string;
  @IsOptional() @IsInt() @Min(1980) @Max(new Date().getFullYear() + 1) year?: number;
  @IsOptional() @IsString() color?: string;

  @IsString()
  plateNumber!: string;

  @IsInt()
  @Min(1)
  @Max(30)
  seats!: number;

  @IsOptional()
  @IsEnum(VehicleType)
  vehicleType?: VehicleType;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
