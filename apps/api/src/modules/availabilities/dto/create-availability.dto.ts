import {
  IsString,
  IsDateString,
  IsInt,
  Min,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsArray,
  Matches,
} from 'class-validator';

export class CreateAvailabilityDto {
  @IsString()
  originCity!: string;

  @IsOptional()
  @IsString()
  originZone?: string;

  @IsString()
  destinationCity!: string;

  @IsDateString()
  travelDate!: string; // format YYYY-MM-DD

  @Matches(/^\d{2}:\d{2}$/, { message: 'Format attendu HH:mm' })
  departureTime!: string;

  @IsOptional()
  @Matches(/^\d{2}:\d{2}$/, { message: 'Format attendu HH:mm' })
  availabilityEndTime?: string;

  @IsInt()
  @Min(1)
  seatsTotal!: number;

  @IsNumber()
  @Min(0)
  pricePerSeat!: number;

  @IsOptional()
  @IsBoolean()
  homePickupAvailable?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  pickupZones?: string[];

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  vehicleId?: string;
}
