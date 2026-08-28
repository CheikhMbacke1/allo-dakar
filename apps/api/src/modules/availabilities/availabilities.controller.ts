import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { SearchAvailabilityDto } from './dto/search-availability.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { UserRole, JwtPayload } from '@allo-dakar/shared';

@Controller('availabilities')
export class AvailabilitiesController {
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Roles(UserRole.CHAUFFEUR)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateAvailabilityDto) {
    return this.availabilitiesService.create(user.sub, dto);
  }

  // Recherche publique : un visiteur non connecté doit pouvoir voir l'offre
  // avant de créer un compte (frein à l'inscription sinon).
  @Public()
  @Get('search')
  search(@Query() dto: SearchAvailabilityDto) {
    return this.availabilitiesService.search(dto);
  }

  @Roles(UserRole.CHAUFFEUR)
  @Get('mine')
  listMine(@CurrentUser() user: JwtPayload) {
    return this.availabilitiesService.listMine(user.sub);
  }

  @Roles(UserRole.CHAUFFEUR)
  @Patch(':id/cancel')
  cancel(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.availabilitiesService.cancel(user.sub, id);
  }
}
