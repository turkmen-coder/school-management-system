import { DomainEvent } from './base.event';

export class ExamCreatedEvent extends DomainEvent {
  constructor(
    public readonly examId: string,
    public readonly tenantId: string,
    public readonly examData: {
      name: string;
      date: Date;
      duration: number;
      campusId: string;
    }
  ) {
    super(examId, 'exam.created', tenantId);
  }
}

export class ExamApplicationCreatedEvent extends DomainEvent {
  constructor(
    public readonly applicationId: string,
    public readonly tenantId: string,
    public readonly applicationData: {
      examId: string;
      prospectId?: string;
      studentId?: string;
      applicantName: string;
      phone: string;
    }
  ) {
    super(applicationId, 'exam.application.created', tenantId);
  }
}

export class ExamResultPublishedEvent extends DomainEvent {
  constructor(
    public readonly examId: string,
    public readonly tenantId: string,
    public readonly results: Array<{
      applicationId: string;
      score: number;
      passed: boolean;
    }>
  ) {
    super(examId, 'exam.result.published', tenantId);
  }
}