import { DomainEvent } from './base.event';

export class StudentRegisteredEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly tenantId: string,
    public readonly campusId: string,
    public readonly studentData: {
      tcNo: string;
      firstName: string;
      lastName: string;
      classLevel: number;
    }
  ) {
    super('student.registered', studentId, { tenantId, campusId });
  }

  getEventData() {
    return this.studentData;
  }
}

export class StudentActivatedEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly tenantId: string
  ) {
    super('student.activated', studentId, { tenantId });
  }

  getEventData() {
    return { studentId: this.studentId };
  }
}

export class StudentDeactivatedEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly tenantId: string,
    public readonly reason?: string
  ) {
    super('student.deactivated', studentId, { tenantId });
  }

  getEventData() {
    return { 
      studentId: this.studentId,
      reason: this.reason 
    };
  }
}

export class StudentGraduatedEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly tenantId: string,
    public readonly graduationDate: Date
  ) {
    super('student.graduated', studentId, { tenantId });
  }

  getEventData() {
    return { 
      studentId: this.studentId,
      graduationDate: this.graduationDate 
    };
  }
}

export class StudentTransferredEvent extends DomainEvent {
  constructor(
    public readonly studentId: string,
    public readonly fromTenantId: string,
    public readonly toTenantId: string,
    public readonly transferDate: Date
  ) {
    super('student.transferred', studentId, { fromTenantId, toTenantId });
  }

  getEventData() {
    return { 
      studentId: this.studentId,
      fromTenantId: this.fromTenantId,
      toTenantId: this.toTenantId,
      transferDate: this.transferDate 
    };
  }
}