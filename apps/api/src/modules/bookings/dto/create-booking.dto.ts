import { IsString, IsInt, Min, IsOptional, IsNumber } from 'class-validator';

export class CreateBookingDto {
  @IsString()
  availabilityId!: string;

  @IsInt()
  @Min(1)
  seatsBooked!: number;

  @IsOptional()
  @IsString()
  pickupAddress?: string;

  @IsOptional()
  @IsNumber()
  pickupLat?: number;

  @IsOptional()
  @IsNumber()
  pickupLng?: number;

  @IsOptional()
  @IsString()
  pickupInstructions?: string;
}
