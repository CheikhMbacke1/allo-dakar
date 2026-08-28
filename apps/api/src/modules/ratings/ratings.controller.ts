import { Body, Controller, Param, Post } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '@allo-dakar/shared';

@Controller('bookings/:bookingId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post()
  create(
    @CurrentUser() user: JwtPayload,
    @Param('bookingId') bookingId: string,
    @Body() dto: CreateRatingDto,
  ) {
    return this.ratingsService.create(user.sub, bookingId, dto);
  }
}
