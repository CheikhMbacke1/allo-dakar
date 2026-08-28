import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConsoleSmsProvider } from './sms.provider';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_SECRET'),
        signOptions: { expiresIn: '30d' }, // usage mobile : sessions longues, refresh géré en phase 2
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    { provide: 'SMS_PROVIDER', useClass: ConsoleSmsProvider },
    // Guards appliqués globalement : toute route est protégée par défaut,
    // sauf celles marquées @Public() (ex. auth/otp/request, auth/otp/verify).
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
