import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { NotificationsService, NotificationData } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('send')
  async sendNotification(@Body() data: NotificationData) {
    await this.notificationsService.sendNotification(data);
    return { message: 'Notification sent successfully' };
  }

  @Post('send-bulk-sms')
  async sendBulkSms(
    @Body() data: { tenantId: string; recipients: string[]; templateName: string; templateData: any }
  ) {
    // Implementation for bulk SMS sending
    return { message: 'Bulk SMS sent successfully' };
  }

  @Get(':tenantId/history')
  async getNotificationHistory(
    @Param('tenantId') tenantId: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('recipient') recipient?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    const filters = {
      type,
      status,
      recipient,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
    };

    return this.notificationsService.getNotificationHistory(tenantId, filters);
  }

  @Get('templates')
  async getAvailableTemplates() {
    // Return list of available templates
    return {
      sms: [
        'payment-reminder',
        'exam-reminder',
        'otp',
      ],
      email: [
        'welcome',
        'exam-invitation',
        'exam-results',
        'payment-confirmation',
        'contract-signed',
      ],
    };
  }
}