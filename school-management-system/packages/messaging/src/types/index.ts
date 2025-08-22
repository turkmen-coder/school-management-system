export interface EventMetadata {
  correlationId?: string;
  causationId?: string;
  userId?: string;
  tenantId?: string;
  source?: string;
}

export enum EventTopics {
  STUDENT_EVENTS = 'student.events',
  PAYMENT_EVENTS = 'payment.events',
  EXAM_EVENTS = 'exam.events',
  NOTIFICATION_EVENTS = 'notification.events',
}

export enum EventTypes {
  // Student Events
  STUDENT_CREATED = 'student.created',
  STUDENT_UPDATED = 'student.updated',
  STUDENT_ENROLLED = 'student.enrolled',
  
  // Payment Events
  PAYMENT_PROCESSED = 'payment.processed',
  PAYMENT_FAILED = 'payment.failed',
  INSTALLMENT_DUE = 'installment.due',
  
  // Exam Events
  EXAM_CREATED = 'exam.created',
  EXAM_APPLICATION_CREATED = 'exam.application.created',
  EXAM_RESULT_PUBLISHED = 'exam.result.published',
  
  // Notification Events
  NOTIFICATION_SEND = 'notification.send',
}