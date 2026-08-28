import { Module } from '@nestjs/common';
import { NotificationsListener } from './notifications.listener';
import { NotificationsController } from './notifications.controller';
import { PushService } from './push.service';

@Module({
  controllers: [NotificationsController],
  providers: [NotificationsListener, PushService],
})
export class NotificationsModule {}
