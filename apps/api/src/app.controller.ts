import { Controller, Get } from '@nestjs/common';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  health() {
    return {
      status: 'ok',
      service: 'allo-dakar-api',
      message: "L'API fonctionne. Voir la documentation pour les endpoints disponibles (ex. POST /auth/otp/request).",
    };
  }
}
