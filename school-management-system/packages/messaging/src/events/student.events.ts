import { DomainEvent } from './base.event';

export class StudentCreatedEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly tenantId: string,
    public readonly campusId: string,
    public readonly studentData: {
      firstName: string;
      lastName: string;
      tcNo: string;
      classLevel: number;
      schoolYear: string;
    }
  ) {
    super(studentId, 'student.created', tenantId);
  }
}

export class StudentUpdatedEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly tenantId: string,
    public readonly changes: Record<string, any>
  ) {
    super(studentId, 'student.updated', tenantId);
  }
}

export class StudentEnrolledEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly tenantId: string,
    public readonly contractId: string,
    public readonly enrollmentData: {
      schoolYear: string;
      classLevel: number;
      totalAmount: number;
    }
  ) {
    super(studentId, 'student.enrolled', tenantId);
  }
}