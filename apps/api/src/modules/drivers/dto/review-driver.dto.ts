import { IsEnum } from 'class-validator';
import { DriverStatus } from '@allo-dakar/shared';

export class ReviewDriverDto {
  @IsEnum(DriverStatus)
  status!: DriverStatus;
}
