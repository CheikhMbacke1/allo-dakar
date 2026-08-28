import { IsEnum } from 'class-validator';
import { BookingStatus } from '@allo-dakar/shared';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
