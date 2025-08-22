import { Injectable } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { NotificationsService } from '../notifications.service';
import { PrismaService } from '@school/persistence';

@Injectable()
export class EventsConsumer {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  @EventPattern('student.enrolled')
  async handleStudentEnrolled(data: any) {
    try {
      // Get parent contact information
      const student = await this.prisma.student.findUnique({
        where: { id: data.studentId },
        include: {
          tenant: true,
          parentRelations: {
            include: { parent: true },
            where: { isPrimary: true },
          },
        },
      });

      if (student && student.parentRelations[0]) {
        const parent = student.parentRelations[0].parent;
        
        await this.notificationsService.sendWelcomeMessage(
          data.tenantId,
          parent.email,
          `${parent.firstName} ${parent.lastName}`,
          `${student.firstName} ${student.lastName}`,
          student.tenant.name,
        );
      }
    } catch (error) {
      console.error('Error handling student enrolled event:', error);
    }
  }

  @EventPattern('payment.processed')
  async handlePaymentProcessed(data: any) {
    try {
      // Get contract and parent information
      const contract = await this.prisma.contract.findUnique({
        where: { id: data.contractId },
        include: {
          student: {
            include: {
              parentRelations: {
                include: { parent: true },
                where: { isPrimary: true },
              },
            },
          },
        },
      });

      if (contract && contract.student.parentRelations[0]) {
        const parent = contract.student.parentRelations[0].parent;
        
        // Send SMS confirmation
        await this.notificationsService.sendNotification({
          tenantId: data.tenantId,
          type: 'SMS',
          recipient: parent.phone,
          templateName: 'payment-confirmation',
          templateData: {
            amount: data.paymentData.amount,
            studentName: `${contract.student.firstName} ${contract.student.lastName}`,
            contractNo: contract.contractNo,
          },
        });
      }
    } catch (error) {
      console.error('Error handling payment processed event:', error);
    }
  }

  @EventPattern('installment.due')
  async handleInstallmentDue(data: any) {
    try {
      await this.notificationsService.sendPaymentReminder(
        data.tenantId,
        data.dueData.parentPhone,
        data.dueData.studentName,
        data.dueData.amount,
        data.dueData.dueDate,
      );
    } catch (error) {
      console.error('Error handling installment due event:', error);
    }
  }

  @EventPattern('exam.application.created')
  async handleExamApplicationCreated(data: any) {
    try {
      // Get exam information
      const exam = await this.prisma.exam.findUnique({
        where: { id: data.applicationData.examId },
        include: { campus: true },
      });

      if (exam) {
        // Send email invitation if email is available
        if (data.applicationData.email) {
          await this.notificationsService.sendExamInvitation(
            data.tenantId,
            data.applicationData.email,
            exam.name,
            exam.date,
            exam.campus.name,
          );
        }

        // Send SMS confirmation
        await this.notificationsService.sendNotification({
          tenantId: data.tenantId,
          type: 'SMS',
          recipient: data.applicationData.phone,
          templateName: 'exam-reminder',
          templateData: {
            examName: exam.name,
            examDate: exam.date,
            venue: exam.campus.name,
          },
        });
      }
    } catch (error) {
      console.error('Error handling exam application created event:', error);
    }
  }

  @EventPattern('exam.result.published')
  async handleExamResultPublished(data: any) {
    try {
      // Process each result
      for (const result of data.results) {
        const application = await this.prisma.examApplication.findUnique({
          where: { id: result.applicationId },
          include: {
            exam: true,
            prospect: true,
            student: true,
          },
        });

        if (application) {
          const candidate = application.prospect || application.student;
          const candidateName = `${candidate.firstName} ${candidate.lastName}`;
          
          // Send email if available
          const email = candidate.email || (application.student ? 
            (await this.prisma.studentParent.findFirst({
              where: { studentId: application.student.id, isPrimary: true },
              include: { parent: true },
            }))?.parent.email : null);

          if (email) {
            await this.notificationsService.sendExamResults(
              data.tenantId,
              email,
              candidateName,
              application.exam.name,
              result.score,
              result.passed,
            );
          }
        }
      }
    } catch (error) {
      console.error('Error handling exam result published event:', error);
    }
  }
}