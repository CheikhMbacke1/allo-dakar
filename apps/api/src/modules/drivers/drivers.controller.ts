import { Body, Controller, Get, Param, Post, Patch } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { RegisterDriverDto } from './dto/register-driver.dto';
import { ReviewDriverDto } from './dto/review-driver.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { UserRole, JwtPayload } from '@allo-dakar/shared';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post('register')
  register(@CurrentUser() user: JwtPayload, @Body() dto: RegisterDriverDto) {
    return this.driversService.register(user.sub, dto);
  }

  @Roles(UserRole.ADMIN)
  @Get('pending')
  listPending() {
    return this.driversService.listPending();
  }

  @Roles(UserRole.ADMIN)
  @Patch(':driverId/review')
  review(
    @Param('driverId') driverId: string,
    @Body() dto: ReviewDriverDto,
    @CurrentUser() admin: JwtPayload,
  ) {
    return this.driversService.review(driverId, dto, admin.sub);
  }
}
