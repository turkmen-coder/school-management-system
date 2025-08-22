import { DomainEvent } from './base.event';

export class PaymentProcessedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly contractId: string,
    public readonly paymentData: {
      amount: number;
      method: string;
      status: string;
      installmentId?: string;
    }
  ) {
    super(paymentId, 'payment.processed', tenantId);
  }
}

export class PaymentFailedEvent extends DomainEvent {
  constructor(
    public readonly paymentId: string,
    public readonly tenantId: string,
    public readonly error: {
      code: string;
      message: string;
    }
  ) {
    super(paymentId, 'payment.failed', tenantId);
  }
}

export class InstallmentDueEvent extends DomainEvent {
  constructor(
    public readonly installmentId: string,
    public readonly tenantId: string,
    public readonly contractId: string,
    public readonly dueData: {
      amount: number;
      dueDate: Date;
      studentName: string;
      parentPhone: string;
    }
  ) {
    super(installmentId, 'installment.due', tenantId);
  }
}