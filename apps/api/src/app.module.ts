import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { VehiclesModule } from './modules/vehicles/vehicles.module';
import { AvailabilitiesModule } from './modules/availabilities/availabilities.module';
import { BookingsModule } from './modules/bookings/bookings.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AdminModule } from './modules/admin/admin.module';
import { MessagesModule } from './modules/messages/messages.module';
import { RatingsModule } from './modules/ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 30 }]), // anti-spam OTP/API de base
    EventEmitterModule.forRoot(), // permet à AvailabilitiesModule d'émettre "availability.created"
    PrismaModule,
    AuthModule,
    UsersModule,
    DriversModule,
    VehiclesModule,
    AvailabilitiesModule,
    BookingsModule,
    NotificationsModule,
    AdminModule,
    MessagesModule,
    RatingsModule,
  ],
})
export class AppModule {}
