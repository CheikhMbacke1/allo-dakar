import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, JwtPayload } from '@allo-dakar/shared';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Roles(UserRole.CLIENT)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(user.sub, dto);
  }

  @Roles(UserRole.CLIENT)
  @Get('mine')
  listMine(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.listForClient(user.sub);
  }

  @Roles(UserRole.CHAUFFEUR)
  @Get('driver')
  listForDriver(@CurrentUser() user: JwtPayload) {
    return this.bookingsService.listForDriver(user.sub);
  }

  @Patch(':id/status')
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
  ) {
    return this.bookingsService.updateStatus(user, id, dto);
  }
}
