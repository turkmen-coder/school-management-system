import { v4 as uuidv4 } from 'uuid';

export abstract class DomainEvent {
  public readonly eventId: string;
  public readonly eventType: string;
  public readonly aggregateId: string;
  public readonly occurredAt: Date;
  public readonly metadata: Record<string, any>;

  constructor(
    eventType: string,
    aggregateId: string,
    metadata: Record<string, any> = {}
  ) {
    this.eventId = uuidv4();
    this.eventType = eventType;
    this.aggregateId = aggregateId;
    this.occurredAt = new Date();
    this.metadata = metadata;
  }

  public abstract getEventData(): any;

  public toJSON() {
    return {
      eventId: this.eventId,
      eventType: this.eventType,
      aggregateId: this.aggregateId,
      occurredAt: this.occurredAt,
      metadata: this.metadata,
      data: this.getEventData()
    };
  }
}