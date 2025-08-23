import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@school/persistence';
import { EmailService } from './providers/email.service';
import { SmsService } from './providers/sms.service';
import { TemplateService } from './templates/template.service';

export interface NotificationData {
  tenantId: string;
  type: 'SMS' | 'EMAIL';
  recipient: string;
  subject?: string;
  templateName: string;
  templateData: any;
  priority?: 'LOW' | 'NORMAL' | 'HIGH';
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly templateService: TemplateService,
  ) {}

  async sendNotification(data: NotificationData): Promise<void> {
    try {
      // Create notification record
      const notification = await this.prisma.notification.create({
        data: {
          tenantId: data.tenantId,
          recipient: data.recipient,
          type: data.type,
          subject: data.subject,
          content: JSON.stringify({
            templateName: data.templateName,
            templateData: data.templateData,
          }),
          status: 'PENDING',
        },
      });

      // Generate content from template
      const content = await this.templateService.render(
        data.templateName,
        data.templateData,
      );

      // Send notification based on type
      if (data.type === 'EMAIL') {
        await this.emailService.sendEmail({
          to: data.recipient,
          subject: data.subject || 'Bildirim',
          html: content,
        });
      } else if (data.type === 'SMS') {
        await this.smsService.sendSms(data.recipient, content);
      }

      // Update notification status
      await this.prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: 'SENT',
          sentAt: new Date(),
        },
      });

      this.logger.log(`Notification sent successfully: ${notification.id}`);
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
      
      // Update notification status to failed
      await this.prisma.notification.updateMany({
        where: {
          tenantId: data.tenantId,
          recipient: data.recipient,
          status: 'PENDING',
        },
        data: {
          status: 'FAILED',
          error: (error as Error).message,
        },
      });

      throw error;
    }
  }

  async sendPaymentReminder(
    tenantId: string,
    phone: string,
    studentName: string,
    amount: number,
    dueDate: Date,
  ): Promise<void> {
    await this.sendNotification({
      tenantId,
      type: 'SMS',
      recipient: phone,
      templateName: 'payment-reminder',
      templateData: {
        studentName,
        amount,
        dueDate,
      },
    });
  }

  async sendExamInvitation(
    tenantId: string,
    email: string,
    examName: string,
    examDate: Date,
    venue: string,
  ): Promise<void> {
    await this.sendNotification({
      tenantId,
      type: 'EMAIL',
      recipient: email,
      subject: `Sınav Davetiyesi - ${examName}`,
      templateName: 'exam-invitation',
      templateData: {
        examName,
        examDate,
        venue,
      },
    });
  }

  async sendExamResults(
    tenantId: string,
    email: string,
    studentName: string,
    examName: string,
    score: number,
    passed: boolean,
  ): Promise<void> {
    await this.sendNotification({
      tenantId,
      type: 'EMAIL',
      recipient: email,
      subject: `Sınav Sonucu - ${examName}`,
      templateName: 'exam-results',
      templateData: {
        studentName,
        examName,
        score,
        passed,
      },
    });
  }

  async sendWelcomeMessage(
    tenantId: string,
    email: string,
    parentName: string,
    studentName: string,
    schoolName: string,
  ): Promise<void> {
    await this.sendNotification({
      tenantId,
      type: 'EMAIL',
      recipient: email,
      subject: `${schoolName}'a Hoş Geldiniz`,
      templateName: 'welcome',
      templateData: {
        parentName,
        studentName,
        schoolName,
      },
    });
  }

  async getNotificationHistory(
    tenantId: string,
    filters?: {
      type?: string;
      status?: string;
      recipient?: string;
      dateFrom?: Date;
      dateTo?: Date;
    },
  ): Promise<any[]> {
    const where: any = { tenantId };

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;
    if (filters?.recipient) where.recipient = { contains: filters.recipient };
    if (filters?.dateFrom || filters?.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    return this.prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}