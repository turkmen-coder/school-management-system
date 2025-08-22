import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { EmailService } from './providers/email.service';
import { SmsService } from './providers/sms.service';
import { TemplateService } from './templates/template.service';
import { EventsConsumer } from './consumers/events.consumer';

@Module({
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    TemplateService,
    EventsConsumer,
  ],
  exports: [NotificationsService],
})
export class NotificationsModule {}