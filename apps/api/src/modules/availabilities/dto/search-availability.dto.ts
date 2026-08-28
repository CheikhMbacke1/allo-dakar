import { IsString, IsOptional, IsDateString } from 'class-validator';

export class SearchAvailabilityDto {
  @IsString()
  originCity!: string;

  @IsString()
  destinationCity!: string;

  @IsOptional()
  @IsDateString()
  travelDate?: string;
}
